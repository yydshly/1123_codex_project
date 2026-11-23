"""Turn the alignment project's recognized English words into editable cues."""

from functools import lru_cache
from dataclasses import replace
from difflib import SequenceMatcher
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import re
from statistics import median
import sys


ALIGNMENT = Path(__file__).resolve().parent.parent / "01-independent-website" / "alignment.py"
SENTENCE_END = re.compile(r"[.!?][\"')]*$")
MAX_SECONDS = 600
CHUNK_SECONDS = 75
CONTEXT_SECONDS = 3
SPEAKER_PREFIX = re.compile(r"^\s*(?:>>\s*)?(?:[A-Z][A-Z .'-]{1,60}:\s*)?")
SOUND_ONLY = re.compile(r"(?:\s*\[[^\]\n]+\]\s*)+")


@lru_cache(maxsize=1)
def load_alignment():
    spec = spec_from_file_location("subtitle_audio_alignment", ALIGNMENT)
    module = module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def group_words(words, duration):
    cues = []
    group = []

    def finish():
        text = " ".join("".join(word.text for word in group).split())
        start = max(group[0].start, cues[-1]["end"] if cues else 0)
        end = min(duration, max(word.end for word in group))
        if text and end > start:
            cues.append({"start": start, "end": end, "text": text})

    for word in words:
        if group and (
            word.start - group[-1].end >= 640
            or (len(group) >= 3 and SENTENCE_END.search(group[-1].text.rstrip()))
            or word.end - group[0].start > 6200
        ):
            finish()
            group.clear()
        group.append(word)
    if group:
        finish()
    return cues


def midpoint(word):
    return (word.start + word.end) // 2


def word_key(word):
    return re.sub(r"[^a-z0-9]", "", word.text.casefold())


def join_chunks(previous, current, boundary):
    context = CONTEXT_SECONDS * 1000
    left = [(i, word) for i, word in enumerate(previous) if boundary - context <= midpoint(word) <= boundary + context]
    right = [(i, word) for i, word in enumerate(current) if boundary - context <= midpoint(word) <= boundary + context]
    matcher = SequenceMatcher(a=[word_key(word) for _, word in left], b=[word_key(word) for _, word in right], autojunk=False)
    matches = []
    for block in matcher.get_matching_blocks():
        for step in range(block.size):
            left_index, first = left[block.a + step]
            right_index, second = right[block.b + step]
            delta = abs(midpoint(first) - midpoint(second))
            if word_key(first) and delta <= 550 and (block.size >= 2 or len(word_key(first)) >= 4):
                middle = (midpoint(first) + midpoint(second)) // 2
                matches.append((abs(middle - boundary), delta, left_index, right_index))
    if matches:
        _, _, left_index, right_index = min(matches)
        return previous[:left_index + 1] + current[right_index + 1:]

    # A pause or a poor match still has a single owner on each side of the cut.
    before = [word for word in previous if midpoint(word) < boundary]
    after = [word for word in current if midpoint(word) >= boundary]
    if before and after and word_key(before[-1]) == word_key(after[0]) and before[-1].end > after[0].start:
        after = after[1:]
    return before + after


def recognize_chunks(audio, alignment, progress):
    rate = alignment.SAMPLE_RATE
    step = CHUNK_SECONDS * rate
    padding = CONTEXT_SECONDS * rate
    total = (len(audio) + step - 1) // step
    merged = []
    for index, start in enumerate(range(0, len(audio), step), start=1):
        if progress:
            progress(index, total)
        left = max(0, start - padding)
        right = min(len(audio), start + step + padding)
        offset = round(left * 1000 / rate)
        local = alignment.recognize_audio(audio[left:right], "en")
        absolute = [replace(word, start=word.start + offset, end=word.end + offset) for word in local]
        merged = join_chunks(merged, absolute, round(start * 1000 / rate)) if start else absolute
    return merged


def recognize(file, progress):
    alignment = load_alignment()
    try:
        audio = alignment.decode_media(file, preserve_timeline=True, max_seconds=MAX_SECONDS)
        duration = round(len(audio) * 1000 / alignment.SAMPLE_RATE)
        words = recognize_chunks(audio, alignment, progress)
    except alignment.MediaError as error:
        if str(error) == "media_too_long":
            raise ValueError("自动识别支持最长 10 分钟的视频。已有英文 SRT 时可直接导入。") from error
        raise ValueError("视频缺少可读取的音轨。请换用带英文声音的 MP4 或 WebM。") from error
    except FileNotFoundError as error:
        raise RuntimeError("未找到第 01 项的 faster-whisper-base 模型。请先准备第 01 项语音模型。") from error
    return alignment, words, duration


def transcribe(file, progress=None):
    _, words, duration = recognize(file, progress)
    cues = group_words(words, duration)
    if not cues:
        raise ValueError("没有识别到可用的英文语音。请检查原片的音轨和音量。")
    return cues


def estimate_offset(file, cues, progress=None):
    alignment, words, duration = recognize(file, progress)
    spoken = []
    for index, cue in enumerate(cues):
        text = SPEAKER_PREFIX.sub("", cue.text).strip()
        if not SOUND_ONLY.fullmatch(text) and alignment.tokenize(text, "en"):
            spoken.append((index, cue.model_copy(update={"text": text})))

    # Match in chronological order even if the source file lists cues out of order.
    spoken.sort(key=lambda item: item[1].start)
    result = alignment.match_cues([cue for _, cue in spoken], words, "en")
    regions = [[], [], []]
    matched = 0
    for (index, _), row in zip(spoken, result["rows"]):
        if row is None:
            continue
        matched += 1
        part = min(2, row["audioStart"] * 3 // duration)
        regions[part].append({"index": index, **row})

    estimate = {"matched": matched, "spoken": len(spoken)}
    if matched < 3 or matched * 2 < len(spoken) or not all(regions):
        return {**estimate, "status": "insufficient"}

    center = round(median(row["startDelta"] for region in regions for row in region))
    inliers = []
    for region in regions:
        nearby = [row for row in region if abs(row["startDelta"] - center) <= 350]
        # Each third needs its own agreement before suggesting a single offset.
        if len(nearby) * 5 < len(region) * 4:
            return {**estimate, "status": "inconsistent"}
        inliers.append(nearby)
    regional_offsets = [median(row["startDelta"] for row in region) for region in regions]
    if max(regional_offsets) - min(regional_offsets) > 350:
        return {**estimate, "status": "inconsistent"}

    anchors = [
        min(region, key=lambda row: abs(row["audioStart"] - duration * position))
        for region, position in zip(inliers, (0, 0.5, 1))
    ]
    return {**estimate, "status": "aligned" if abs(center) <= result["tolerance"] else "offset",
            "offset": center, "anchors": anchors}
