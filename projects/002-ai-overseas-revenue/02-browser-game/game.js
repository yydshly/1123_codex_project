(() => {
  "use strict";

  const SHIFT_MS = 45_000;
  const HANDOFF_MS = 210;
  const SHAPES = ["circle", "square", "diamond"];
  const LABELS = ["Circle", "Square", "Diamond"];
  const KEYS = new Map([["ArrowLeft", 0], ["ArrowDown", 1], ["ArrowRight", 2]]);
  const CONTROLS = "Tap a bay, swipe left/down/right on the belt, or use the arrow keys.";
  const playtest = window.CargoPlaytest;

  const byId = (id) => document.getElementById(id);
  const conveyor = byId("conveyor");
  const parcel = byId("parcel");
  const parcelLabel = byId("parcel-label");
  const feedback = byId("feedback");
  const time = byId("time");
  const pauseButton = byId("pause");
  const resumeButton = byId("resume");
  const replayButton = byId("replay");
  const bays = [...document.querySelectorAll("[data-bay]")];

  let phase = "ready";
  let remaining = SHIFT_MS;
  let deadline = 0;
  let frame = 0;
  let currentBay = 0;
  let nextAt = null;
  let bag = [];
  let score = 0;
  let streak = 0;
  let correct = 0;
  let attempted = 0;
  let best = 0;
  let swipe;

  function updateHud() {
    const clock = `${Math.ceil(remaining / 1000)}s`;
    if (time.textContent !== clock) time.textContent = clock;
    byId("score").textContent = score;
    byId("streak").textContent = streak;
  }

  function showFeedback(message, outcome = "") {
    feedback.textContent = message;
    feedback.dataset.outcome = outcome;
  }

  function showPhase(nextPhase) {
    phase = nextPhase;
    byId("ready").hidden = phase !== "ready";
    byId("paused").hidden = phase !== "paused";
    byId("finished").hidden = phase !== "finished";
    parcel.hidden = phase !== "running";
    pauseButton.disabled = phase !== "running";
    for (const bay of bays) bay.disabled = phase !== "running";
  }

  function showParcel(bay) {
    currentBay = bay;
    parcel.dataset.shape = SHAPES[bay];
    parcelLabel.textContent = LABELS[bay];
    parcel.classList.remove("dispatching");
    nextAt = null;
  }

  function drawParcel() {
    if (!bag.length) {
      bag = [0, 1, 2, 0, 1, 2];
      for (let index = bag.length - 1; index > 0; index--) {
        const other = Math.floor(Math.random() * (index + 1));
        [bag[index], bag[other]] = [bag[other], bag[index]];
      }
    }
    showParcel(bag.pop());
  }

  function finish() {
    cancelAnimationFrame(frame);
    playtest.finishRound();
    remaining = 0;
    best = Math.max(best, score);
    updateHud();
    showPhase("finished");
    showFeedback(`Best score this session: ${best}`);
    byId("round-result").textContent = `${score} points · ${correct} of ${attempted} parcels sorted correctly`;
    replayButton.focus({ preventScroll: true });
  }

  function refresh(now) {
    remaining = Math.max(0, deadline - now);
    playtest.tick(Math.min(now, deadline));
    if (remaining === 0) {
      finish();
      return false;
    }
    if (nextAt !== null && now >= nextAt) drawParcel();
    return true;
  }

  function tick(now) {
    if (phase !== "running" || !refresh(now)) return;
    const clock = `${Math.ceil(remaining / 1000)}s`;
    if (clock !== time.textContent) time.textContent = clock;
    frame = requestAnimationFrame(tick);
  }

  function startClock() {
    const now = performance.now();
    deadline = now + remaining;
    playtest.resumeClock(now);
    showPhase("running");
    updateHud();
    conveyor.focus({ preventScroll: true });
    frame = requestAnimationFrame(tick);
  }

  function resetShift() {
    cancelAnimationFrame(frame);
    remaining = SHIFT_MS;
    score = 0;
    streak = 0;
    correct = 0;
    attempted = 0;
    bag = [];
    swipe = undefined;
    showParcel(0);
    showFeedback(CONTROLS);
    updateHud();
  }

  function newShift(replay) {
    resetShift();
    playtest.startRound(replay);
    startClock();
  }

  function pauseShift() {
    if (phase !== "running" || !refresh(performance.now())) return;
    cancelAnimationFrame(frame);
    playtest.stopClock();
    swipe = undefined;
    showPhase("paused");
    updateHud();
    resumeButton.focus({ preventScroll: true });
  }

  function resumeShift() {
    if (phase !== "paused") return;
    if (nextAt !== null) drawParcel();
    startClock();
  }

  function sortParcel(bay) {
    const now = performance.now();
    if (phase !== "running" || !refresh(now) || nextAt !== null) return;
    attempted++;
    const matched = bay === currentBay;
    playtest.sorted(now, matched);
    if (matched) {
      correct++;
      streak++;
      const points = 100 + Math.min(streak - 1, 4) * 25;
      score += points;
      showFeedback(`Correct · +${points}`, "correct");
    } else {
      streak = 0;
      score = Math.max(0, score - 50);
      showFeedback(`Wrong bay · This parcel goes to ${LABELS[currentBay]}`, "wrong");
    }
    nextAt = now + HANDOFF_MS;
    parcel.style.setProperty("--departure", bay - 1);
    parcel.classList.add("dispatching");
    updateHud();
  }

  byId("start").addEventListener("click", () => newShift(false));
  replayButton.addEventListener("click", () => newShift(true));
  pauseButton.addEventListener("click", pauseShift);
  resumeButton.addEventListener("click", resumeShift);
  for (const bay of bays) {
    bay.addEventListener("click", () => sortParcel(Number(bay.dataset.bay)));
  }

  function resetForPlayer() {
    best = 0;
    resetShift();
    showPhase("ready");
  }

  byId("record-next").addEventListener("click", () => {
    playtest.nextPlayer();
    resetForPlayer();
    byId("playtest-log").open = false;
    byId("start").focus();
  });

  byId("record-end").addEventListener("click", () => {
    if (phase === "running") refresh(performance.now());
    playtest.endPlayer();
    resetForPlayer();
    byId("record-next").focus();
  });

  document.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented) return;
    if (event.key === "Escape" && !event.repeat) {
      if (phase === "running") pauseShift();
      else if (phase === "paused") resumeShift();
      return;
    }
    if (phase !== "running" || !KEYS.has(event.key)) return;
    event.preventDefault();
    if (!event.repeat) sortParcel(KEYS.get(event.key));
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseShift();
  });

  conveyor.addEventListener("pointerdown", (event) => {
    if (phase !== "running" || !event.isPrimary || event.button !== 0) return;
    swipe = { id: event.pointerId, x: event.clientX, y: event.clientY };
    conveyor.setPointerCapture(event.pointerId);
  });

  conveyor.addEventListener("pointerup", (event) => {
    if (!swipe || swipe.id !== event.pointerId) return;
    const dx = event.clientX - swipe.x;
    const dy = event.clientY - swipe.y;
    swipe = undefined;
    if (Math.abs(dx) >= 26 && Math.abs(dx) > Math.abs(dy)) sortParcel(dx < 0 ? 0 : 2);
    else if (dy >= 26) sortParcel(1);
  });

  conveyor.addEventListener("lostpointercapture", (event) => {
    if (swipe?.id === event.pointerId) swipe = undefined;
  });
})();
