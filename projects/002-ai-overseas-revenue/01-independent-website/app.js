(() => {
  "use strict";

  const { defaultRules, chineseRules, inspect } = window.SrtChecker;
  const languages = window.SrtLanguages;
  const get = (id) => document.getElementById(id);
  const fileInput = get("file-input");
  const dropZone = get("drop-zone");
  const rulesForm = get("rules-form");
  const results = get("results");
  const fileStatus = get("file-status");
  const copyStatus = get("copy-status");
  const manualCopy = get("manual-copy");
  const reportField = get("report-text");
  const issueList = get("issue-list");
  const reportNote = get("report-note");
  const displayLimit = 200;
  const presets = { en: defaultRules, zh: chineseRules };
  const example = `1
00:00:01,000 --> 00:00:03,500
Open your workspace.
打开工作区。

2
00:00:03,000 --> 00:00:05,000
选择一个团队。

3
00:00:06,000 --> 00:00:06,500
Save your changes.`;

  const languageKey = "srt-checker-language";
  let language = /^zh\b/i.test(navigator.language) ? "zh" : "en";
  try {
    const savedLanguage = localStorage.getItem(languageKey);
    if (savedLanguage === "en" || savedLanguage === "zh") language = savedLanguage;
  } catch {
    // Some browsers restrict storage for local files.
  }
  let rules = defaultRules;
  let currentFile;
  let report = "";
  let revision = 0;
  let fileMessage;
  let rulesMessage;

  function translate(key, ...args) {
    const label = languages[language][key];
    return typeof label === "function" ? label(...args) : label;
  }

  function applyLanguage() {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.title = translate("title");
    document.querySelector('meta[name="description"]').content = translate("description");
    for (const element of document.querySelectorAll("[data-i18n]")) {
      element.textContent = translate(element.dataset.i18n);
    }
    for (const element of document.querySelectorAll("[data-i18n-label]")) {
      element.setAttribute("aria-label", translate(element.dataset.i18nLabel));
    }
    for (const button of document.querySelectorAll("[data-language]")) {
      button.setAttribute("aria-pressed", String(button.dataset.language === language));
    }
    get("active-rule-limits").textContent = translate("activeLimits", rules);
    if (rulesMessage) get("rules-status").textContent = translate(rulesMessage);
    const lastFileMessage = fileMessage;
    if (currentFile) renderResults();
    if (lastFileMessage) showFileMessage(lastFileMessage.key, lastFileMessage.options);
  }

  function setFileStatus(message, { error = false, announceOnly = false } = {}) {
    fileStatus.textContent = message;
    fileStatus.classList.toggle("error-text", error);
    fileStatus.classList.toggle("visually-hidden", announceOnly);
  }

  function showFileMessage(key, options) {
    fileMessage = { key, options };
    setFileStatus(translate(key), options);
  }

  function issueLocation(issue) {
    let subject = translate("file");
    if (issue.cue !== null) subject = translate("cue", issue.cue);
    else if (issue.line !== null) subject = translate("unnumbered");
    return issue.line === null ? subject : `${subject} · ${translate("line", issue.line)}`;
  }

  function issueMessage(issue) {
    const localized = languages[language].issues?.[issue.code];
    return typeof localized === "function" ? localized(issue.details) : localized ?? issue.message;
  }

  function renderIssue(issue) {
    const row = document.createElement("li");
    row.className = "issue";
    row.dataset.code = issue.code;

    const label = document.createElement("span");
    label.className = `badge ${issue.severity}`;
    label.textContent = translate(issue.severity);

    const content = document.createElement("div");
    const headline = document.createElement("p");
    headline.className = "issue-location";
    headline.textContent = issueLocation(issue);
    content.append(headline);

    if (issue.time) {
      const time = document.createElement("p");
      time.className = "timecode";
      time.textContent = issue.time;
      content.append(time);
    }
    const message = document.createElement("p");
    message.className = "issue-message";
    message.textContent = issueMessage(issue);
    content.append(message);
    row.append(label, content);
    return row;
  }

  function renderResults() {
    const { text } = currentFile;
    const name = currentFile.name ?? translate("exampleName");
    const result = inspect(text, rules);
    get("filename").textContent = name;
    get("block-count").textContent = result.blocks;
    get("error-count").textContent = result.errors;
    get("warning-count").textContent = result.warnings;
    copyStatus.textContent = "";
    manualCopy.hidden = true;
    reportField.value = "";
    const summary = translate("summary", result.blocks, result.errors, result.warnings);
    reportNote.hidden = Boolean(result.issues.length && result.issues.length <= displayLimit);
    reportNote.textContent = result.issues.length > displayLimit
      ? translate("limitNote", displayLimit)
      : translate("noIssues");

    issueList.replaceChildren(...result.issues.slice(0, displayLimit).map(renderIssue));
    report = [
      translate("reportTitle", name),
      summary,
      translate("reportRules", rules),
      "",
      ...result.issues.map((issue) => {
        const time = issue.time ? ` | ${issue.time}` : "";
        return `[${translate(issue.severity).toUpperCase()}] ${issueLocation(issue)}${time} | ${issueMessage(issue)}`;
      }),
    ].join("\n").trimEnd();

    results.hidden = false;
    fileMessage = undefined;
    setFileStatus(summary, { announceOnly: true });
  }

  function showFileError(key) {
    results.hidden = true;
    currentFile = undefined;
    showFileMessage(key, { error: true });
  }

  async function readFile(file) {
    const request = ++revision;
    currentFile = undefined;
    results.hidden = true;
    if (!file.name.toLowerCase().endsWith(".srt")) {
      showFileError("wrongExtension");
      return;
    }
    if (file.size > 5_000_000) {
      showFileError("tooLarge");
      return;
    }

    showFileMessage("readingFile");
    let contents;
    try {
      contents = await file.arrayBuffer();
    } catch {
      if (request === revision) showFileError("unreadableFile");
      return;
    }
    if (request !== revision) return;

    let text;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(contents);
    } catch {
      showFileError("invalidEncoding");
      return;
    }
    currentFile = { name: file.name, text };
    renderResults();
  }

  get("choose-file").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    const [file] = fileInput.files;
    if (file) readFile(file);
    fileInput.value = "";
  });

  get("try-example").addEventListener("click", () => {
    revision++;
    currentFile = { text: example };
    renderResults();
  });

  document.addEventListener("dragover", (event) => {
    if (event.dataTransfer.types.includes("Files")) event.preventDefault();
  });
  document.addEventListener("drop", (event) => {
    if (event.dataTransfer.files.length) event.preventDefault();
  });
  dropZone.addEventListener("dragover", (event) => {
    if (event.dataTransfer.types.includes("Files")) {
      event.dataTransfer.dropEffect = "copy";
      dropZone.classList.add("dragging");
    }
  });
  dropZone.addEventListener("dragleave", (event) => {
    if (!dropZone.contains(event.relatedTarget)) dropZone.classList.remove("dragging");
  });
  dropZone.addEventListener("drop", (event) => {
    dropZone.classList.remove("dragging");
    const files = event.dataTransfer.files;
    if (files.length === 1) readFile(files[0]);
    if (files.length > 1) {
      showFileMessage("multipleFiles", { error: true });
    }
  });

  for (const button of document.querySelectorAll("[data-language]")) {
    button.addEventListener("click", () => {
      if (language === button.dataset.language) return;
      language = button.dataset.language;
      try {
        localStorage.setItem(languageKey, language);
      } catch {
        // The choice still applies to the open page.
      }
      applyLanguage();
    });
  }

  for (const button of rulesForm.querySelectorAll("[data-preset]")) {
    button.addEventListener("click", () => {
      for (const [name, value] of Object.entries(presets[button.dataset.preset])) {
        rulesForm.elements.namedItem(name).value = value;
      }
      rulesForm.requestSubmit();
    });
  }

  rulesForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const changedRules = Object.fromEntries(
      [...new FormData(rulesForm)].map(([name, value]) => [name, Number(value)]),
    );
    if (changedRules.minDuration > changedRules.maxDuration) {
      rulesMessage = "invalidRules";
      get("rules-status").textContent = translate(rulesMessage);
      return;
    }
    rules = changedRules;
    get("active-rule-limits").textContent = translate("activeLimits", rules);
    rulesMessage = "rulesApplied";
    get("rules-status").textContent = translate(rulesMessage);
    if (currentFile) renderResults();
  });

  get("copy-report").addEventListener("click", async () => {
    const requestedReport = report;
    try {
      await navigator.clipboard.writeText(requestedReport);
      if (report !== requestedReport || results.hidden) return;
      manualCopy.hidden = true;
      copyStatus.textContent = translate("copied");
    } catch {
      if (report !== requestedReport || results.hidden) return;
      reportField.value = requestedReport;
      manualCopy.hidden = false;
      reportField.focus();
      reportField.select();
      copyStatus.textContent = translate("manualCopy");
    }
  });

  applyLanguage();
})();
