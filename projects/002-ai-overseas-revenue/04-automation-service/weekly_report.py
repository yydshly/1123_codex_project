"""Check and reconcile one week of two normalized ad exports."""

import argparse
import csv
from dataclasses import dataclass
from datetime import date, timedelta
from decimal import Decimal
import json
from pathlib import Path
import re
import sys


FIELDS = ("spend", "impressions", "clicks", "conversions")
REQUIRED = ("date", "account_id", "campaign_id", "currency", "timezone", *FIELDS)
SOURCES = {"google": "Google Ads", "meta": "Meta Ads"}
FIELD_LABELS = {"spend": "花费", "impressions": "展示", "clicks": "点击", "conversions": "平台归因转化"}
NUMBER = re.compile(r"[0-9]{1,18}(?:\.[0-9]{1,6})?")


class ReportError(ValueError):
    pass


@dataclass(frozen=True)
class Scope:
    start: date
    currency: str
    timezone: str

    @property
    def end(self):
        return self.start + timedelta(days=6)


@dataclass(frozen=True)
class SourceReport:
    account: str
    totals: dict
    rows: int
    warnings: tuple
    details: tuple = ()


def metric(field, raw):
    value = str(raw).strip()
    if not NUMBER.fullmatch(value):
        raise ReportError(f"{field} 必须是非负数字，收到 {value!r}。")
    number = Decimal(value)
    if field in ("impressions", "clicks") and number != number.to_integral_value():
        raise ReportError(f"{field} 必须是整数。")
    return number


def report_date(value):
    try:
        parsed = date.fromisoformat(value)
    except ValueError:
        raise ReportError(f"日期 {value!r} 应为 YYYY-MM-DD。") from None
    if value != parsed.isoformat():
        raise ReportError(f"日期 {value!r} 应为 YYYY-MM-DD。")
    return parsed


def read_export(file, label, scope, *, source_lines=None, trace_limit=0):
    reader = csv.DictReader(file, strict=True)
    headers = reader.fieldnames or []
    missing = [field for field in REQUIRED if field not in headers]
    if missing:
        raise ReportError(f"{label} 缺少字段 {', '.join(missing)}。")
    if len(headers) != len(set(headers)):
        raise ReportError(f"{label} 表头有重名字段。")
    seen = {}
    totals = dict.fromkeys(FIELDS, Decimal(0))
    warnings = []
    details = []
    account = ""
    for index, row in enumerate(reader):
        line = source_lines[index] if source_lines is not None else reader.line_num
        try:
            if None in row or any(row[field] is None for field in REQUIRED):
                raise ReportError("字段数与表头不符。")
            day = report_date(row["date"].strip())
            if not scope.start <= day <= scope.end:
                raise ReportError(f"日期 {day} 超出报告周。")
            if row["currency"].strip() != scope.currency:
                raise ReportError(f"币种 {row['currency']!r} 与报告币种 {scope.currency} 不符。")
            if row["timezone"].strip() != scope.timezone:
                raise ReportError(f"时区 {row['timezone']!r} 与报告时区 {scope.timezone} 不符。")
            row_account, campaign = row["account_id"].strip(), row["campaign_id"].strip()
            if not row_account or not campaign:
                raise ReportError("账户 ID 和广告系列 ID 都需要填写。")
            account = account or row_account
            if row_account != account:
                raise ReportError("同一来源出现多个账户。请选取该客户对应的一个账户。")
            values = tuple(metric(field, row[field]) for field in FIELDS)
            key = (day, row_account, campaign)
            if key in seen:
                previous_values, previous_line = seen[key]
                if previous_values != values:
                    raise ReportError(f"与第 {previous_line} 行的日期、账户和广告系列相同，指标却不同。")
                warnings.append(f"{label} 第 {line} 行与第 {previous_line} 行完全重复，已计一次。")
                continue
            seen[key] = (values, line)
            if len(details) < trace_limit:
                details.append((line, day.isoformat(), campaign, values))
            for field, value in zip(FIELDS, values):
                totals[field] += value
        except ReportError as error:
            raise ReportError(f"{label} 第 {line} 行：{error}") from error
    if not seen:
        raise ReportError(f"{label} 没有可对账的数据行。")
    return SourceReport(account, totals, len(seen), tuple(warnings), tuple(details))


def validate_reference(reference, scope, reports):
    expected = {"week_start": scope.start.isoformat(), "currency": scope.currency, "timezone": scope.timezone}
    if not isinstance(reference, dict) or any(reference.get(key) != value for key, value in expected.items()):
        raise ReportError("历史周报的周起始日、币种或时区与本次范围不符。")
    for source, report in reports.items():
        label = SOURCES[source]
        record = reference.get(source)
        if not isinstance(record, dict) or record.get("account_id") != report.account:
            raise ReportError(f"历史周报的 {label} 账户与导入文件不符。")


def describe_difference(source, field, previous, current):
    return f"{SOURCES[source]} {FIELD_LABELS[field]}，历史 {previous:f}，本次 {current:f}，差异 {current - previous:+f}"


def compare_reference(reference, scope, reports):
    validate_reference(reference, scope, reports)
    differences = []
    for source, report in reports.items():
        record = reference[source]
        for field in FIELDS:
            expected = metric(field, record.get(field))
            current = report.totals[field]
            if current != expected:
                differences.append(describe_difference(source, field, expected, current))
    return differences


def ratio(numerator, denominator, percent=False):
    if denominator == 0:
        return "—"
    if percent:
        return f"{numerator / denominator:.2%}"
    return f"{numerator / denominator:.2f}"


def render_report(scope, reports, differences=None, *, scope_notes=()):
    status = "历史对账待完成" if differences is None else (
        "存在差异或口径待核实，需人工复核" if scope_notes else ("存在差异，待人工复核" if differences else "历史对账一致")
    )
    lines = [
        "# 广告周报草稿",
        "",
        f"{scope.start} 至 {scope.end} · {scope.timezone} · {scope.currency}",
        "",
        f"**对账状态**　{status}。",
        "",
        "| 来源 | 数据行 | 花费 | 展示 | 点击 | CTR | 平台归因转化 | CPA |",
        "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ]
    for source, report in reports.items():
        spend, impressions, clicks, conversions = (report.totals[field] for field in FIELDS)
        lines.append(
            f"| {SOURCES[source]} | {report.rows} | {spend:f} | {impressions:f} | {clicks:f} | "
            f"{ratio(clicks, impressions, percent=True)} | {conversions:f} | {ratio(spend, conversions)} |"
        )
    spend_total = sum(report.totals["spend"] for report in reports.values())
    lines.extend(["", f"两平台合计花费为 {spend_total:f} {scope.currency}。转化与 CPA 分平台展示。"])
    findings = [*(differences or []), *(warning for report in reports.values() for warning in report.warnings)]
    if findings:
        lines.extend(["", "## 待复核项目", "", *(f"- {finding}" for finding in findings)])
    if scope_notes:
        lines.extend(["", "## 点击与转化口径核验", "", *(f"- {note}" for note in scope_notes)])
    return "\n".join(lines) + "\n"


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    for source in SOURCES:
        cli.add_argument("--" + source, type=Path, required=True)
    cli.add_argument("--week-start", required=True)
    cli.add_argument("--currency", required=True)
    cli.add_argument("--timezone", required=True)
    cli.add_argument("--reference", type=Path)
    args = cli.parse_args()
    try:
        if not re.fullmatch(r"[A-Z]{3}", args.currency) or not args.timezone.strip():
            raise ReportError("请输入三位大写币种代码和报告时区。")
        scope = Scope(report_date(args.week_start), args.currency, args.timezone)
        reports = {}
        for source, label in SOURCES.items():
            with getattr(args, source).open(encoding="utf-8-sig", newline="") as file:
                reports[source] = read_export(file, label, scope)
        differences = None
        if args.reference:
            reference = json.loads(args.reference.read_text(encoding="utf-8-sig"), parse_float=Decimal)
            differences = compare_reference(reference, scope, reports)
    except (OSError, UnicodeError, ReportError, csv.Error, json.JSONDecodeError) as error:
        print(f"本次未生成周报：{error}", file=sys.stderr)
        return 2
    print(render_report(scope, reports, differences), end="")
    return 1 if differences else 0


if __name__ == "__main__":
    raise SystemExit(main())
