"""Build the static research site from the numbered project source."""

from pathlib import Path
from posixpath import normpath
import re
from shutil import copy2, copytree
from sys import argv
from urllib.parse import quote


ROOT = Path(__file__).resolve().parent.parent
PROJECT = "002-ai-overseas-revenue"
TOOL_LAB = "004-ai-tool-entry-lab"
REPOSITORY = "https://github.com/yydshly/1123_codex_project"
SOURCE = ROOT / "projects" / PROJECT
STATIC_SUFFIXES = {
    ".html", ".css", ".js", ".png", ".jpg", ".webp", ".mp3", ".wav",
    ".mp4", ".srt", ".pdf", ".docx", ".xlsx", ".zip", ".csv", ".txt",
}
LOCAL_ONLY_PAGES = {
    "01-independent-website/align.html",
    "01-independent-website/align.js",
    "01-independent-website/align.css",
    "04-automation-service/index.html",
    "04-automation-service/workbench.js",
    "04-automation-service/workbench.css",
    "05-content-localization/workbench.html",
    "05-content-localization/workbench.js",
    "05-content-localization/workbench.css",
}
DOCUMENT_LINK = re.compile(r'href="(?P<path>[^/":?#][^":?#]*\.md)(?P<anchor>#[^"?]*)?"')


def github_document(path, anchor=""):
    return f"{REPOSITORY}/blob/main/projects/{PROJECT}/{quote(path)}{anchor}"


def public_html(text, path):
    def document_link(match):
        target = normpath(f"{path.parent.as_posix()}/{match['path']}")
        if not (SOURCE / target).is_file():
            raise ValueError(f"Missing documentation link in {path}: {target}")
        return f'href="{github_document(target, match["anchor"] or "")}"'

    if path.as_posix() == "index.html":
        text = text.replace("<body>", "<body data-pages>", 1)
    if path.as_posix() == "01-independent-website/index.html":
        local_link = 'href="align.html" data-i18n="alignPage">Compare an SRT with audio'
        setup = github_document("01-independent-website/README.md", "#音频与字幕对齐")
        text = text.replace(local_link, f'href="{setup}">Audio alignment setup · 音频对齐运行说明', 1)
    return DOCUMENT_LINK.sub(document_link, text)


def copy_static_site(source_root, destination_root, *, excluded=(), transform_html=None):
    for source in source_root.rglob("*"):
        path = source.relative_to(source_root)
        if any(part.startswith(".") for part in path.parts) or source.suffix.lower() not in STATIC_SUFFIXES:
            continue
        if not source.is_file() or path.as_posix() in excluded:
            continue
        destination = destination_root / path
        destination.parent.mkdir(parents=True, exist_ok=True)
        if transform_html and source.suffix == ".html":
            destination.write_text(transform_html(source.read_text(encoding="utf-8"), path), encoding="utf-8")
        else:
            copy2(source, destination)


def build(output):
    copytree(ROOT / "docs", output)
    copy_static_site(SOURCE, output / PROJECT, excluded=LOCAL_ONLY_PAGES, transform_html=public_html)
    copy_static_site(ROOT / "projects" / TOOL_LAB / "web", output / TOOL_LAB)


if __name__ == "__main__":
    build(Path(argv[1]) if len(argv) > 1 else ROOT / "_site")
