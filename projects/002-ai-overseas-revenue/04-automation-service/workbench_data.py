"""Map weekly CSV exports to the inputs used by weekly_report."""

import csv
from dataclasses import dataclass, replace
from decimal import Decimal
from io import StringIO
import json
import re
import unicodedata

from weekly_report import (
    FIELD_LABELS, FIELDS, REQUIRED, SOURCES, ReportError, Scope, describe_difference,
    metric, ratio, read_export, render_report, report_date, validate_reference,
)


ALIASES = {
    "date": ("Date", "Day", "Reporting starts", "Date start", "日期", "天", "报告开始日期"),
    "date_end": ("Reporting ends", "Date stop", "报告结束日期"),
    "attribution_setting": ("Attribution setting", "归因设置"),
    "week_start": ("Week start", "Week starting", "周起始日", "周开始"),
    "account_id": ("Account ID", "Customer ID", "广告账户编号", "账户 ID", "客户 ID", "广告账户 ID"),
    "campaign_id": ("Campaign ID", "广告系列 ID", "广告系列编号"),
    "currency": ("Currency code", "Account currency", "币种", "货币", "货币代码"),
    "timezone": ("Time zone", "Account time zone", "Account timezone", "时区", "账户时区"),
    "spend": ("Cost", "Amount spent", "Spend", "花费", "费用", "支出金额", "消耗"),
    "impressions": ("Impressions", "Impr.", "展示", "展示次数", "曝光", "曝光量"),
    "clicks": ("Clicks", "Link clicks", "Clicks (all)", "点击", "点击次数", "链接点击次数", "点击次数（全部）"),
    "conversions": ("Conversions", "Conv.", "All conv.", "Conv. (by conv. time)", "All conv. (by conv. time)",
                    "Website purchases", "Purchases", "转化", "转化次数", "平台归因转化", "网站购买次数"),
    "clicks_scope": ("Click definition", "点击口径"),
    "conversions_scope": ("Conversion definition", "转化口径"),
    "platform": ("Platform", "Source", "Channel", "平台", "来源", "渠道"),
}
DETAIL_FIELDS = ("date", "date_end", "account_id", "campaign_id", "currency", "timezone", *FIELDS, "attribution_setting")
SCOPED_FIELDS = ("clicks", "conversions")
SCOPE_COLUMNS = tuple(f"{field}_scope" for field in SCOPED_FIELDS)
REFERENCE_FIELDS = ("platform", "account_id", "week_start", "currency", "timezone", *FIELDS, *SCOPE_COLUMNS)
FALLBACKS = {"account_id", "currency", "timezone"}
REFERENCE_META = {"account_id", "week_start", "currency", "timezone"}
PLATFORMS = {
    "google": "google", "googleads": "google", "谷歌": "google", "谷歌广告": "google",
    "meta": "meta", "metaads": "meta", "facebook": "meta", "facebookads": "meta", "脸书广告": "meta",
}
CLICK_DEFINITIONS = {
    "google": {"clicks": "Google Ads Clicks", "点击次数": "Google Ads Clicks"},
    "meta": {"linkclicks": "Meta Link clicks", "链接点击次数": "Meta Link clicks",
             "clicksall": "Meta Clicks (all)", "点击次数全部": "Meta Clicks (all)"},
}
TRACE_LIMIT = 20


@dataclass(frozen=True)
class CsvTable:
    headers: tuple
    rows: tuple
    header_line: int


def key(value):
    normalized = unicodedata.normalize("NFKC", value).casefold()
    return re.sub(r"[\W_]+", "", normalized)


def fields_for(kind):
    if kind == "reference":
        return REFERENCE_FIELDS
    if kind in SOURCES:
        return DETAIL_FIELDS
    raise ReportError("请选择 Google Ads、Meta Ads 或旧周报。")


def header_index(headers, field):
    # Prefer canonical names and refuse an ambiguous tie among equivalent headings.
    names = [key(re.sub(r"\([a-zA-Z]{3}\)\s*$", "", unicodedata.normalize("NFKC", name)))
             if field == "spend" else key(name) for name in headers]
    canonical = [index for index, name in enumerate(names) if name == key(field)]
    if canonical:
        return canonical[0] if len(canonical) == 1 else None
    aliases = {key(alias) for alias in ALIASES[field]}
    matches = [index for index, name in enumerate(names) if name in aliases]
    return matches[0] if len(matches) == 1 else None


def known_click_scope(kind, heading):
    return CLICK_DEFINITIONS.get(kind, {}).get(key(heading), "")


def records(text, delimiter):
    reader = csv.reader(StringIO(text.lstrip("\ufeff"), newline=""), delimiter=delimiter, strict=True)
    while True:
        start = reader.line_num + 1
        try:
            cells = next(reader)
        except StopIteration:
            return
        except csv.Error as error:
            raise ReportError(f"CSV 第 {start} 行无法读取，检查分隔符与引号。") from error
        if any(cell.strip() for cell in cells):
            yield start, tuple(cell.strip() for cell in cells)


def csv_table(kind, text, header_line=None):
    from itertools import islice

    fields = fields_for(kind)
    candidates = []
    for delimiter in (",", "\t", ";"):
        try:
            preview = list(islice(records(text, delimiter), 30)) if header_line is None else [
                (line, cells) for line, cells in records(text, delimiter) if line == header_line
            ]
        except ReportError:
            continue
        for line, cells in preview:
            if len(cells) < 2:
                continue
            hits = sum(header_index(cells, field) is not None for field in fields)
            candidates.append(((hits, -line, len(cells)), delimiter, line, cells))
    if not candidates:
        raise ReportError("找不到可读取的 CSV 表头。请检查文件格式和表头行。")
    _, delimiter, line, headers = max(candidates, key=lambda entry: entry[0])
    rows = tuple((row_line, cells) for row_line, cells in records(text, delimiter) if row_line > line)
    if not rows:
        raise ReportError("表头之后没有数据行。")
    return CsvTable(headers, rows, line)


def as_reference_json(text):
    try:
        value = json.loads(text.lstrip("\ufeff"), parse_float=Decimal)
    except json.JSONDecodeError as error:
        raise ReportError(f"旧周报 JSON 第 {error.lineno} 行无法读取。") from error
    if not isinstance(value, dict) or not all(isinstance(value.get(source), dict) for source in SOURCES):
        raise ReportError("对账 JSON 需要包含 google 和 meta 两组汇总。")
    return value


def is_json(kind, text):
    return kind == "reference" and text.lstrip("\ufeff \r\n\t").startswith(("{", "["))


def inspect(kind, text, header_line=None):
    fields = fields_for(kind)
    if is_json(kind, text):
        as_reference_json(text)
        return {"format": "json", "rows": 2}
    table = csv_table(kind, text, header_line)
    return {
        "format": "csv", "header_line": table.header_line,
        "headers": table.headers, "rows": len(table.rows),
        "sample": table.rows[0][1],
        "mapping": {field: header_index(table.headers, field) for field in fields},
        "click_scopes": [known_click_scope(kind, heading) for heading in table.headers],
    }


def selected_columns(table, mapping, fields):
    if not isinstance(mapping, dict):
        raise ReportError("请确认字段匹配。")
    columns = {}
    for field in fields:
        index = mapping.get(field)
        if index is None:
            continue
        if type(index) is not int or not 0 <= index < len(table.headers):
            raise ReportError(f"字段 {field} 对应的列不存在。")
        if index in columns.values():
            raise ReportError(f"同一列映射到了多个字段，请检查 {field}。")
        columns[field] = index
    return columns


def check_fields(fields, columns, defaults):
    missing = [field for field in fields if field not in columns and not defaults.get(field)]
    if missing:
        raise ReportError(f"待匹配字段 {', '.join(missing)}。")


def column(cells, columns, field, defaults):
    index = columns.get(field)
    if index is None:
        return defaults.get(field, "")
    return cells[index] if index < len(cells) else ""


def as_metric(value):
    if re.fullmatch(r"[0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]+)?", value):
        return value.replace(",", "")
    return value


def as_date(value):
    return value.replace("/", "-") if re.fullmatch(r"[0-9]{4}/[0-9]{2}/[0-9]{2}", value) else value


def is_total(cells):
    for cell in cells:
        value = cell.strip().casefold()
        if value in {"total", "grand total", "合计", "总计", "汇总"} or value.startswith(("total:", "总计：", "合计：")):
            return True
    return False


def detail_report(kind, entry, scope):
    table = csv_table(kind, entry["text"], entry.get("header_line"))
    columns = selected_columns(table, entry.get("mapping"), DETAIL_FIELDS)
    provided = entry.get("fixed", {})
    if not isinstance(provided, dict):
        raise ReportError("请确认账户、币种和时区。")
    defaults = {field: str(provided.get(field, "")).strip() for field in FALLBACKS}
    check_fields(REQUIRED, columns, defaults)
    source = SOURCES[kind]
    warnings = []
    source_lines = []
    attribution = {}
    standardized = StringIO(newline="")
    writer = csv.writer(standardized)
    writer.writerow(REQUIRED)
    for line, cells in table.rows:
        row = {field: column(cells, columns, field, defaults) for field in REQUIRED}
        row["date"] = as_date(row["date"])
        if is_total(cells) and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", row["date"]):
            warnings.append(f"{source} 第 {line} 行是导出汇总行，已排除。")
            continue
        if len(cells) != len(table.headers):
            raise ReportError(f"{source} 第 {line} 行的列数与表头不符。")
        date_end = as_date(column(cells, columns, "date_end", {}))
        if date_end and date_end != row["date"]:
            raise ReportError(f"{source} 第 {line} 行跨多天。请按广告系列和日期导出每日明细。")
        row["currency"] = row["currency"].upper()
        for field in FIELDS:
            row[field] = as_metric(row[field])
        if "attribution_setting" in columns:
            attribution[line] = column(cells, columns, "attribution_setting", {})
        writer.writerow([row[field] for field in REQUIRED])
        source_lines.append(line)
    standardized.seek(0)
    report = read_export(standardized, source, scope, source_lines=source_lines, trace_limit=TRACE_LIMIT)
    headings = {field: table.headers[columns[field]] for field in FIELDS}
    supplied = entry.get("metric_scopes", {})
    scopes = {field: scope_text(supplied.get(field)) for field in SCOPED_FIELDS}
    scopes["clicks"] = scopes["clicks"] or known_click_scope(kind, headings["clicks"])
    origins = {field: {"field": headings[field], "column": columns[field] + 1} for field in FIELDS}
    origins["conversions"]["attribution"] = sorted(set(attribution.values()))
    return replace(report, warnings=tuple(warnings) + report.warnings), scopes, origins


def scope_text(value):
    return value.strip() if isinstance(value, str) else ""


def normalized_scope(value):
    return " ".join(unicodedata.normalize("NFKC", value).casefold().split())


def reference_report(entry, scope, reports):
    if is_json("reference", entry["text"]):
        reference = as_reference_json(entry["text"])
        origins = {source: {field: {"field": f"{source}.{field}"} for field in FIELDS} for source in SOURCES}
        return reference, origins
    table = csv_table("reference", entry["text"], entry.get("header_line"))
    columns = selected_columns(table, entry.get("mapping"), REFERENCE_FIELDS)
    confirmed = entry.get("confirmed") is True
    required = set(REFERENCE_FIELDS) - set(SCOPE_COLUMNS)
    if confirmed:
        required -= REFERENCE_META
    check_fields(sorted(required), columns, {})
    output = {"week_start": scope.start.isoformat(), "currency": scope.currency, "timezone": scope.timezone}
    origins = {}
    for line, cells in table.rows:
        value = column(cells, columns, "platform", {})
        if is_total((value,)):
            continue
        source = PLATFORMS.get(key(value))
        if not source or len(cells) != len(table.headers):
            raise ReportError(f"旧周报第 {line} 行请填写对应平台 Google Ads 或 Meta Ads，并检查列数。")
        if source in output:
            raise ReportError(f"旧周报第 {line} 行的平台已出现，请保留每个平台一行汇总。")
        defaults = {**output, "account_id": reports[source].account} if confirmed else {}
        for field in REFERENCE_META:
            expected = reports[source].account if field == "account_id" else output[field]
            actual = column(cells, columns, field, defaults)
            if field == "currency":
                actual = actual.upper()
            if field == "week_start":
                actual = as_date(actual)
            if actual != expected:
                raise ReportError(f"旧周报第 {line} 行的 {field} 与对应导入范围不符。")
        output[source] = {
            "account_id": reports[source].account,
            **{field: as_metric(column(cells, columns, field, {})) for field in FIELDS},
            **{field: column(cells, columns, field, {}) for field in SCOPE_COLUMNS},
        }
        origins[source] = {field: {"line": line, "column": columns[field] + 1, "field": table.headers[columns[field]]}
                           for field in FIELDS}
    return output, origins


def comparison(reference, scope, reports, metric_scopes, current_origins):
    validate_reference(reference, scope, reports)
    differences = []
    scope_notes = []
    rows = []
    for source, report in reports.items():
        for field in FIELDS:
            previous = metric(field, reference[source].get(field))
            calculated = report.totals[field]
            old_scope = scope_text(reference[source].get(f"{field}_scope"))
            new_scope = metric_scopes[source].get(field, "")
            scope_status = ""
            if field in SCOPED_FIELDS:
                if field == "conversions" and len(current_origins[source][field]["attribution"]) > 1:
                    scope_status = "归因设置混用"
                elif not old_scope or not new_scope:
                    scope_status = "口径待确认"
                elif normalized_scope(old_scope) != normalized_scope(new_scope):
                    scope_status = "口径不同"
            changed = not scope_status and previous != calculated
            if scope_status:
                scope_notes.append(f"{SOURCES[source]} {FIELD_LABELS[field]} · {scope_status}。"
                                   f"旧报 {previous:f}（{old_scope or '未提供'}），"
                                   f"本次 {calculated:f}（{new_scope or '未提供'}）。")
            elif changed:
                differences.append(describe_difference(source, field, previous, calculated))
            rows.append({
                "source": SOURCES[source], "source_id": source, "label": FIELD_LABELS[field], "field": field,
                "previous": f"{previous:f}", "calculated": f"{calculated:f}",
                "delta": "—" if scope_status else f"{calculated - previous:+f}" if changed else "0",
                "changed": changed, "scope_status": scope_status, "old_scope": old_scope, "new_scope": new_scope,
            })
    return rows, differences, scope_notes


def add_traces(rows, reports, current_origins, old_origins):
    for row in rows:
        if not (row["changed"] or row["scope_status"]):
            continue
        source, field = row["source_id"], row["field"]
        field_index = FIELDS.index(field)
        report = reports[source]
        row["trace"] = {
            "previous": old_origins[source][field], "current": current_origins[source][field],
            "account": report.account, "row_count": report.rows,
            "rows": [{"line": line, "date": day, "campaign": campaign, "value": f"{values[field_index]:f}"}
                     for line, day, campaign, values in report.details],
        }


def reconcile(payload):
    config = payload["scope"]
    currency = config["currency"].strip().upper()
    timezone = config["timezone"].strip()
    if not re.fullmatch(r"[A-Z]{3}", currency) or not timezone:
        raise ReportError("请填写三位币种代码和本周报表时区。")
    scope = Scope(report_date(config["week_start"]), currency, timezone)
    inputs = payload["inputs"]
    reports, metric_scopes, current_origins = {}, {}, {}
    errors = []
    for source, label in SOURCES.items():
        try:
            reports[source], metric_scopes[source], current_origins[source] = detail_report(source, inputs[source], scope)
        except ReportError as error:
            description = str(error)
            errors.append(description if description.startswith(label) else label + " · " + description)
    if errors:
        return {"errors": errors}
    try:
        reference, old_origins = reference_report(inputs["reference"], scope, reports)
        reconciled, differences, scope_notes = comparison(reference, scope, reports, metric_scopes, current_origins)
    except ReportError as error:
        return {"errors": [str(error)]}
    add_traces(reconciled, reports, current_origins, old_origins)
    draft = render_report(scope, reports, differences, scope_notes=scope_notes)
    trace_notes = report_trace_notes(reconciled, inputs)
    if trace_notes:
        draft += "\n## 来源定位\n\n" + "\n".join(f"- {note}" for note in trace_notes) + "\n"
    totals = []
    for source, report in reports.items():
        spend, impressions, clicks, conversions = (report.totals[field] for field in FIELDS)
        totals.append({
            "source": SOURCES[source], "account": report.account, "rows": report.rows,
            "spend": f"{spend:f}", "impressions": f"{impressions:f}", "clicks": f"{clicks:f}",
            "ctr": ratio(clicks, impressions, percent=True), "conversions": f"{conversions:f}",
            "cpa": ratio(spend, conversions),
        })
    spend_total = sum(report.totals["spend"] for report in reports.values())
    return {
        "errors": [], "scope": {"week_start": scope.start.isoformat(), "week_end": scope.end.isoformat(),
                               "currency": scope.currency, "timezone": scope.timezone},
        "totals": totals, "spend_total": f"{spend_total:f}", "comparison": reconciled,
        "differences": differences, "scope_notes": scope_notes,
        "warnings": [warning for report in reports.values() for warning in report.warnings],
        "report": draft,
    }


def report_trace_notes(rows, inputs):
    notes = []
    for row in rows:
        if "trace" not in row:
            continue
        trace = row["trace"]
        old, current = trace["previous"], trace["current"]
        old_file = scope_text(inputs["reference"].get("name")) or "旧周报"
        new_file = scope_text(inputs[row["source_id"]].get("name")) or row["source"]
        old_location = f"第 {old['line']} 行、第 {old['column']} 列 · " if "line" in old else ""
        notes.append(f"{row['source']} {row['label']}。{old_file} · {old_location}{old['field']}；"
                     f"{new_file} · 第 {current['column']} 列 · {current['field']} · {trace['row_count']} 条明细。")
    return notes
