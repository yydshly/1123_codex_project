"""Match existing subtitle text to timestamped words from local speech recognition."""

from dataclasses import dataclass
from difflib import SequenceMatcher
from functools import lru_cache
from pathlib import Path
from statistics import median
import re
import unicodedata

import av
import numpy as np
from faster_whisper import WhisperModel
from pydantic import BaseModel, Field


ROOT = Path(__file__).resolve().parent
DEFAULT_MODEL = ROOT / ".models" / "faster-whisper-base"
SAMPLE_RATE = 16_000
MAX_SECONDS = 120
MAX_CUES = 200
TIMING_TOLERANCE_MS = 350
ENGLISH_TOKENS = re.compile(r"[a-z0-9]+(?:'[a-z0-9]+)*")
CHINESE_TOKENS = re.compile(r"[\u3400-\u9fff]|[a-z0-9]+(?:'[a-z0-9]+)*")


class Cue(BaseModel):
    start: int = Field(ge=0)
    end: int = Field(gt=0)
    text: str = Field(min_length=1, max_length=3000)


@dataclass(frozen=True)
class Word:
    text: str
    start: int
    end: int


class MediaError(ValueError):
    pass


def decode_media(file, *, preserve_timeline=False, max_seconds=MAX_SECONDS):
    frames = []
    total = 0
    origin = 0
    resampler = av.AudioResampler(format="fltp", layout="mono", rate=SAMPLE_RATE)

    def append_frames(resampled):
        nonlocal total
        for frame in resampled:
            samples = frame.to_ndarray().reshape(-1)
            start = total
            if preserve_timeline and frame.time is not None:
                # ASR sees PCM samples, so keep gaps from the container timeline.
                start = round((frame.time - origin) * SAMPLE_RATE)
            end = start + frame.samples
            if end > max_seconds * SAMPLE_RATE:
                raise MediaError("media_too_long")
            if end <= total:
                continue
            if start > total:
                frames.append(np.zeros(start - total, dtype=np.float32))
            frames.append(samples[max(0, total - start):])
            total = end

    try:
        with av.open(file, mode="r") as container:
            if not container.streams.audio:
                raise MediaError("invalid_media")
            if preserve_timeline and (container.duration or 0) > max_seconds * av.time_base:
                raise MediaError("media_too_long")
            if preserve_timeline and container.start_time is not None:
                origin = container.start_time / av.time_base
            for frame in container.decode(audio=0):
                append_frames(resampler.resample(frame))
            append_frames(resampler.resample(None))
    except (av.FFmpegError, OSError) as error:
        raise MediaError("invalid_media") from error
    if not frames:
        raise MediaError("invalid_media")
    return np.concatenate(frames)


@lru_cache(maxsize=1)
def load_model(path):
    if not (path / "model.bin").is_file():
        raise FileNotFoundError("model_missing")
    return WhisperModel(
        str(path), device="cpu", compute_type="int8", cpu_threads=4, local_files_only=True,
    )


def recognize(file, language, model_path=DEFAULT_MODEL, *, preserve_timeline=False):
    audio = decode_media(file, preserve_timeline=preserve_timeline)
    return recognize_audio(audio, language, model_path), round(len(audio) / SAMPLE_RATE * 1000)


def recognize_audio(audio, language, model_path=DEFAULT_MODEL):
    model = load_model(model_path)
    prompt = "以下是简体中文的逐字转录。" if language == "zh" else None
    segments, _ = model.transcribe(
        audio,
        language=language,
        task="transcribe",
        word_timestamps=True,
        beam_size=5,
        temperature=0,
        vad_filter=True,
        vad_parameters={"min_silence_duration_ms": 350, "speech_pad_ms": 160},
        condition_on_previous_text=False,
        initial_prompt=prompt,
    )
    return [
        Word(word.word, round(word.start * 1000), round(word.end * 1000))
        for segment in segments
        for word in segment.words or ()
        if word.start is not None and word.end is not None and word.end > word.start
    ]


def tokenize(text, language):
    text = unicodedata.normalize("NFKC", text).casefold().replace("’", "'")
    pattern = CHINESE_TOKENS if language == "zh" else ENGLISH_TOKENS
    return pattern.findall(text)


def match_cues(cues, words, language):
    caption_tokens = []
    caption_spans = []
    recognized_tokens = []
    token_times = []

    for cue in cues:
        start = len(caption_tokens)
        caption_tokens.extend(tokenize(cue.text, language))
        caption_spans.append(range(start, len(caption_tokens)))

    for word in words:
        tokens = tokenize(word.text, language)
        recognized_tokens.extend(tokens)
        token_times.extend([word] * len(tokens))

    matcher = SequenceMatcher(a=caption_tokens, b=recognized_tokens, autojunk=False)
    matches = {
        block.a + index: block.b + index
        for block in matcher.get_matching_blocks()
        for index in range(block.size)
    }
    rows = []
    for cue, span in zip(cues, caption_spans):
        paired = [matches[index] for index in span if index in matches]
        # Keep alignment conservative when ASR misses the beginning, end or too much text.
        complete_bounds = bool(span and span.start in matches and span.stop - 1 in matches)
        if (not complete_bounds or len(paired) / len(span) < 0.70
                or paired[-1] - paired[0] + 1 > len(span) * 1.6 + 2):
            rows.append(None)
            continue

        start = token_times[paired[0]].start
        end = token_times[paired[-1]].end
        rows.append({
            "audioStart": start,
            "audioEnd": end,
            "startDelta": cue.start - start,
            "endDelta": cue.end - end,
        })

    offsets = [row["startDelta"] for row in rows if row is not None]
    track_offset = None
    if len(offsets) >= 3 and len(offsets) >= 0.75 * len(cues):
        center = round(median(offsets))
        if abs(center) > TIMING_TOLERANCE_MS and all(abs(value - center) <= 250 for value in offsets):
            track_offset = center
    return {"rows": rows, "trackOffset": track_offset, "tolerance": TIMING_TOLERANCE_MS}
