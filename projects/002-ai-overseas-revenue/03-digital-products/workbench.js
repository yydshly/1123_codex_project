(() => {
  "use strict";

  const { parseSrt, readTime, formatTime, scan, matchingSource, writeSrt, fileStem, zip, restoreDraft } = window.HandoffCore;
  const STORAGE = "subtitle-handoff-workbench-v1";
  const PROJECT_PREFIX = STORAGE + ":";
  const languages = ["en", "zh-CN"];
  const labels = { en: "英文", "zh-CN": "简中" };
  const $ = (id) => document.getElementById(id);
  const metadata = { name: $("project-name"), version: $("project-version"), reviewer: $("project-reviewer"), note: $("delivery-note") };
  const files = { en: { input: $("en-file"), name: $("en-file-name") }, "zh-CN": { input: $("zh-file"), name: $("zh-file-name") } };
  const editor = { start: $("cue-start"), end: $("cue-end"), text: $("cue-text") };
  const trackButtons = [...document.querySelectorAll("[data-edit-track]")];
  const cueList = $("cue-list");
  const player = $("media-player");
  const sessionMedia = new Map();
  const importRequests = new Map();
  const replaceDialog = $("replace-subtitles");

  function freshProject(name = "") {
    return {
      id: crypto.randomUUID?.() ?? String(Date.now()) + "-" + Math.random().toString(36).slice(2),
      name, version: "v1", reviewer: "", note: "", mediaName: "",
      tracks: { en: [], "zh-CN": [] }, fileNames: { en: "", "zh-CN": "" }, terms: [],
    };
  }

  function readProject(key, value) {
    try {
      const item = JSON.parse(value);
      return item?.id && key === PROJECT_PREFIX + item.id ? item : null;
    } catch { return null; }
  }

  const projects = [];
  let savedId;
  try {
    savedId = localStorage.getItem(STORAGE);
    for (const key of Object.keys(localStorage).filter((entry) => entry.startsWith(PROJECT_PREFIX))) {
      const item = readProject(key, localStorage.getItem(key));
      if (item) projects.push(item);
    }
  } catch {}
  if (!projects.length) projects.push(freshProject());
  let project = projects.find((item) => item.id === savedId) ?? projects[0];
  let track = "zh-CN";
  let selected = 0;
  let mediaUrl = "";
  let stopAt = null;
  let checks = {};
  let pendingReplacement;

  function save(item = project) {
    try {
      localStorage.setItem(PROJECT_PREFIX + item.id, JSON.stringify(item));
      if (item === project) localStorage.setItem(STORAGE, project.id);
    } catch {
      $("save-note").textContent = "本机暂时无法自动保存。请先保存项目备份。";
    }
  }

  function message(id, text = "", kind = "") {
    const node = $(id);
    node.textContent = text;
    node.dataset.kind = kind;
    node.hidden = !text;
  }

  function renderProjects() {
    $("project-switch").replaceChildren(...projects.map((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = (item.name.trim() || "未命名项目") + (item.restored ? "（从备份打开）" : "");
      option.selected = item === project;
      return option;
    }));
  }

  function loadMedia() {
    player.pause();
    stopAt = null;
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    const media = sessionMedia.get(project.id);
    mediaUrl = media ? URL.createObjectURL(media) : "";
    if (mediaUrl) player.src = mediaUrl;
    else { player.removeAttribute("src"); player.load(); }
    player.hidden = !mediaUrl;
    $("media-empty").hidden = Boolean(mediaUrl);
    $("media-file-name").textContent = project.mediaName
      ? project.mediaName + (media ? "" : "（重新选取回放）")
      : "选择客户定稿素材";
    $("media-note").textContent = media
      ? "播放器显示当前编辑轨的字幕。"
      : "字幕和项目信息已保留。回放时选取视频或音频文件。";
    showCaption();
  }

  function mediaDuration() {
    return mediaUrl && Number.isFinite(player.duration) ? Math.round(player.duration * 1000) : null;
  }

  function refreshFiles() {
    for (const language of languages) {
      const { name } = files[language];
      name.textContent = project.fileNames[language] || "选择已有的" + labels[language] + "字幕";
    }
    $("make-translation").disabled = !project.tracks.en.length || Boolean(project.tracks["zh-CN"].length);
  }

  function cueLabel(cue, index) {
    return (index + 1) + " · " + (cue.start || "待填") + " " + cue.text.replace(/\s+/g, " ").slice(0, 38);
  }

  function renderList() {
    const cues = project.tracks[track];
    cueList.replaceChildren(...cues.map((cue, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = cueLabel(cue, index);
      option.selected = index === selected;
      return option;
    }));
    $("track-counts").textContent = "英文 " + project.tracks.en.length + " 条 · 简中 " + project.tracks["zh-CN"].length + " 条";
    for (const button of trackButtons) button.setAttribute("aria-pressed", button.dataset.editTrack === track);
    refreshFiles();
  }

  function currentCue() { return project.tracks[track][selected]; }

  function cleanText(text) { return text.replace(/<\/?(?:b|i|u|s)\s*>|<\/?font(?:\s+[^<>]*)?>/gi, ""); }
  function normalize(text) { return cleanText(text).replace(/\s+/g, " ").trim().toLowerCase(); }

  function showCaption() {
    const time = Math.round(player.currentTime * 1000);
    const bodies = mediaUrl ? project.tracks[track].filter((cue) => {
      const start = readTime(cue.start);
      const end = readTime(cue.end);
      return start !== null && end !== null && time >= start && time < end;
    }).map((cue) => cleanText(cue.text)) : [];
    const text = bodies.join("\n").trim();
    $("caption-overlay").textContent = text;
    $("caption-overlay").hidden = !text;
  }

  function cueHints() {
    const cue = currentCue();
    if (!cue) return;
    const source = $("source-reference");
    const matches = track === "zh-CN" ? matchingSource(project.tracks.en, cue) : [];
    const excerpt = matches.map((item) => cleanText(item.text)).join("\n");
    const expected = project.terms.filter(({ en }) => normalize(excerpt).includes(normalize(en)));
    source.hidden = track !== "zh-CN";
    source.textContent = excerpt
      ? "同时间段英文\n" + excerpt + (expected.length ? "\n确认用词  " + expected.map(({ en, zh }) => en + " → " + zh).join("、") : "")
      : "这个时间段暂无对应英文。";
    const issues = [...checks[track].errors, ...checks[track].warnings]
      .filter((issue) => issue.index === selected).map((issue) => issue.message);
    const missing = expected.filter(({ zh }) => !cue.text.includes(zh));
    if (missing.length) issues.push("核对已确认译法  " + missing.map(({ zh }) => zh).join("、"));
    $("cue-warning").textContent = issues.join(" ");
    $("cue-warning").hidden = !issues.length;
    $("play-cue").disabled = !mediaUrl || readTime(cue.start) === null;
  }

  function chooseCue(index, currentTrack = track) {
    track = currentTrack;
    selected = Math.min(Math.max(0, index), Math.max(0, project.tracks[track].length - 1));
    renderList();
    const cue = currentCue();
    $("cue-editor").hidden = !cue;
    $("editor-empty").hidden = Boolean(cue);
    if (cue) {
      for (const [key, input] of Object.entries(editor)) input.value = cue[key];
      cueHints();
    }
    showCaption();
  }

  function updateChecks() {
    const details = $("check-details");
    const list = $("check-list");
    const issues = [];
    let errors = 0;
    for (const language of languages) {
      const report = scan(project.tracks[language], mediaDuration());
      checks[language] = report;
      errors += report.errors.length;
      for (const issue of [...report.errors, ...report.warnings]) issues.push({ ...issue, language });
    }
    const missing = languages.filter((key) => !project.tracks[key].length).map((key) => labels[key] + " SRT");
    if (!project.name.trim()) missing.unshift("项目名称");
    const blockers = missing.length ? "待填写  " + missing.join("、") + "。" : "";
    const warnings = issues.length - errors;
    $("export-summary").textContent = blockers + (errors || warnings
      ? "需修正 " + errors + " 项，提醒 " + warnings + " 项。"
      : (blockers ? "" : "两条字幕已齐全，可以导出。"));
    $("export-project").disabled = Boolean(missing.length || errors);
    details.hidden = !issues.length;
    const rows = issues.slice(0, 30).map((issue) => {
      const li = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "text-button";
      button.textContent = labels[issue.language] + "第 " + (issue.index + 1) + " 条 · " + issue.message;
      button.addEventListener("click", () => {
        chooseCue(issue.index, issue.language);
        editor.start.focus();
      });
      li.append(button);
      return li;
    });
    if (rows.length < issues.length) {
      const remaining = document.createElement("li");
      remaining.textContent = "还有 " + (issues.length - rows.length) + " 项。修正前面的条目后继续查看。";
      rows.push(remaining);
    }
    list.replaceChildren(...rows);
  }

  function renderTerms() {
    $("term-list").replaceChildren(...project.terms.map(({ en, zh }, index) => {
      const row = document.createElement("li");
      const label = document.createElement("span");
      label.textContent = en + " → " + zh;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "text-button";
      remove.textContent = "移除";
      remove.setAttribute("aria-label", "移除术语 " + en);
      remove.addEventListener("click", () => {
        project.terms.splice(index, 1);
        save();
        renderTerms();
        cueHints();
      });
      row.append(label, remove);
      return row;
    }));
  }

  function openProject(item) {
    project = item;
    for (const [key, input] of Object.entries(metadata)) input.value = item[key];
    $("media-file").value = "";
    for (const { input } of Object.values(files)) input.value = "";
    message("import-message");
    message("export-message");
    renderProjects();
    renderTerms();
    loadMedia();
    updateChecks();
    chooseCue(0, !item.tracks["zh-CN"].length && item.tracks.en.length ? "en" : "zh-CN");
    save();
  }

  function addProject(item) {
    projects.push(item);
    openProject(item);
  }

  function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  $("save-backup").addEventListener("click", () => {
    const content = JSON.stringify({ format: "subtitle-handoff-project", version: 1, project }, null, 2);
    const filename = fileStem(project.name, "未命名项目") + "-字幕项目.json";
    downloadFile(new Blob([content], { type: "application/json" }), filename);
    message("import-message", "已保存项目备份。回放所需的原始视频或音频另行保留。");
  });
  $("open-backup").addEventListener("change", async (event) => {
    const input = event.target;
    const [file] = input.files;
    if (!file) return;
    try {
      const content = await file.text();
      if (input.files[0] !== file) return;
      const draft = restoreDraft(content);
      addProject({ ...freshProject(), ...draft, restored: true });
      message("import-message", "备份已作为独立项目打开。选取原素材后可以回放。");
    } catch (error) {
      if (input.files[0] === file) message("import-message", error.message, "error");
    } finally {
      if (input.files[0] === file) input.value = "";
    }
  });

  function applySubtitleImport({ target, language, name, cues }) {
    if (target !== project) return;
    target.tracks[language] = cues;
    target.fileNames[language] = name;
    save();
    updateChecks();
    chooseCue(0, language);
    message("import-message", "已导入" + labels[language] + "字幕，共 " + cues.length + " 条。");
  }

  replaceDialog.addEventListener("close", () => {
    const replacement = pendingReplacement;
    pendingReplacement = undefined;
    if (!replacement || replacement.target !== project) return;
    if (replaceDialog.returnValue === "replace") applySubtitleImport(replacement);
    else message("import-message", "已保留当前" + labels[replacement.language] + "字幕。");
  });

  $("new-project").addEventListener("click", () => { addProject(freshProject()); metadata.name.focus(); });
  $("project-switch").addEventListener("change", (event) => {
    const item = projects.find((candidate) => candidate.id === event.target.value);
    if (item) openProject(item);
  });
  window.addEventListener("storage", (event) => {
    if (!event.key?.startsWith(PROJECT_PREFIX) || !event.newValue) return;
    const item = readProject(event.key, event.newValue);
    if (!item || item.id === project.id) return;
    const index = projects.findIndex((candidate) => candidate.id === item.id);
    if (index < 0) projects.push(item);
    else projects[index] = item;
    renderProjects();
  });
  for (const [key, input] of Object.entries(metadata)) {
    input.addEventListener("input", () => {
      project[key] = input.value;
      if (key === "name") { renderProjects(); updateChecks(); }
      save();
    });
  }
  $("media-file").addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (!file) return;
    const previousName = project.mediaName;
    project.mediaName = file.name;
    sessionMedia.set(project.id, file);
    loadMedia();
    updateChecks();
    cueHints();
    save();
    if (previousName && previousName !== file.name) {
      message("import-message", "素材已从「" + previousName + "」换成「" + file.name + "」。请回放核对时间码。");
    }
  });
  for (const [language, { input }] of Object.entries(files)) {
    input.addEventListener("change", async () => {
      const [file] = input.files;
      if (!file) return;
      const target = project;
      const request = Symbol();
      importRequests.set(language, request);
      try {
        const utf8 = new TextDecoder("utf-8", { fatal: true });
        const cues = parseSrt(utf8.decode(await file.arrayBuffer()));
        if (target !== project || importRequests.get(language) !== request) return;
        const incoming = { target, language, name: file.name, cues };
        if (target.tracks[language].some((cue) => cue.text.trim())) {
          pendingReplacement = incoming;
          $("replace-summary").textContent = "导入「" + file.name + "」会替换这个项目里现有的"
            + labels[language] + "字幕。请确认是否采用新文件。";
          replaceDialog.returnValue = "";
          if (!replaceDialog.open) replaceDialog.showModal();
        } else {
          applySubtitleImport(incoming);
        }
      } catch (error) {
        if (target === project && importRequests.get(language) === request) {
          message("import-message", labels[language] + "文件读取失败。请确认文件是 UTF-8 SRT。 " + error.message, "error");
        }
      } finally { if (input.files[0] === file) input.value = ""; }
    });
  }
  $("load-sample").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      const base = "kit/example/product-demo_v1.";
      const [english, chinese, media] = await Promise.all(["en.srt", "zh-CN.srt", "mp4"].map(async (extension) => {
        const response = await fetch(base + extension);
        if (!response.ok) throw Error("案例文件读取失败。");
        return extension === "mp4" ? response.blob() : response.text();
      }));
      const sample = freshProject("Alder Board 演示");
      sample.mediaName = "product-demo_v1.mp4";
      sample.reviewer = "客户审核";
      sample.tracks = { en: parseSrt(english), "zh-CN": parseSrt(chinese) };
      sample.fileNames = { en: "product-demo_v1.en.srt", "zh-CN": "product-demo_v1.zh-CN.srt" };
      sample.terms = [{ en: "Invite members", zh: "邀请成员" }];
      sessionMedia.set(sample.id, media);
      addProject(sample);
      message("import-message", "案例已作为独立项目打开，可以修改并导出。");
    } catch {
      message("import-message", "案例载入失败，请重试或导入自己的文件。", "error");
    } finally { button.disabled = false; }
  });
  $("make-translation").addEventListener("click", () => {
    project.tracks["zh-CN"] = project.tracks.en.map(({ start, end }) => ({ start, end, text: "" }));
    project.fileNames["zh-CN"] = "从英文时间轴建立的底稿";
    updateChecks();
    chooseCue(0, "zh-CN");
    save();
    message("import-message", "简中底稿已建立，可以逐条填写译文。");
  });
  for (const button of trackButtons) button.addEventListener("click", () => chooseCue(0, button.dataset.editTrack));
  cueList.addEventListener("change", () => chooseCue(Number(cueList.value)));
  for (const [key, input] of Object.entries(editor)) {
    input.addEventListener("input", () => {
      const cue = currentCue();
      if (!cue) return;
      cue[key] = input.value;
      cueList.options[selected].textContent = cueLabel(cue, selected);
      updateChecks();
      cueHints();
      showCaption();
      save();
    });
  }
  $("add-cue").addEventListener("click", () => {
    const cues = project.tracks[track];
    const time = mediaUrl ? Math.round(player.currentTime * 1000) : (readTime(cues.at(-1)?.end ?? "") ?? 0);
    cues.push({ start: formatTime(time), end: formatTime(time + 2000), text: "" });
    updateChecks();
    chooseCue(cues.length - 1);
    save();
    editor.text.focus();
  });
  $("remove-cue").addEventListener("click", () => {
    project.tracks[track].splice(selected, 1);
    updateChecks();
    chooseCue(selected);
    save();
  });
  $("play-cue").addEventListener("click", () => {
    const cue = currentCue();
    const start = readTime(cue.start);
    if (start === null || !mediaUrl) return;
    const end = readTime(cue.end);
    stopAt = end !== null && end > start ? end / 1000 : null;
    player.currentTime = start / 1000;
    showCaption();
    player.play().catch(() => message("import-message", "当前素材无法开始播放，请换一份浏览器支持的文件。", "error"));
  });
  player.addEventListener("loadedmetadata", () => { updateChecks(); cueHints(); });
  player.addEventListener("error", () => {
    if (mediaUrl) message("import-message", "当前浏览器无法播放这份素材，请尝试 MP4 或 WAV。", "error");
  });
  player.addEventListener("seeked", showCaption);
  player.addEventListener("timeupdate", () => {
    showCaption();
    if (stopAt !== null && player.currentTime >= stopAt) { stopAt = null; player.pause(); }
  });

  $("term-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const en = $("term-source").value.trim();
    const zh = $("term-target").value.trim();
    if (!normalize(en) || !zh) return;
    const old = project.terms.find((term) => normalize(term.en) === normalize(en));
    if (old) old.zh = zh;
    else project.terms.push({ en, zh });
    event.currentTarget.reset();
    save();
    renderTerms();
    cueHints();
  });

  $("export-project").addEventListener("click", () => {
    updateChecks();
    if ($("export-project").disabled) return;
    const version = project.version.trim() || "v1";
    const stem = fileStem(project.name, "subtitle-project") + "-" + fileStem(version, "v1");
    const warningLines = languages.flatMap((language) => checks[language].warnings.map((issue) =>
      labels[language] + "第 " + (issue.index + 1) + " 条 " + issue.message));
    const note = [
      "字幕交付说明", "",
      "项目  " + project.name.trim(),
      "版本  " + version,
      "参考素材  " + (project.mediaName || "—"),
      "平台或审核人  " + (project.reviewer.trim() || "—"),
      "", "交付文件",
      ...languages.map((language) => stem + "." + language + ".srt · " + project.tracks[language].length + " 条"),
      "", "已确认术语", ...project.terms.map(({ en, zh }) => en + " → " + zh),
      "", "检查提醒", ...(warningLines.length ? warningLines : ["本次格式检查无提醒。"]),
      "", "交付备注", project.note.trim() || "—", "",
    ].join("\n");
    const entries = languages.map((language) => [stem + "." + language + ".srt", writeSrt(project.tracks[language])]);
    entries.push(["交付说明.txt", note]);
    const filename = stem + "-交付.zip";
    downloadFile(zip(entries), filename);
    message("export-message", "已打包 " + filename);
  });

  openProject(project);
})();
