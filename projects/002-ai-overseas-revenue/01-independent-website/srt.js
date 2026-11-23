(function () {
  "use strict";

  const timestamp = "\\d{2}:[0-5]\\d:[0-5]\\d,\\d{3}";
  const timingPattern = new RegExp(`^\\s*(${timestamp})\\s*-->\\s*(${timestamp})\\s*$`);
  const numberPattern = /^\d+$/;

  const defaultRules = Object.freeze({
    maxCharactersPerSecond: 20,
    maxLineLength: 42,
    minDuration: 0.8,
    maxDuration: 7,
  });
  const chineseRules = Object.freeze({
    ...defaultRules,
    maxCharactersPerSecond: 10,
    maxLineLength: 18,
  });

  function milliseconds(timecode) {
    const [hours, minutes, seconds, fraction] = timecode.split(/[:,]/).map(Number);
    return ((hours * 60 + minutes) * 60 + seconds) * 1000 + fraction;
  }

  function looksLikeTimingLine(line = "") {
    return /^\s*\d+:[^\s]*\s*-->\s*\d+:/.test(line);
  }

  function findBlocks(text) {
    const lines = text.replace(/^\uFEFF/, "").split(/\r\n|\r|\n/);
    const blocks = [];
    let block = null;

    for (const [index, line] of lines.entries()) {
      if (!line.trim()) {
        block = null;
        continue;
      }

      const missingSeparator = Boolean(
        block && block.lines.length >= 2 &&
        numberPattern.test(line.trim()) && looksLikeTimingLine(lines[index + 1]),
      );
      if (!block || missingSeparator) {
        block = { line: index + 1, lines: [], missingSeparator };
        blocks.push(block);
      }
      block.lines.push(line);
    }
    return blocks;
  }

  function visibleText(line) {
    return line.replace(/<\/?(?:b|i|u|s)\s*>|<\/?font(?:\s+[^<>]*)?>/gi, "").trim();
  }

  function inspect(text, rules = defaultRules) {
    const blocks = findBlocks(text);
    const issues = [];
    const timedCues = [];
    const captions = [];
    const addIssue = (severity, code, cue, line, message, details) => {
      issues.push({
        severity, code, line, message, details,
        cue: cue?.number ?? null,
        time: cue?.time ?? "",
      });
    };

    if (!blocks.length) {
      addIssue("error", "empty-file", null, null, "The file contains no subtitle blocks.");
    }

    for (const block of blocks) {
      const hasNumber = numberPattern.test(block.lines[0].trim());
      const hasTimingFirst = !hasNumber && looksLikeTimingLine(block.lines[0]);
      const timingOffset = hasTimingFirst ? 0 : 1;
      const timingLine = block.line + timingOffset;
      const timing = timingPattern.exec(block.lines[timingOffset] ?? "");
      const cue = { number: hasNumber ? block.lines[0].trim() : null, line: timingLine };

      if (timing) {
        const [, start, end] = timing;
        cue.time = `${start} → ${end}`;
        cue.start = milliseconds(start);
        cue.end = milliseconds(end);
      }
      if (block.missingSeparator) {
        addIssue("error", "missing-separator", cue, block.line, "Add a blank line before this block.");
      }
      if (!hasNumber) {
        addIssue("error", "missing-number", cue, block.line, "Start this block with a numeric cue number.");
      }
      if (!timing) {
        addIssue(
          "error", "invalid-timing", cue, block.lines[timingOffset] === undefined ? block.line : timingLine,
          "Use a timing line like 00:00:01,000 --> 00:00:03,000.",
        );
        continue;
      }

      const textLines = block.lines.slice(timingOffset + 1).map(visibleText);
      const textLengths = textLines.map((line) => [...line].length);
      const characters = textLengths.reduce((total, length) => total + length, 0);
      const durationMs = cue.end - cue.start;
      if (!characters) {
        addIssue("error", "missing-text", cue, timingLine, "Add subtitle text after the timing line.");
      }
      if (durationMs <= 0) {
        addIssue("error", "invalid-range", cue, timingLine, "The end time must be later than the start time.");
        continue;
      }

      timedCues.push(cue);
      if (!characters) continue;
      captions.push({ ...cue, text: textLines.join("\n") });

      const duration = durationMs / 1000;
      const speed = characters / duration;
      if (speed > rules.maxCharactersPerSecond) {
        const formattedSpeed = speed.toFixed(1);
        addIssue("warning", "reading-speed", cue, timingLine,
          `Reading speed is ${formattedSpeed} characters/s. Limit is ${rules.maxCharactersPerSecond}.`,
          { speed: formattedSpeed, limit: rules.maxCharactersPerSecond });
      }
      for (const [index, length] of textLengths.entries()) {
        if (length > rules.maxLineLength) {
          addIssue("warning", "line-length", cue, timingLine + 1 + index,
            `This text line has ${length} characters. Limit is ${rules.maxLineLength}.`,
            { length, limit: rules.maxLineLength });
        }
      }
      if (duration < rules.minDuration || duration > rules.maxDuration) {
        const formattedDuration = duration.toFixed(3);
        addIssue("warning", "duration", cue, timingLine,
          `This cue lasts ${formattedDuration} s. Target range is ${rules.minDuration}–${rules.maxDuration} s.`,
          { duration: formattedDuration, min: rules.minDuration, max: rules.maxDuration });
      }
    }

    timedCues.sort((left, right) => left.start - right.start || left.line - right.line);
    let activeCue;
    for (const cue of timedCues) {
      if (activeCue && cue.start < activeCue.end) {
        const other = activeCue.number === null ? "the unnumbered block" : `cue ${activeCue.number}`;
        const overlap = Math.min(cue.end, activeCue.end) - cue.start;
        addIssue("error", "overlap", cue, cue.line,
          `Overlaps ${other} (line ${activeCue.line}) by ${overlap} ms.`,
          { otherCue: activeCue.number, otherLine: activeCue.line, overlap });
      }
      if (!activeCue || cue.end > activeCue.end) activeCue = cue;
    }

    issues.sort((left, right) => (left.line ?? 0) - (right.line ?? 0) ||
      Number(left.severity === "warning") - Number(right.severity === "warning"));
    const errors = issues.filter(({ severity }) => severity === "error").length;
    return { blocks: blocks.length, errors, warnings: issues.length - errors, issues, captions };
  }

  const checker = { defaultRules, chineseRules, inspect };
  if (typeof module === "object" && module.exports) {
    module.exports = checker;
  } else {
    window.SrtChecker = checker;
  }
})();
