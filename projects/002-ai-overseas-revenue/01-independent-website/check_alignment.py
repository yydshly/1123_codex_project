"""Rerun all six SRT fixtures against real inference on the two WAV recordings."""

import json
import subprocess
from tempfile import SpooledTemporaryFile
from time import perf_counter

from alignment import Cue, ROOT, match_cues, recognize


FIXTURES = ROOT / "alignment-samples"
READ_CAPTIONS = """
const fs = require('node:fs');
const { inspect } = require('./srt.js');
const source = fs.readFileSync(process.argv[1], 'utf8');
process.stdout.write(JSON.stringify(inspect(source).captions));
"""
EXPECTED = {
    "en": {"normal": ([], None), "shifted": ([1, 2, 3, 4], 1200), "local": ([3], None)},
    "zh": {"normal": ([], None), "shifted": ([1, 2, 3, 4], -1200), "local": ([2], None)},
}


def read_cues(path):
    raw = subprocess.check_output(["node", "-e", READ_CAPTIONS, str(path)], cwd=ROOT)
    return [Cue.model_validate(caption) for caption in json.loads(raw)]


def verify():
    for language, variants in EXPECTED.items():
        started = perf_counter()
        # Match the writable upload stream used by the web server.
        with SpooledTemporaryFile(mode="w+b", max_size=1_048_576) as audio:
            audio.write((FIXTURES / f"{language}.wav").read_bytes())
            audio.seek(0)
            words, duration = recognize(audio, language)
        print(f"{language}: {duration} ms of audio recognized in {perf_counter() - started:.2f}s", flush=True)
        for variant, (expected_shifted, expected_track) in variants.items():
            name = f"{language}-{variant}"
            cues = read_cues(FIXTURES / f"{name}.srt")
            result = match_cues(cues, words, language)
            rows = result["rows"]
            assert len(rows) == 4 and all(rows), (name, result)
            shifted = [
                index for index, row in enumerate(rows, 1)
                if max(abs(row["startDelta"]), abs(row["endDelta"])) > result["tolerance"]
            ]
            assert shifted == expected_shifted, (name, result)
            observed_track = result["trackOffset"]
            if expected_track is None:
                assert observed_track is None, (name, result)
            else:
                assert observed_track is not None and abs(observed_track - expected_track) <= 200, (name, result)
            if variant == "local":
                row = rows[expected_shifted[0] - 1]
                expected = 850 if language == "en" else -900
                assert abs(row["startDelta"] - expected) <= 150, (name, result)
            deltas = [(row["startDelta"], row["endDelta"]) for row in rows]
            print(f"{name}: flagged={shifted}, track={observed_track}, deltas={deltas}", flush=True)

        normal = read_cues(FIXTURES / f"{language}-normal.srt")
        different_text = "明天在火星寻找彩色蝴蝶。" if language == "zh" else "Penguins swim beneath the Antarctic ice."
        normal[1] = normal[1].model_copy(update={"text": different_text})
        missing = match_cues(normal, words, language)
        assert missing["rows"][1] is None, missing
        assert sum(row is None for row in missing["rows"]) == 1, missing
        print(f"{language}: unmatched subtitle correctly marked for review", flush=True)


if __name__ == "__main__":
    verify()
