"""Run a reproducible weekly-report pilot using synthetic inputs."""

from copy import deepcopy
import json
from pathlib import Path
import re
import subprocess
import sys
from tempfile import TemporaryDirectory


HEADER = "date,account_id,campaign_id,currency,timezone,spend,impressions,clicks,conversions\n"
GOOGLE = (
    "2026-11-09,g-1,g-search,USD,Asia/Shanghai,10.25,1000,40,2.5\n"
    "2026-11-11,g-1,g-search,USD,Asia/Shanghai,20.25,2000,60,3.5\n"
)
META = (
    "2026-11-09,m-1,m-video,USD,Asia/Shanghai,15.10,1000,20,1\n"
    "2026-11-15,m-1,m-video,USD,Asia/Shanghai,12.40,1500,30,2\n"
)
REFERENCE = {
    "week_start": "2026-11-09",
    "currency": "USD",
    "timezone": "Asia/Shanghai",
    "google": {"account_id": "g-1", "spend": "30.50", "impressions": 3000, "clicks": 100, "conversions": "6"},
    "meta": {"account_id": "m-1", "spend": "27.50", "impressions": 2500, "clicks": 50, "conversions": "3"},
}


def main():
    script = Path(__file__).with_name("weekly_report.py")
    with TemporaryDirectory(prefix="weekly-report-check-") as directory:
        root = Path(directory)
        google = root / "google.csv"
        meta = root / "meta.csv"
        reference = root / "reference.json"

        def run(google_csv=HEADER + GOOGLE, meta_csv=HEADER + META, history=REFERENCE):
            google.write_text(google_csv, encoding="utf-8-sig")
            meta.write_text(meta_csv, encoding="utf-8")
            command = [
                sys.executable, "-X", "utf8", str(script),
                "--google", str(google), "--meta", str(meta),
                "--week-start", "2026-11-09", "--currency", "USD", "--timezone", "Asia/Shanghai",
            ]
            if history is not None:
                reference.write_text(json.dumps(history), encoding="utf-8")
                command.extend(["--reference", str(reference)])
            return subprocess.run(command, capture_output=True, encoding="utf-8")

        normal = run()
        assert normal.returncode == 0 and not normal.stderr, normal.stderr
        assert "历史对账一致" in normal.stdout and "58.00 USD" in normal.stdout
        assert "| Google Ads | 2 | 30.50 | 3000 | 100 | 3.33% | 6.0 | 5.08 |" in normal.stdout
        assert "| Meta Ads | 2 | 27.50 | 2500 | 50 | 2.00% | 3 | 9.17 |" in normal.stdout
        assert run().stdout == normal.stdout
        assert "历史对账待完成" in run(history=None).stdout

        duplicate = run(google_csv=HEADER + GOOGLE + GOOGLE.splitlines()[0] + "\n")
        assert duplicate.returncode == 0 and "58.00 USD" in duplicate.stdout
        assert "第 4 行与第 2 行完全重复" in duplicate.stdout

        mismatch = deepcopy(REFERENCE)
        mismatch["meta"]["spend"] = "27.00"
        flagged = run(history=mismatch)
        assert flagged.returncode == 1 and "差异 +0.50" in flagged.stdout

        for invalid, message in [
            (HEADER.replace(",clicks", "") + GOOGLE, "缺少字段 clicks"),
            (HEADER + GOOGLE.replace(",USD,", ",EUR,", 1), "币种 'EUR'"),
            (HEADER + GOOGLE.replace("2026-11-09", "2026-11-08", 1), "超出报告周"),
            (HEADER + GOOGLE.replace("Asia/Shanghai", "UTC", 1), "时区 'UTC'"),
            (HEADER + GOOGLE + GOOGLE.splitlines()[0].replace("10.25", "10.30") + "\n", "指标却不同"),
        ]:
            blocked = run(google_csv=invalid)
            assert blocked.returncode == 2 and message in blocked.stderr and not blocked.stdout, blocked.stderr

        zero_meta = re.sub(r",\d+\.\d+,\d+,\d+,\d+", ",0.00,0,0,0", META)
        zero = run(meta_csv=HEADER + zero_meta, history=None)
        assert zero.returncode == 0 and "| Meta Ads | 2 | 0.00 | 0 | 0 | — | 0 | — |" in zero.stdout

        print(normal.stdout, end="")
        print("\n验证通过：历史对账、重复运行、重复行、历史差异、缺列、币种、日期、时区、冲突行、零分母。")


if __name__ == "__main__":
    main()
