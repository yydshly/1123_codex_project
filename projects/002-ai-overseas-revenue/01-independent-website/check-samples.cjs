const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { defaultRules, chineseRules, inspect } = require("./srt.js");

// Expected issue codes and source lines, marked by hand before comparison.
const fixtures = [
  ["clean.srt", 3, 0, 0, []],
  ["timing.srt", 5, 4, 0, ["overlap@6", "overlap@10", "invalid-range@14", "invalid-range@18"]],
  ["format.srt", 7, 7, 0, [
    "invalid-timing@2", "missing-number@5", "missing-text@9",
    "missing-separator@15", "invalid-timing@16", "missing-number@23", "invalid-timing@23",
  ]],
  ["readability.srt", 3, 0, 4, ["reading-speed@2", "duration@2", "line-length@3", "duration@6"]],
  ["bom-crlf.srt", 2, 0, 0, []],
  ["empty.srt", 0, 1, 0, ["empty-file@file"]],
  ["chinese.srt", 2, 0, 0, []],
];

function fixture(name) {
  return readFileSync(join(__dirname, "samples", name), "utf8");
}

for (const [name, blocks, errors, warnings, locations] of fixtures) {
  const result = inspect(fixture(name));
  assert.deepEqual([result.blocks, result.errors, result.warnings], [blocks, errors, warnings], name);
  assert.deepEqual(result.issues.map(({ code, line }) => `${code}@${line ?? "file"}`), locations, name);
  console.log(`${name}: ${blocks} blocks, ${errors} errors, ${warnings} warnings`);
}

const bomSample = fixture("bom-crlf.srt");
assert.equal(bomSample.charCodeAt(0), 0xFEFF);
assert.ok(bomSample.includes("\r\n"));
assert.deepEqual(inspect(bomSample.replace(/\r\n/g, "\r")).issues, []);

const timing = inspect(fixture("timing.srt"));
assert.equal(timing.issues.filter(({ code }) => code === "overlap").length, 2);
for (const issue of timing.issues.filter(({ code }) => code === "overlap")) {
  assert.match(issue.message, /cue 1 \(line 2\) by 1000 ms/);
}

const relaxed = inspect(fixture("readability.srt"), { ...defaultRules, maxLineLength: 80 });
assert.equal(relaxed.warnings, 3);
assert.ok(relaxed.issues.every(({ code }) => code !== "line-length"));
const chinese = inspect(fixture("chinese.srt"), chineseRules);
assert.equal(chinese.errors, 0);
assert.deepEqual(chinese.issues.map(({ code, line, details }) => [code, line, details]), [
  ["reading-speed", 6, { speed: "16.7", limit: 10 }],
  ["line-length", 7, { length: 25, limit: 18 }],
]);
console.log("BOM, newline compatibility, nested overlaps, adjusted rules, and Chinese preset passed.");
