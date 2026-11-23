"""Serve the advertising reconciliation workbench on this computer."""

import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from urllib.parse import urlsplit

from weekly_report import ReportError
from workbench_data import inspect, reconcile


ROOT = Path(__file__).resolve().parent
STATIC_PATHS = {"/", "/index.html", "/workbench.css", "/workbench.js"}
MAX_REQUEST = 64 * 1024 * 1024
DEMO = {
    "scope": {"week_start": "2026-11-09", "currency": "USD", "timezone": "Asia/Shanghai"},
    "inputs": {
        "google": {
            "name": "模拟 Google Ads.csv", "fixed": {"timezone": "Asia/Shanghai"},
            "text": (
                "Campaign performance report\n"
                "November 9, 2026 – November 15, 2026\n"
                "Day,Customer ID,Campaign ID,Currency code,Cost,Impr.,Clicks,Conversions\n"
                '2026-11-09,g-1,g-search,USD,10.25,"1,000",40,2.5\n'
                '2026-11-11,g-1,g-search,USD,20.25,"2,000",60,3.5\n'
                '2026-11-09,g-1,g-search,USD,10.25,"1,000",40,2.5\n'
                "Total: Campaigns,,,USD,30.50,3000,100,6\n"
            ),
        },
        "meta": {
            "name": "模拟 Meta Ads.csv", "fixed": {"currency": "USD"},
            "text": (
                "Reporting starts,Reporting ends,Account ID,Campaign ID,Amount spent (USD),Impressions,Link clicks,Website purchases,Account time zone\n"
                "2026-11-09,2026-11-09,m-1,m-video,15.10,1000,20,1,Asia/Shanghai\n"
                "2026-11-15,2026-11-15,m-1,m-video,12.40,1500,30,2,Asia/Shanghai\n"
            ),
        },
        "reference": {
            "name": "模拟历史周报.csv",
            "text": (
                "周起始日,平台,广告账户编号,币种,时区,花费,展示,点击,转化,点击口径,转化口径\n"
                "2026-11-09,Google Ads,g-1,USD,Asia/Shanghai,30.50,3000,100,6,Google Ads Clicks,Google Ads 购买 · 广告互动日 · 30天点击窗口\n"
                "2026-11-09,Meta Ads,m-1,USD,Asia/Shanghai,27.00,2500,50,3,Meta Link clicks,Meta 网站购买 · 转化发生日 · 7天点击或1天浏览\n"
            ),
        },
    },
}
DEMO["inputs"]["google"]["metric_scopes"] = {"conversions": "Google Ads 购买 · 广告互动日 · 30天点击窗口"}
DEMO["inputs"]["meta"]["metric_scopes"] = {"conversions": "Meta 网站购买 · 转化发生日 · 7天点击或1天浏览"}


def realistic_sample():
    names = {"google": "google-campaigns.csv", "meta": "meta-campaigns.csv", "reference": "previous-weekly-report.csv"}
    sample_dir = ROOT / "samples" / "metric-scopes"
    inputs = {kind: {"name": name, "text": (sample_dir / name).read_text(encoding="utf-8")} for kind, name in names.items()}
    inputs["google"].update(
        fixed={"timezone": "America/New_York"}, headings={"conversions": "Conversions"},
        metric_scopes={"conversions": "Google Ads 主要转化 · 广告互动日 · 购买 · 30天点击窗口"},
    )
    inputs["meta"].update(
        fixed={"timezone": "America/New_York", "currency": "USD"}, headings={"clicks": "Link clicks"},
        metric_scopes={"conversions": "Meta 网站购买 · 转化发生日 · 7天点击或1天浏览"},
    )
    return {"scope": {"week_start": "2026-11-09", "currency": "USD", "timezone": "America/New_York"}, "inputs": inputs}


class WorkbenchHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def send_json(self, value, status=200):
        data = json.dumps(value, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        path = urlsplit(self.path).path
        if path == "/api/sample":
            self.send_json(DEMO)
        elif path == "/api/metric-scope-sample":
            self.send_json(realistic_sample())
        elif path in STATIC_PATHS:
            super().do_GET()
        else:
            self.send_error(404)

    def do_HEAD(self):
        if urlsplit(self.path).path in STATIC_PATHS:
            super().do_HEAD()
        else:
            self.send_error(404)

    def do_POST(self):
        path = urlsplit(self.path).path
        if path not in {"/api/inspect", "/api/report"}:
            return self.send_error(404)
        allowed_origins = {f"http://{name}:{self.server.server_port}" for name in ("127.0.0.1", "localhost")}
        origin = self.headers.get("Origin")
        if origin and origin not in allowed_origins:
            return self.send_json({"error": "请从本机工作台提交文件。"}, 403)
        if self.headers.get_content_type() != "application/json":
            return self.send_json({"error": "请使用页面内的文件导入。"}, 415)
        try:
            size = int(self.headers.get("Content-Length", "0"))
            if not 0 < size <= MAX_REQUEST:
                return self.send_json({"error": "文件请求为空或超过本地读取上限。"}, 413)
            payload = json.loads(self.rfile.read(size).decode("utf-8"))
            if path == "/api/inspect":
                return self.send_json(inspect(payload["kind"], payload["text"], payload.get("header_line")))
            return self.send_json(reconcile(payload))
        except ReportError as error:
            return self.send_json({"error": str(error)}, 422)
        except (KeyError, TypeError, ValueError, AttributeError, OverflowError):
            return self.send_json({"error": "请求格式不完整。请重新导入文件并确认对应列。"}, 400)


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--port", type=int, default=43728)
    args = cli.parse_args()
    with ThreadingHTTPServer(("127.0.0.1", args.port), WorkbenchHandler) as server:
        print(f"广告周报工作台 http://127.0.0.1:{args.port}/", flush=True)
        server.serve_forever()


if __name__ == "__main__":
    main()
