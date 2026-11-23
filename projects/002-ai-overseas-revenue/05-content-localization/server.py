"""Local English-to-Chinese subtitle workbench."""

import argparse
from functools import lru_cache
from hashlib import sha256
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from shutil import copyfileobj
from tempfile import TemporaryDirectory, TemporaryFile
from threading import Lock
from urllib.parse import unquote, urlsplit
from urllib.request import urlopen
from zipfile import ZipFile

from speech import estimate_offset, load_alignment, transcribe


ROOT = Path(__file__).resolve().parent
CORE = ROOT.parent / "03-digital-products" / "workbench-core.js"
PORT = 43731
MODEL_NAME = "translate-en_zh-1_9"
MODEL = ROOT / ".models" / MODEL_NAME
MODEL_URL = f"https://argos-net.com/v1/{MODEL_NAME}.argosmodel"
MODEL_HASH = "433e7c4f034d87fbe2353161e05f18646d7999452f801a4e1f0378522b9850ab"
MODEL_FILES = ("sentencepiece.model", "model/config.json", "model/shared_vocabulary.json", "model/model.bin")
MAX_CUES = 2000
MAX_BODY = 2 * 1024 * 1024
MAX_VIDEO = 512 * 1024 * 1024
PROGRESS_TYPE = "application/x-ndjson"
INFERENCE = Lock()
STATIC = {"/workbench.html", "/workbench.js", "/workbench.css", "/index.html", "/preview.js", "/preview.css"}
STATIC.update("/" + file.relative_to(ROOT).as_posix() for file in (ROOT / "sample").rglob("*") if file.is_file())


def has_model():
    return all((MODEL / name).is_file() for name in MODEL_FILES)


def prepare_model(archive=None):
    if has_model():
        return
    MODEL.parent.mkdir(exist_ok=True)
    with TemporaryDirectory(dir=MODEL.parent) as folder:
        temporary = Path(folder)
        if archive is None:
            archive = temporary / "model.argosmodel"
            with urlopen(MODEL_URL, timeout=60) as source, archive.open("wb") as output:
                copyfileobj(source, output)
        with archive.open("rb") as source:
            digest = sha256()
            for chunk in iter(lambda: source.read(1024 * 1024), b""):
                digest.update(chunk)
        if digest.hexdigest() != MODEL_HASH:
            raise ValueError("模型包校验失败，请重新下载官方 1.9 模型包。")
        with ZipFile(archive) as package:
            for name in MODEL_FILES:
                staged = temporary / name
                staged.parent.mkdir(parents=True, exist_ok=True)
                with package.open(f"{MODEL_NAME}/{name}") as source, staged.open("wb") as output:
                    copyfileobj(source, output)
        for name in MODEL_FILES:
            destination = MODEL / name
            destination.parent.mkdir(parents=True, exist_ok=True)
            (temporary / name).replace(destination)


@lru_cache(maxsize=1)
def load_model():
    import ctranslate2
    import sentencepiece

    return (
        sentencepiece.SentencePieceProcessor(model_file=str(MODEL / "sentencepiece.model")),
        ctranslate2.Translator(str(MODEL / "model"), device="cpu", compute_type="int8"),
    )


def translate(payload):
    texts = payload.get("texts") if isinstance(payload, dict) else None
    if not isinstance(texts, list) or not 1 <= len(texts) <= MAX_CUES:
        raise ValueError(f"请导入 1 至 {MAX_CUES} 条字幕。")
    if any(not isinstance(text, str) or not text.strip() or len(text) > 2000 for text in texts):
        raise ValueError("每条英文字幕须有文字，单条最多 2000 字符。")
    with INFERENCE:
        tokenizer, translator = load_model()
        source = tokenizer.encode([" ".join(text.split()) for text in texts], out_type=str)
        for index, tokens in enumerate(source, start=1):
            if len(tokens) > 512:
                raise ValueError(f"第 {index} 条英文字幕过长，请在原文件中拆分后再生成初稿。")
        inference = translator.translate_batch(
            source, beam_size=4, max_batch_size=32, max_input_length=512, max_decoding_length=512,
        )
        return [" ".join(tokenizer.decode(result.hypotheses[0]).replace("▁", " ").split()) for result in inference]


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def reply(self, payload, status=200):
        contents = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(contents)))
        self.end_headers()
        self.wfile.write(contents)

    def send_head(self):
        path = unquote(urlsplit(self.path).path)
        if path == "/srt-core.js":
            file = CORE.open("rb")
            self.send_response(200)
            self.send_header("Content-Type", "text/javascript; charset=utf-8")
            self.send_header("Content-Length", str(CORE.stat().st_size))
            self.end_headers()
            return file
        if path == "/":
            self.path = "/workbench.html"
        elif path not in STATIC:
            self.send_error(404)
            return None
        return super().send_head()

    def do_POST(self):
        if self.path not in {"/api/translate", "/api/recognize", "/api/estimate-offset"}:
            return self.reply({"error": "找不到该接口。"}, 404)
        port = self.server.server_port
        allowed = {f"http://{host}:{port}" for host in ("127.0.0.1", "localhost")}
        if self.headers.get("Origin") not in allowed | {None}:
            return self.reply({"error": "请从本机工作台生成初稿。"}, 403)
        try:
            size = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            return self.reply({"error": "无法读取文件大小。"}, 400)
        if self.path in {"/api/recognize", "/api/estimate-offset"}:
            return self.process_video(size, estimate=self.path == "/api/estimate-offset")
        if self.headers.get_content_type() != "application/json":
            return self.reply({"error": "请从本机工作台提交英文字幕。"}, 415)
        try:
            if not 0 < size <= MAX_BODY:
                return self.reply({"error": "英文字幕数据为空或超过 2 MiB。"}, 413)
            data = json.loads(self.rfile.read(size).decode("utf-8"))
            result = translate(data)
        except (ValueError, UnicodeError) as error:
            return self.reply({"error": str(error)}, 422)
        except (OSError, RuntimeError, ImportError):
            return self.reply({"error": "本机翻译模型加载失败。请检查项目的模型和依赖后重试。"}, 503)
        self.reply({"translations": result})

    def read_offset_cues(self, size):
        # Offset requests carry a 4-byte big-endian JSON length, then JSON and the original video.
        if size <= 4:
            raise ValueError("无法读取校正请求中的英文字幕。")
        length = int.from_bytes(self.rfile.read(4), "big")
        if not 0 < length <= MAX_BODY or length + 4 >= size:
            raise ValueError("无法读取校正请求中的英文字幕。")
        items = json.loads(self.rfile.read(length).decode("utf-8"))
        if not isinstance(items, list) or not 1 <= len(items) <= MAX_CUES:
            raise ValueError(f"整轨校正需要 1 至 {MAX_CUES} 条英文字幕。")
        cue_type = load_alignment().Cue
        try:
            cues = [cue_type.model_validate(item, strict=True) for item in items]
        except ValueError as error:
            raise ValueError("无法读取校正请求中的英文字幕。") from error
        if any(cue.end <= cue.start or not cue.text.strip() for cue in cues):
            raise ValueError("英文字幕需要有效时间和文字。")
        return cues, size - length - 4

    def process_video(self, size, *, estimate):
        if self.headers.get_content_type() != "application/octet-stream":
            return self.reply({"error": "请从本机工作台选择视频。"}, 415)
        if not 0 < size <= MAX_VIDEO + (MAX_BODY + 4 if estimate else 0):
            return self.reply({"error": "视频为空或超过 512 MiB。"}, 413)
        try:
            cues = None
            if estimate:
                cues, size = self.read_offset_cues(size)
                if size > MAX_VIDEO:
                    return self.reply({"error": "视频超过 512 MiB。"}, 413)
            with TemporaryFile(mode="w+b") as video:
                while size:
                    chunk = self.rfile.read(min(size, 1024 * 1024))
                    if not chunk:
                        return self.reply({"error": "视频读取中断，请重新选择后再试。"}, 400)
                    video.write(chunk)
                    size -= len(chunk)
                video.seek(0)

                def process(progress=None):
                    if estimate:
                        return {"estimate": estimate_offset(video, cues, progress)}
                    return {"cues": transcribe(video, progress)}

                if self.headers.get("Accept") == PROGRESS_TYPE:
                    return self.speech_with_progress(process)
                with INFERENCE:
                    result = process()
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            return
        except (ValueError, UnicodeError) as error:
            return self.reply({"error": str(error)}, 422)
        except (OSError, RuntimeError, ImportError) as error:
            return self.reply({"error": speech_error(error)}, 503)
        self.reply(result)

    def speech_with_progress(self, process):
        self.send_response(200)
        self.send_header("Content-Type", f"{PROGRESS_TYPE}; charset=utf-8")
        self.end_headers()

        def event(payload):
            self.wfile.write((json.dumps(payload, ensure_ascii=False) + "\n").encode("utf-8"))
            self.wfile.flush()

        def progress(current, total):
            event({"current": current, "total": total})

        try:
            with INFERENCE:
                result = process(progress)
            event(result)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            return
        except ValueError as error:
            event({"error": str(error)})
        except (OSError, RuntimeError, ImportError) as error:
            event({"error": speech_error(error)})


def speech_error(error):
    message = str(error)
    if message.startswith("未找到第 01 项"):
        return message
    return "本机语音识别失败。请检查第 01 项模型和 Python 依赖后重试。"


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--port", type=int, default=PORT)
    cli.add_argument("--prepare-model", action="store_true")
    cli.add_argument("--model-archive", type=Path)
    args = cli.parse_args()
    if args.prepare_model or args.model_archive is not None:
        prepare_model(args.model_archive)
        print("本地翻译模型已就绪。", flush=True)
        return
    if not has_model():
        cli.exit(1, "请先运行 python -X utf8 server.py --prepare-model\n")
    print(f"字幕工作台 http://127.0.0.1:{args.port}/", flush=True)
    with ThreadingHTTPServer(("127.0.0.1", args.port), Handler) as server:
        server.serve_forever()


if __name__ == "__main__":
    main()
