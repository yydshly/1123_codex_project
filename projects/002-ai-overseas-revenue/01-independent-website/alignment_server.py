"""Serve the subtitle tools and local alignment API on one loopback origin."""

import argparse
from pathlib import Path
from typing import Literal

import uvicorn
from fastapi import FastAPI, File, Form, Request, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from pydantic import TypeAdapter, ValidationError
from starlette.middleware.trustedhost import TrustedHostMiddleware

from alignment import Cue, DEFAULT_MODEL, MAX_CUES, MediaError, ROOT, match_cues, recognize


MAX_MEDIA_BYTES = 25_000_000
MAX_CUE_BYTES = 800_000
STATIC_FILES = frozenset({
    "index.html", "styles.css", "srt.js", "i18n.js", "app.js",
    "align.html", "align.css", "align.js",
})
SAMPLE_FILES = frozenset(
    name
    for language in ("zh", "en")
    for name in (
        f"{language}.wav", f"{language}-normal.srt",
        f"{language}-shifted.srt", f"{language}-local.srt",
    )
)
cue_list = TypeAdapter(list[Cue])


def error_response(code, status):
    return JSONResponse({"error": code}, status_code=status)


def create_app(model_path=DEFAULT_MODEL):
    app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["localhost", "127.0.0.1"])

    @app.middleware("http")
    async def check_request(request: Request, call_next):
        if request.url.path == "/api/align" and request.method == "POST":
            origin = request.headers.get("origin")
            if origin and origin != f"{request.url.scheme}://{request.url.netloc}":
                return error_response("invalid_origin", 403)
            length = request.headers.get("content-length", "")
            if not length.isascii() or not length.isdigit():
                return error_response("invalid_request", 411)
            if int(length) > MAX_MEDIA_BYTES + MAX_CUE_BYTES + 4096:
                return error_response("media_too_large", 413)
        return await call_next(request)

    @app.post("/api/align")
    def align(
        media: UploadFile = File(),
        language: Literal["zh", "en"] = Form(),
        cues: str = Form(),
    ):
        if media.size is not None and media.size > MAX_MEDIA_BYTES:
            return error_response("media_too_large", 413)
        if len(cues.encode("utf-8")) > MAX_CUE_BYTES:
            return error_response("invalid_cues", 422)
        try:
            parsed = cue_list.validate_json(cues)
        except ValidationError:
            return error_response("invalid_cues", 422)
        if not 1 <= len(parsed) <= MAX_CUES or any(cue.end <= cue.start for cue in parsed):
            return error_response("invalid_cues", 422)

        try:
            words, duration = recognize(media.file, language, model_path)
        except MediaError as error:
            return error_response(str(error), 422)
        except FileNotFoundError:
            return error_response("model_missing", 503)
        return {"duration": duration, **match_cues(parsed, words, language)}

    @app.get("/")
    def home():
        return FileResponse(ROOT / "index.html")

    @app.get("/alignment-samples/{name}")
    def sample(name: str):
        if name not in SAMPLE_FILES:
            return error_response("not_found", 404)
        return FileResponse(ROOT / "alignment-samples" / name)

    @app.get("/{name}")
    def static(name: str):
        if name not in STATIC_FILES:
            return error_response("not_found", 404)
        return FileResponse(ROOT / name)

    return app


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=Path, default=DEFAULT_MODEL)
    parser.add_argument("--port", type=int, default=43722)
    args = parser.parse_args()
    uvicorn.run(create_app(args.model.resolve()), host="127.0.0.1", port=args.port)
