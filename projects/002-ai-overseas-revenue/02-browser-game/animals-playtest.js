(() => {
  "use strict";

  const STORAGE_PREFIX = "animals-playtest-v1:";
  const themes = window.ANIMAL_THEMES;
  const byId = (id) => document.getElementById(id);

  window.createAnimalPlaytest = (resetGame) => {
    const panel = byId("animal-playtest");
    const recordButton = byId("animal-record");
    const endButton = byId("animal-record-end");
    const exportButton = byId("animal-record-export");
    const observations = {
      completion: byId("observe-completion"),
      recognition: byId("observe-recognition"),
      replay: byId("observe-replay"),
    };
    const records = new Map();
    let storage;
    let active = null;
    let firstQuestionAt = null;

    function loadRecord(key, value) {
      if (!key?.startsWith(STORAGE_PREFIX)) return;
      try {
        const record = JSON.parse(value);
        if (record?.id === key.slice(STORAGE_PREFIX.length)) records.set(record.id, record);
      } catch {
        // One malformed entry should not hide other trials.
      }
    }

    try {
      storage = window.localStorage;
      for (const key of Object.keys(storage)) loadRecord(key, storage.getItem(key));
    } catch {
      storage = undefined;
    }

    function sortedRecords() {
      return [...records.values()].sort((a, b) => a.created - b.created || a.id.localeCompare(b.id));
    }

    function save() {
      try {
        storage?.setItem(STORAGE_PREFIX + active.id, JSON.stringify(active));
      } catch {
        storage = undefined;
      }
      if (panel.open) render();
    }

    function observationText(value, independent) {
      if (value === "independent") return independent;
      if (value === "help") return "有提示或代点";
      return "独立性未确认";
    }

    function modeLabel(mode) {
      // Saved records from before the mode picker used only the name prompts.
      return mode === "call" ? "听叫声" : "听名字";
    }

    function firstTheme(record) {
      return themes[record.theme] ?? themes.classic;
    }

    function nextTheme(record) {
      return themes[record.replayTheme] ?? firstTheme(record);
    }

    function photoResult(record, animal) {
      if (!Object.hasOwn(record.changed, animal)) return "未到";
      const choice = record.changed[animal];
      if (choice === null) return "未点";
      return choice ? "首选对" : "首选错";
    }

    function observedCompletion(record) {
      return record.solved === 6 ? observationText(record.observed.completion, "自己玩完") : "";
    }

    function observedRecognition(record) {
      return Object.values(record.changed).some((value) => value !== null)
        ? observationText(record.observed.recognition, "自己选图") : "";
    }

    function observedReplay(record) {
      if (record.replayed) return `已重开 · ${observationText(record.observed.replay, "主动点")}`;
      return record.solved === 6 ? "未重开" : "—";
    }

    function recordRow(record, index) {
      const row = document.createElement("tr");
      const heading = document.createElement("th");
      heading.scope = "row";
      heading.textContent = `第 ${index + 1} 位`;
      row.append(heading);
      const completion = [record.started ? `${record.solved}/6` : "未开局", observedCompletion(record)];
      const theme = firstTheme(record);
      const recognition = theme.animals.map(({ id, name }) => `${name}${photoResult(record, id)}`);
      recognition.push(observedRecognition(record));
      const first = record.firstCorrectMs === null ? "—" : `${(record.firstCorrectMs / 1000).toFixed(1)} 秒`;
      const mode = record.started ? modeLabel(record.mode) : "—";
      const replay = record.replayed
        ? `${observedReplay(record)} · ${nextTheme(record).name} · ${modeLabel(record.replayMode ?? record.mode)}`
        : observedReplay(record);
      const values = [
        record.started ? theme.name : "—", mode, first, completion.filter(Boolean).join(" · "),
        record.started ? recognition.filter(Boolean).join(" · ") : "—", replay,
      ];
      for (const value of values) {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
      }
      return row;
    }

    function render() {
      const players = sortedRecords();
      recordButton.disabled = Boolean(active);
      endButton.disabled = !active;
      exportButton.disabled = players.length === 0;
      byId("animal-record-status").textContent = active
        ? `正在记录第 ${players.indexOf(active) + 1} 位。`
        : "未开启记录。可以直接试玩。";
      byId("animal-storage-notice").hidden = Boolean(storage);
      byId("animal-observations").hidden = !active;
      if (active) {
        observations.completion.disabled = active.solved < 6;
        observations.recognition.disabled = !observedRecognition(active);
        observations.replay.disabled = !active.replayed;
        for (const [field, select] of Object.entries(observations)) select.value = active.observed[field];
      }

      const started = players.filter((player) => player.started);
      const startsByTheme = Object.values(themes).map((theme) => {
        const themePlayers = started.filter((player) => firstTheme(player) === theme);
        const callCount = themePlayers.filter((player) => player.mode === "call").length;
        return `${theme.name} ${themePlayers.length} 人（听名字 ${themePlayers.length - callCount}、听叫声 ${callCount}）`;
      }).join(" · ");
      const completed = players.filter((player) => player.solved === 6);
      const independent = completed.filter((player) => player.observed.completion === "independent").length;
      const changed = players.flatMap((player) => Object.values(player.changed)).filter((value) => value !== null);
      const firstChoice = changed.length ? `${changed.filter(Boolean).length}/${changed.length} 题` : "暂无";
      const replayed = players.filter((player) => player.replayed);
      const voluntary = replayed.filter((player) => player.observed.replay === "independent").length;
      byId("animal-record-summary").textContent = players.length
        ? `${startsByTheme} · 完成首轮 ${completed.length} 人（确认独立 ${independent} 人） · 换图首选对 ${firstChoice} · 重开 ${replayed.length} 人（确认主动 ${voluntary} 人）`
        : "还没有试玩记录。";
      byId("animal-record-table").hidden = players.length === 0;
      byId("animal-record-rows").replaceChildren(...players.map(recordRow));
    }

    recordButton.addEventListener("click", () => {
      if (active) return;
      const created = Date.now();
      const id = window.crypto?.randomUUID?.() ?? `${created}-${Math.random().toString(36).slice(2)}`;
      active = {
        id, created, started: false, theme: null, mode: null, solved: 0, firstCorrectMs: null, changed: {},
        replayed: false, replayTheme: null, replayMode: null,
        observed: { completion: "", recognition: "", replay: "" },
      };
      firstQuestionAt = null;
      records.set(id, active);
      save();
      panel.open = false;
      resetGame();
    });

    endButton.addEventListener("click", () => {
      active = null;
      render();
    });

    for (const [field, select] of Object.entries(observations)) {
      select.addEventListener("change", () => {
        if (!active) return;
        active.observed[field] = select.value;
        save();
      });
    }

    exportButton.addEventListener("click", () => {
      const photoColumns = (theme) => theme.animals.map(({ name }) => `${name}换图`);
      const rows = [[
        "试玩", "记录时间", "已开局", "首次选对（毫秒）", "首轮答对题数", "首轮观察",
        ...photoColumns(themes.classic), "换图观察", "再玩", "首轮玩法", "下一轮玩法",
        "首轮主题", "下一轮主题", ...photoColumns(themes.farm),
      ]];
      for (const [index, record] of sortedRecords().entries()) {
        const theme = firstTheme(record);
        const photoValues = (columnTheme) => columnTheme.animals.map(({ id }) =>
          record.started && columnTheme === theme ? photoResult(record, id) : "");
        rows.push([
          index + 1, new Date(record.created).toISOString(), record.started ? "是" : "否",
          record.firstCorrectMs ?? "", record.solved, observedCompletion(record),
          ...photoValues(themes.classic), observedRecognition(record), observedReplay(record),
          record.started ? modeLabel(record.mode) : "", record.replayed ? modeLabel(record.replayMode ?? record.mode) : "",
          record.started ? theme.name : "", record.replayed ? nextTheme(record).name : "", ...photoValues(themes.farm),
        ]);
      }
      const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n");
      const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "动物在哪里-试玩记录.csv";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });

    panel.addEventListener("toggle", () => { if (panel.open) render(); });
    window.addEventListener("storage", (event) => {
      loadRecord(event.key, event.newValue);
      if (panel.open) render();
    });

    return {
      startRound(theme, mode, restarting) {
        if (!active) return;
        if (restarting) {
          if (active.solved < 6 || active.replayed) return;
          active.replayed = true;
          active.replayTheme = theme;
          active.replayMode = mode;
        } else {
          active.started = true;
          active.theme = theme;
          active.mode = mode;
        }
        save();
      },
      showQuestion(animal, newPhoto) {
        if (!active?.started || active.solved === 6) return;
        firstQuestionAt ??= performance.now();
        if (newPhoto) {
          active.changed[animal] = null;
          save();
        }
      },
      choose(animal, correct) {
        if (!active?.started || active.solved === 6) return;
        let changed = false;
        if (active.changed[animal] === null) {
          active.changed[animal] = correct;
          changed = true;
        }
        if (correct) {
          active.firstCorrectMs ??= Math.round(performance.now() - firstQuestionAt);
          active.solved++;
          changed = true;
        }
        if (changed) save();
      },
    };
  };
})();
