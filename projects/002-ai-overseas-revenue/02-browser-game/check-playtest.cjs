const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "playtest.js"), "utf8");
class Storage {
  getItem(key) { return this[key] ?? null; }
  setItem(key, value) { this[key] = value; }
}
const storage = new Storage();
let now = 0;

function element() {
  return {
    textContent: "",
    addEventListener() {},
    append() {},
    replaceChildren() {},
  };
}

function openLog() {
  const nodes = new Map();
  const document = {
    createElement: element,
    getElementById(id) {
      if (!nodes.has(id)) nodes.set(id, element());
      return nodes.get(id);
    },
  };
  document.getElementById("playtest-log").open = true;
  const window = { localStorage: storage, addEventListener() {} };
  vm.runInNewContext(source, { window, document, performance: { now: () => now } });
  const shown = (id) => document.getElementById(id).textContent;
  return { log: window.CargoPlaytest, shown };
}

const { log, shown } = openLog();
function advance(time) {
  now = time;
  log.tick(now);
}

log.startRound(false);
log.resumeClock(0);
advance(1_000);
log.sorted(now, true);
log.finishRound();
assert.equal(Object.keys(storage).length, 0, "Practice has no record");

log.nextPlayer();
log.startRound(false);
log.resumeClock(now);
advance(2_500);
log.sorted(now, true);
advance(6_500);
log.stopClock();
advance(20_000);
log.resumeClock(now);
for (let time = 21_000; time <= 53_000; time += 4_000) {
  advance(time);
  log.sorted(now, true);
}
advance(59_500);
log.finishRound();
assert.equal(shown("players-finished"), 1);
assert.equal(shown("players-replayed"), 0);
assert.equal(shown("players-60s"), 0);

advance(150_000);
log.startRound(true);
log.resumeClock(now);
for (let time = 151_000; time <= 167_000; time += 4_000) {
  advance(time);
  log.sorted(now, true);
}
advance(169_999);
assert.equal(shown("players-60s"), 0);
advance(170_000);
assert.equal(shown("players-60s"), 1);
log.endPlayer();
const [first] = Object.values(storage).map(JSON.parse);
assert.equal(first.firstCorrectMs, 1_500);
assert.equal(first.activeMs, 60_000);
assert.equal(first.replayed, true);

log.nextPlayer();
log.startRound(false);
log.resumeClock(now);
advance(171_000);
log.sorted(now, false);
advance(215_000);
log.finishRound();
log.startRound(true);
log.resumeClock(now);
advance(260_000);
log.endPlayer();
const restored = openLog().shown;
assert.equal(restored("players-started"), 2);
assert.equal(restored("players-finished"), 2);
assert.equal(restored("players-replayed"), 2);
assert.equal(restored("players-60s"), 1);
assert.equal(restored("median-first"), "1.5s");
assert.equal(Object.values(storage).map(JSON.parse).find((player) => player.firstCorrectMs === null).activeMs, 5_000);
console.log("Practice isolation, first correct, pauses, replay, the 60-second boundary, idle time and persistence passed.");
