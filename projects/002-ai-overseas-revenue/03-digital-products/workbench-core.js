(function () {
  "use strict";

  const timestamp = "(\\d{2,}):([0-5]\\d):([0-5]\\d)[,.](\\d{3})";
  const clock = new RegExp("^" + timestamp + "$");
  const timing = new RegExp("^(\\S+)\\s*-->\\s*(\\S+)(?:\\s+.*)?$");
  const encoder = new TextEncoder();

  function readTime(value) {
    const match = clock.exec(value.trim());
    if (!match) return null;
    const [hours, minutes, seconds, fraction] = match.slice(1).map(Number);
    const ms = ((hours * 60 + minutes) * 60 + seconds) * 1000 + fraction;
    return Number.isSafeInteger(ms) ? ms : null;
  }

  function formatTime(ms) {
    const two = (value) => String(value).padStart(2, "0");
    const fraction = String(ms % 1000).padStart(3, "0");
    return [Math.floor(ms / 3600000), Math.floor(ms / 60000) % 60, Math.floor(ms / 1000) % 60]
      .map(two).join(":") + "," + fraction;
  }

  function parseSrt(source) {
    const content = source.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").trim();
    if (!content) throw Error("字幕文件为空。");
    return content.split(/\n[ \t]*\n+/).map((block, index) => {
      const lines = block.split("\n");
      if (/^\d+$/.test(lines[0].trim())) lines.shift();
      const match = timing.exec(lines.shift()?.trim() ?? "");
      const start = match ? readTime(match[1]) : null;
      const end = match ? readTime(match[2]) : null;
      if (start === null || end === null || lines.some((line) => timing.test(line.trim()))) {
        throw Error("第 " + (index + 1) + " 段无法读取时间码。请检查时间格式和段落空行。");
      }
      return { start: formatTime(start), end: formatTime(end), text: lines.join("\n") };
    });
  }

  function scan(cues, durationMs = null) {
    const errors = [];
    const warnings = [];
    const times = [];
    for (const [index, cue] of cues.entries()) {
      const start = readTime(cue.start);
      const end = readTime(cue.end);
      if (start === null || end === null || end <= start) {
        errors.push({ index, message: "时间码须有效，结束时间须晚于开始时间。" });
      } else {
        times.push({ start, end, index });
        if (durationMs !== null && end > durationMs + 100) {
          warnings.push({ index, message: "结束时间超过当前素材时长。" });
        }
      }
      if (!cue.text.trim()) errors.push({ index, message: "字幕文字为空。" });
    }
    times.sort((left, right) => left.start - right.start);
    let furthest;
    for (const entry of times) {
      if (furthest && entry.start < furthest.end) {
        warnings.push({ index: entry.index, message: "与第 " + (furthest.index + 1) + " 条有时间重叠。" });
      }
      if (!furthest || entry.end > furthest.end) furthest = entry;
    }
    return { errors, warnings };
  }

  function matchingSource(source, target) {
    if (!target) return [];
    const start = readTime(target.start);
    const end = readTime(target.end);
    if (start === null || end === null || end <= start) return [];
    return source.filter((cue) => {
      const otherStart = readTime(cue.start);
      const otherEnd = readTime(cue.end);
      return otherStart !== null && otherEnd !== null && otherStart < end && otherEnd > start;
    });
  }

  function writeSrt(cues) {
    const { errors } = scan(cues);
    if (!cues.length || errors.length) throw Error("请先补齐字幕文字和时间码。");
    return [...cues].sort((left, right) => readTime(left.start) - readTime(right.start))
      .map((cue, index) => [
        index + 1,
        formatTime(readTime(cue.start)) + " --> " + formatTime(readTime(cue.end)),
        cue.text.replace(/\r\n?/g, "\n").trim().replace(/\n[ \t]*\n+/g, "\n"),
      ].join("\n"))
      .join("\n\n") + "\n";
  }

  function fileStem(value, fallback) {
    const safe = value.trim().replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-").replace(/[ .]+$/g, "").slice(0, 80);
    return safe.trim() || fallback;
  }

  function restoreDraft(source) {
    let backup;
    try { backup = JSON.parse(source.replace(/^\uFEFF/, "")); } catch {
      throw Error("文件不是可读取的项目备份。");
    }
    if (backup?.format !== "subtitle-handoff-project" || backup.version !== 1) {
      throw Error("请选择此工作台导出的项目备份。");
    }
    const project = backup.project;
    const fields = ["name", "version", "reviewer", "note", "mediaName"];
    const languages = ["en", "zh-CN"];
    const isText = (value) => typeof value === "string";
    const validCue = (cue) => cue && isText(cue.start) && isText(cue.end) && isText(cue.text);
    if (!project || !fields.every((field) => isText(project[field]))
      || !languages.every((key) => isText(project.fileNames?.[key])
        && Array.isArray(project.tracks?.[key]) && project.tracks[key].every(validCue))
      || !Array.isArray(project.terms)
      || !project.terms.every((term) => term && isText(term.en) && isText(term.zh) && term.en.trim() && term.zh.trim())) {
      throw Error("备份缺少所需的项目字段或字幕内容。");
    }
    return {
      ...Object.fromEntries(fields.map((field) => [field, project[field]])),
      tracks: Object.fromEntries(languages.map((key) => [key, project.tracks[key].map(({ start, end, text }) => ({ start, end, text }))])),
      fileNames: Object.fromEntries(languages.map((key) => [key, project.fileNames[key]])),
      terms: project.terms.map(({ en, zh }) => ({ en, zh })),
    };
  }

  const crcTable = Uint32Array.from({ length: 256 }, (_, index) => {
    let crc = index;
    for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? 0xEDB88320 ^ (crc >>> 1) : crc >>> 1;
    return crc >>> 0;
  });

  function crc32(bytes) {
    let value = 0xFFFFFFFF;
    for (const byte of bytes) value = crcTable[(value ^ byte) & 255] ^ (value >>> 8);
    return (value ^ 0xFFFFFFFF) >>> 0;
  }

  function zip(entries) {
    const payload = [];
    const directory = [];
    let offset = 0;
    let directorySize = 0;
    for (const [name, text] of entries) {
      const filename = encoder.encode(name);
      const data = encoder.encode(text);
      const checksum = crc32(data);
      const local = new Uint8Array(30 + filename.length);
      const header = new DataView(local.buffer);
      header.setUint32(0, 0x04034B50, true);
      header.setUint16(4, 20, true);
      header.setUint16(6, 0x0800, true);
      header.setUint16(12, 33, true);
      header.setUint32(14, checksum, true);
      header.setUint32(18, data.length, true);
      header.setUint32(22, data.length, true);
      header.setUint16(26, filename.length, true);
      local.set(filename, 30);
      payload.push(local, data);

      const central = new Uint8Array(46 + filename.length);
      const entry = new DataView(central.buffer);
      entry.setUint32(0, 0x02014B50, true);
      entry.setUint16(4, 20, true);
      entry.setUint16(6, 20, true);
      entry.setUint16(8, 0x0800, true);
      entry.setUint16(14, 33, true);
      entry.setUint32(16, checksum, true);
      entry.setUint32(20, data.length, true);
      entry.setUint32(24, data.length, true);
      entry.setUint16(28, filename.length, true);
      entry.setUint32(42, offset, true);
      central.set(filename, 46);
      directory.push(central);
      offset += local.length + data.length;
      directorySize += central.length;
    }
    const footer = new Uint8Array(22);
    const end = new DataView(footer.buffer);
    end.setUint32(0, 0x06054B50, true);
    end.setUint16(8, entries.length, true);
    end.setUint16(10, entries.length, true);
    end.setUint32(12, directorySize, true);
    end.setUint32(16, offset, true);
    return new Blob([...payload, ...directory, footer], { type: "application/zip" });
  }

  const tools = { parseSrt, readTime, formatTime, scan, matchingSource, writeSrt, fileStem, zip, restoreDraft };
  if (typeof module === "object" && module.exports) module.exports = tools;
  else window.HandoffCore = tools;
})();
