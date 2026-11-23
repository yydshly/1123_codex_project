(() => {
  "use strict";

  const text = {
    zh: {
      checker: "SRT 格式检查", title: "音频与字幕对齐", interface: "界面语言",
      lead: "按音频里实际说话的时间，检查每句字幕早了还是晚了。",
      guide: "选择与成片使用同一时间起点的音频和同语 SRT。完成后点音频时间戳回听。",
      setup: "启动本地对齐服务", setupHelp: "在项目目录运行下面的命令，然后打开本地对齐页。",
      openLocal: "打开本地对齐页", files: "选择音频和字幕", audioFile: "原声音频", subtitleFile: "SRT 字幕",
      standard: "怎么判定字幕对齐",
      standardInput: "音频和 SRT 来自同一版成片，时间都从成片 00:00 算起。音频应保留片头静音，字幕语言与原声一致。",
      standardMatch: "逐句按文字和顺序匹配语音。句首、句末都找到对应，且至少匹配 70% 的汉字或英文词，才给出估计的语音区间。其余标为待复核。",
      standardTiming: "用 SRT 时间减去音频估计时间。负数是提前，正数是延后。开始或结束有一端相差超过 0.350 秒，就标记偏差。",
      standardNote: "0.350 秒是本工具的复核阈值。最终是否需要调整，可点时间戳回听确认。",
      spokenLanguage: "音频和字幕的语言",
      demos: "直接跑样例",
      demosHelp: "按上方选定的语言运行样例。结果会同时显示预设改动和实际检测值。",
      demoNormal: "正常对齐", demoShifted: "整轨偏移", demoLocal: "单句错位",
      demo_loading: "正在加载样例音频和字幕…",
      demo_unavailable: "无法加载本机样例。请确认本地服务已启动。",
      referenceNormal: "样例预设：4 句都按原音频时间放置，预期没有超出容差的句子。",
      referenceShifted: (amount) => `样例预设：全部字幕${amount}。预期 4 句都被标记，并出现整轨偏移提示。`,
      referenceLocal: (cue, amount) => `样例预设：只把第 ${cue} 句${amount}。预期只标记这一句。`,
      limits: "支持 WAV、MP3、M4A，最长 2 分钟、最大 25 MB。音频由本机进程识别。",
      analyze: "检查对齐", running: "正在本机识别音频并对齐字幕…", results: "对齐结果",
      listen: "回听原声音频", replay: "回听这段识别到的语音", original: "SRT 原时间", speech: "音频估计时间",
      difference: "字幕偏差", within: "在容差内", shifted: "有偏差", review: "待复核",
      startOutside: "开始时间超出容差。", endOutside: "结束时间超出容差。",
      bothOutside: "开始和结束时间都超出容差。",
      unmatched: "这句没有找到可靠的语音对应。", aligned: "时间一致",
      start: "开始", end: "结束", early: "提前", late: "延后",
      cue: (number, line) => number === null ? `第 ${line} 行` : `字幕 ${number} · 第 ${line} 行`,
      summary: (matched, shifted, uncertain, tolerance) =>
        `已对齐 ${matched} 句，超出容差 ${shifted} 句，待复核 ${uncertain} 句。容差 ${tolerance} 秒。`,
      skipped: (count) => `另有 ${count} 个字幕块缺少有效时间或正文，已跳过。`,
      offset: (amount) => `可能存在整轨偏移。已匹配的字幕句首普遍${amount}。`,
      done: "对齐完成。",
      bad_subtitle: "请选择一份 UTF-8 编码的 .srt 文件。",
      no_cues: "没有可对齐的字幕。请先检查时间码和正文。",
      invalid_cues: "请提供 1–200 个有效字幕块，单条最多 3,000 个字符。",
      media_too_large: "音频超过 25 MB，请先截取要检查的片段。",
      media_too_long: "音频超过 2 分钟，请先截取要检查的片段。",
      invalid_media: "无法读取音频，请使用可播放的 WAV、MP3 或 M4A。",
      model_missing: "本机语音模型尚未就绪。请按子项目 README 下载模型后重试。",
      unavailable: "无法连接本地对齐服务，请重新启动服务后再试。",
      failed: "对齐未完成，请检查音频和字幕后重试。",
      playback_failed: "播放失败，请检查浏览器是否支持该音频格式。",
    },
    en: {
      checker: "SRT format checker", title: "Audio–subtitle alignment", interface: "Interface language",
      lead: "Find subtitles that appear before or after the matching speech.",
      guide: "Choose same-language audio and SRT with the same time origin as the final video. Select an audio timestamp to listen back.",
      setup: "Start the local alignment service", setupHelp: "Run this command in the project folder, then open the local alignment page.",
      openLocal: "Open the local alignment page", files: "Choose audio and subtitles", audioFile: "Source audio", subtitleFile: "SRT subtitles",
      standard: "How alignment is judged",
      standardInput: "Use audio and SRT from the same cut, both starting at the video's 00:00. Keep any opening silence and use subtitles in the spoken language.",
      standardMatch: "Match each subtitle to speech in order. A timed match needs both opening and closing words or characters and at least 70% text coverage. Other subtitles are marked for review.",
      standardTiming: "Subtract estimated speech time from SRT time. A negative offset means early and a positive offset means late. An offset over 0.350 s in either direction at either end is flagged.",
      standardNote: "The 0.350 s threshold is for this tool's review. Select a timestamp to decide whether the subtitle needs adjustment.",
      spokenLanguage: "Audio and subtitle language",
      demos: "Run a sample",
      demosHelp: "Samples use the language selected above. Compare the known change with the measured result.",
      demoNormal: "Aligned", demoShifted: "Whole-track shift", demoLocal: "One shifted cue",
      demo_loading: "Loading sample audio and subtitles…",
      demo_unavailable: "The local sample could not be loaded. Check that the local service is running.",
      referenceNormal: "Known input: all four cues use the source audio times. No cue should be outside tolerance.",
      referenceShifted: (amount) => `Known input: all cues are ${amount}. Expect four flagged cues and a track-wide offset.`,
      referenceLocal: (cue, amount) => `Known input: only cue ${cue} is ${amount}. Expect just that cue to be flagged.`,
      limits: "WAV, MP3 or M4A, up to 2 minutes and 25 MB. Speech recognition runs on this device.",
      analyze: "Check alignment", running: "Recognizing speech and matching subtitles locally…", results: "Alignment results",
      listen: "Listen to the source audio", replay: "Play the matched speech", original: "SRT time", speech: "Estimated speech time",
      difference: "Subtitle offset", within: "Within tolerance", shifted: "Outside tolerance", review: "Review",
      startOutside: "The start time is outside tolerance.", endOutside: "The end time is outside tolerance.",
      bothOutside: "Both start and end times are outside tolerance.",
      unmatched: "A reliable speech match could not be found.", aligned: "on time",
      start: "Start", end: "End", early: "early", late: "late",
      cue: (number, line) => number === null ? `Line ${line}` : `Cue ${number} · line ${line}`,
      summary: (matched, shifted, uncertain, tolerance) =>
        `${matched} matched · ${shifted} outside tolerance · ${uncertain} to review. Tolerance ${tolerance} s.`,
      skipped: (count) => `Skipped ${count} blocks with missing or invalid timing or text.`,
      offset: (amount) => `Possible track-wide offset. Matched subtitles generally start ${amount}.`,
      done: "Alignment complete.",
      bad_subtitle: "Choose a UTF-8 .srt file.",
      no_cues: "No captions to align. Check the timecodes and subtitle text.",
      invalid_cues: "Choose 1–200 valid subtitle blocks, up to 3,000 characters per block.",
      media_too_large: "The audio exceeds 25 MB. Trim it to the section you want to check.",
      media_too_long: "The audio exceeds two minutes. Trim it to the section you want to check.",
      invalid_media: "Could not read the audio. Choose a playable WAV, MP3 or M4A.",
      model_missing: "The local speech model is missing. Follow the model setup steps in the project README.",
      unavailable: "The local alignment service is unavailable. Restart it and try again.",
      failed: "Alignment could not be completed. Check the audio and SRT, then try again.",
      playback_failed: "Could not play the audio. Check whether your browser supports the format.",
    },
  };

  const get = (id) => document.getElementById(id);
  const form = get("align-form");
  const player = get("listen");
  const status = get("align-status");
  const results = get("alignment-results");
  const languageKey = "srt-checker-language";
  let locale = /^zh\b/i.test(navigator.language) ? "zh" : "en";
  try {
    const saved = localStorage.getItem(languageKey);
    if (saved === "en" || saved === "zh") locale = saved;
  } catch {
    // The page still works with the browser language.
  }
  let statusKey;
  let statusIsError = false;
  let lastResult;
  let audioUrl;
  let stopAt = null;

  function label(key, ...args) {
    const value = text[locale][key];
    return typeof value === "function" ? value(...args) : value;
  }

  function setStatus(key, error = false) {
    statusKey = key;
    statusIsError = error;
    status.textContent = label(key);
    status.classList.toggle("error-text", error);
  }

  function applyLocale() {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    document.title = label("title");
    document.querySelectorAll("[data-text]").forEach((element) => {
      element.textContent = label(element.dataset.text);
    });
    document.querySelectorAll("[data-locale]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.locale === locale));
    });
    get("interface-language").setAttribute("aria-label", label("interface"));
    player.setAttribute("aria-label", label("listen"));
    if (statusKey) setStatus(statusKey, statusIsError);
    if (lastResult) renderRows();
  }

  function timestamp(ms) {
    const pad = (number, digits) => String(number).padStart(digits, "0");
    const minutes = Math.floor(ms / 60_000);
    const seconds = Math.floor(ms / 1000) % 60;
    return `${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(ms % 1000, 3)}`;
  }

  function delta(ms) {
    if (ms === 0) return label("aligned");
    const direction = label(ms < 0 ? "early" : "late");
    const seconds = (Math.abs(ms) / 1000).toFixed(3);
    return locale === "zh" ? `${direction} ${seconds} 秒` : `${seconds} s ${direction}`;
  }

  function playRange(start, end) {
    if (!Number.isFinite(player.duration)) {
      setStatus("playback_failed", true);
      return;
    }
    stopAt = Math.min(player.duration, end / 1000 + 0.25);
    player.currentTime = Math.max(0, start / 1000 - 0.15);
    player.play().catch(() => {
      stopAt = null;
      setStatus("playback_failed", true);
    });
  }

  player.addEventListener("timeupdate", () => {
    if (stopAt !== null && player.currentTime >= stopAt) {
      stopAt = null;
      player.pause();
    }
  });
  player.addEventListener("ended", () => { stopAt = null; });

  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }

  function detail(name, value) {
    const part = element("div");
    const data = typeof value === "string" ? element("dd", "timecode", value) : element("dd");
    if (typeof value !== "string") data.append(value);
    part.append(element("dt", null, label(name)), data);
    return part;
  }

  function outsideTolerance(row, tolerance) {
    return Math.max(Math.abs(row.startDelta), Math.abs(row.endDelta)) > tolerance;
  }

  function renderRow(cue, row, tolerance) {
    const item = element("li", "align-row");
    const outcome = !row ? "review" : outsideTolerance(row, tolerance) ? "shifted" : "within";
    item.dataset.outcome = outcome;
    const badge = { review: "review", shifted: "warning", within: "matched" }[outcome];
    const heading = element("div", "cue-heading");
    heading.append(
      element("span", `badge ${badge}`, label(outcome)),
      element("span", "cue-location", label("cue", cue.number, cue.line)),
    );
    const timings = element("dl", "cue-timing");
    timings.append(detail("original", cue.time));
    if (row) {
      const time = `${timestamp(row.audioStart)} – ${timestamp(row.audioEnd)}`;
      const playback = element("button", "timeline-button", time);
      playback.type = "button";
      playback.setAttribute("aria-label", `${label("replay")}: ${time}`);
      playback.addEventListener("click", () => playRange(row.audioStart, row.audioEnd));
      const differences = element("span", "cue-offset-detail",
        `${label("start")} ${delta(row.startDelta)} · ${label("end")} ${delta(row.endDelta)}`);
      const difference = detail("difference", differences);
      if (outcome === "shifted") {
        const startOutside = Math.abs(row.startDelta) > tolerance;
        const endOutside = Math.abs(row.endDelta) > tolerance;
        const reason = startOutside && endOutside ? "bothOutside" : startOutside ? "startOutside" : "endOutside";
        difference.lastElementChild.append(element("p", "cue-reason", label(reason)));
      }
      timings.append(detail("speech", playback), difference);
    } else {
      timings.append(detail("speech", element("span", "cue-location", label("unmatched"))));
    }
    item.append(heading, element("p", "cue-text", cue.text), timings);
    return item;
  }

  function renderRows() {
    const { captions, skipped, response, mediaName, subtitleName, demo, language } = lastResult;
    const { rows, trackOffset, tolerance } = response;
    const matched = rows.filter(Boolean);
    const shifted = matched.filter((row) => outsideTolerance(row, tolerance)).length;
    const summary = label("summary", matched.length, shifted, rows.length - matched.length, tolerance / 1000);
    get("alignment-files").textContent = `${mediaName} · ${subtitleName}`;
    get("result-summary").textContent = skipped ? `${summary} ${label("skipped", skipped)}` : summary;
    const reference = get("demo-reference");
    reference.hidden = !demo;
    if (demo === "normal") reference.textContent = label("referenceNormal");
    if (demo === "shifted") reference.textContent = label("referenceShifted", delta(language === "zh" ? -1200 : 1200));
    if (demo === "local") {
      reference.textContent = language === "zh"
        ? label("referenceLocal", 2, delta(-900))
        : label("referenceLocal", 3, delta(850));
    }
    const offset = get("track-offset");
    offset.hidden = trackOffset === null;
    offset.textContent = offset.hidden ? "" : label("offset", delta(trackOffset));
    get("alignment-rows").replaceChildren(...captions.map((cue, index) => renderRow(cue, rows[index], tolerance)));
    results.hidden = false;
  }

  async function runAlignment(getFiles) {
    const inputs = get("align-inputs");
    if (inputs.disabled) return;
    inputs.disabled = true;
    lastResult = undefined;
    results.hidden = true;
    stopAt = null;
    player.pause();
    try {
      const { media, subtitles, language, demo } = await getFiles();
      if (media.size > 25_000_000) return setStatus("media_too_large", true);
      if (!subtitles.name.toLowerCase().endsWith(".srt") || subtitles.size > 5_000_000) {
        return setStatus("bad_subtitle", true);
      }
      setStatus("running");
      let source;
      try {
        source = new TextDecoder("utf-8", { fatal: true }).decode(await subtitles.arrayBuffer());
      } catch {
        return setStatus("bad_subtitle", true);
      }
      const { blocks, captions } = window.SrtChecker.inspect(source);
      if (captions.length === 0) return setStatus("no_cues", true);
      if (captions.length > 200 || captions.some((cue) => [...cue.text].length > 3000)) {
        return setStatus("invalid_cues", true);
      }
      const body = new FormData();
      body.append("media", media);
      body.append("language", language);
      body.append("cues", JSON.stringify(captions.map(({ start, end, text }) => ({ start, end, text }))));
      let request;
      try {
        request = await fetch("/api/align", { method: "POST", body });
      } catch {
        return setStatus("unavailable", true);
      }
      if (request.status === 404) return setStatus("unavailable", true);
      const response = await request.json();
      if (!request.ok) {
        const key = Object.hasOwn(text[locale], response.error) ? response.error : "failed";
        return setStatus(key, true);
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      audioUrl = URL.createObjectURL(media);
      player.src = audioUrl;
      lastResult = {
        captions, skipped: blocks - captions.length, response, demo, language,
        mediaName: media.name, subtitleName: subtitles.name,
      };
      renderRows();
      setStatus("done");
      results.focus({ preventScroll: true });
      results.scrollIntoView({ block: "start" });
    } catch {
      setStatus(statusKey === "demo_loading" ? "demo_unavailable" : "failed", true);
    } finally {
      inputs.disabled = false;
    }
  }

  async function fetchSample(name) {
    const response = await fetch(`/alignment-samples/${name}`);
    if (!response.ok) throw new Error("Sample unavailable");
    const blob = await response.blob();
    return new File([blob], name, { type: blob.type });
  }

  for (const button of document.querySelectorAll("[data-demo]")) {
    button.addEventListener("click", () => {
      const language = get("spoken-language").value;
      const demo = button.dataset.demo;
      runAlignment(async () => {
        setStatus("demo_loading");
        const [media, subtitles] = await Promise.all([
          fetchSample(`${language}.wav`),
          fetchSample(`${language}-${demo}.srt`),
        ]);
        return { media, subtitles, language, demo };
      });
    });
  }

  document.querySelectorAll("[data-locale]").forEach((button) => {
    button.addEventListener("click", () => {
      locale = button.dataset.locale;
      try { localStorage.setItem(languageKey, locale); } catch { /* Local file storage can be restricted. */ }
      applyLocale();
    });
  });

  if (location.protocol === "file:") {
    get("local-service").hidden = false;
    form.hidden = true;
  }
  get("spoken-language").value = locale;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    runAlignment(() => ({
      media: get("audio-file").files[0],
      subtitles: get("subtitle-file").files[0],
      language: get("spoken-language").value,
    }));
  });
  applyLocale();
})();
