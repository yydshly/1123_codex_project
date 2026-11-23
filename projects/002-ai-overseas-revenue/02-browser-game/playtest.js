(() => {
  "use strict";

  const ACTIVE_TARGET_MS = 60_000;
  const INPUT_WINDOW_MS = 5_000;
  const STORAGE_PREFIX = "cargo-switch-playtest-v1:";
  const byId = (id) => document.getElementById(id);
  const panel = byId("playtest-log");
  const records = new Map();
  let storage;
  let current = null;
  let lastTick = null;
  let activeUntil = null;
  let lastCheckpoint = 0;

  function loadRecord(key, value) {
    if (!key.startsWith(STORAGE_PREFIX)) return;
    try {
      const record = JSON.parse(value);
      if (record?.id === key.slice(STORAGE_PREFIX.length)) records.set(record.id, record);
    } catch {
      // Ignore malformed entries so the other records are still available.
    }
  }

  try {
    storage = window.localStorage;
    for (const key of Object.keys(storage)) loadRecord(key, storage.getItem(key));
  } catch {
    storage = undefined;
  }

  function playerList() {
    return [...records.values()].sort((a, b) => a.created - b.created || a.id.localeCompare(b.id));
  }

  function seconds(ms) {
    return ms === null ? "—" : `${(ms / 1000).toFixed(1)}s`;
  }

  function yesNo(value) {
    return value ? "Yes" : "No";
  }

  function render() {
    const players = playerList();
    byId("record-next").disabled = Boolean(current);
    byId("record-end").disabled = !current;
    byId("export-log").disabled = players.length === 0;
    byId("storage-notice").hidden = Boolean(storage);
    byId("recording-status").textContent = current
      ? `Recording player ${players.indexOf(current) + 1}.`
      : "Practice mode. Play here without adding a record.";

    const firsts = players.flatMap((player) => player.firstCorrectMs === null ? [] : [player.firstCorrectMs]);
    firsts.sort((a, b) => a - b);
    const mid = Math.floor(firsts.length / 2);
    const median = firsts.length ? (firsts[mid] + firsts[Math.ceil(firsts.length / 2) - 1]) / 2 : null;
    byId("players-started").textContent = players.filter((player) => player.started).length;
    byId("median-first").textContent = seconds(median);
    byId("players-finished").textContent = players.filter((player) => player.firstRoundComplete).length;
    byId("players-replayed").textContent = players.filter((player) => player.replayed).length;
    byId("players-60s").textContent = players.filter((player) => player.activeMs >= ACTIVE_TARGET_MS).length;
    byId("empty-log").hidden = players.length > 0;
    byId("table-wrap").hidden = players.length === 0;

    const rows = players.map((player, index) => {
      const row = document.createElement("tr");
      const name = document.createElement("th");
      name.scope = "row";
      name.textContent = `Player ${index + 1}`;
      row.append(name);
      const values = [
        yesNo(player.started), seconds(player.firstCorrectMs), yesNo(player.firstRoundComplete),
        yesNo(player.replayed), seconds(Math.floor(player.activeMs / 100) * 100),
        yesNo(player.activeMs >= ACTIVE_TARGET_MS),
      ];
      for (const value of values) {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
      }
      return row;
    });
    byId("playtest-rows").replaceChildren(...rows);
  }

  function save() {
    if (current && storage) {
      try {
        storage.setItem(STORAGE_PREFIX + current.id, JSON.stringify(current));
      } catch {
        storage = undefined;
      }
    }
    lastCheckpoint = performance.now();
    if (panel.open) render();
  }

  function nextPlayer() {
    if (current) return;
    const created = Date.now();
    const id = window.crypto?.randomUUID?.() ?? `${created}-${Math.random().toString(36).slice(2)}`;
    current = {
      id, created, started: false, firstCorrectMs: null,
      firstRoundComplete: false, replayed: false, activeMs: 0, elapsedMs: 0,
    };
    records.set(id, current);
    save();
  }

  function startRound(replay) {
    if (!current) return;
    current.started = true;
    if (replay && current.firstRoundComplete) current.replayed = true;
    save();
  }

  function resumeClock(now) {
    lastTick = current ? now : null;
    activeUntil = null;
  }

  function tick(now) {
    if (!current || lastTick === null || now <= lastTick) return;
    const reachedTarget = current.activeMs >= ACTIVE_TARGET_MS;
    current.elapsedMs += now - lastTick;
    if (activeUntil !== null) current.activeMs += Math.max(0, Math.min(now, activeUntil) - lastTick);
    lastTick = now;
    if ((!reachedTarget && current.activeMs >= ACTIVE_TARGET_MS) || now - lastCheckpoint >= 1_000) save();
  }

  function sorted(now, correct) {
    if (!current) return;
    activeUntil = now + INPUT_WINDOW_MS;
    if (correct && current.firstCorrectMs === null) {
      current.firstCorrectMs = Math.round(current.elapsedMs);
      save();
    }
  }

  function stopClock() {
    lastTick = null;
    activeUntil = null;
    save();
  }

  function finishRound() {
    if (current) current.firstRoundComplete = true;
    stopClock();
  }

  function endPlayer() {
    stopClock();
    current = null;
    render();
  }

  function exportLog() {
    save();
    const lines = ["participant_id,started,first_correct_ms,first_round_finished,played_again,active_play_ms,reached_60s"];
    for (const player of playerList()) {
      lines.push([
        player.id, player.started, player.firstCorrectMs ?? "", player.firstRoundComplete,
        player.replayed, Math.floor(player.activeMs), player.activeMs >= ACTIVE_TARGET_MS,
      ].join(","));
    }
    const url = URL.createObjectURL(new Blob([lines.join("\r\n") + "\r\n"], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "cargo-switch-playtest.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1_000);
  }

  window.addEventListener("storage", (event) => {
    if (!event.key?.startsWith(STORAGE_PREFIX)) return;
    if (event.newValue !== null) loadRecord(event.key, event.newValue);
    else records.delete(event.key.slice(STORAGE_PREFIX.length));
    render();
  });
  window.addEventListener("pagehide", () => save());
  panel.addEventListener("toggle", () => { if (panel.open) render(); });
  byId("export-log").addEventListener("click", exportLog);

  window.CargoPlaytest = {
    nextPlayer, endPlayer, startRound, resumeClock, tick, sorted, stopClock, finishRound,
  };
  render();
})();
