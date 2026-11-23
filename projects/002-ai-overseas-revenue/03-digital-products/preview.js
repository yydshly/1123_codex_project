const video = document.getElementById("sample-video");
const trackButtons = [...document.querySelectorAll("[data-track]")];
const reviewButtons = [...document.querySelectorAll("[data-review]")];
const playingVersion = document.getElementById("playing-version");
const tracks = new Map();

function chooseTrack(version, comparing = false) {
  for (const [id, track] of tracks) track.mode = id === version ? "showing" : "hidden";
  for (const button of trackButtons) button.setAttribute("aria-pressed", button.dataset.track === version);
  for (const button of reviewButtons) button.setAttribute("aria-pressed", comparing && button.dataset.review === version);
  playingVersion.textContent = comparing
    ? (version === "draft" ? "对照片段 · 错位草稿" : "对照片段 · 修正定稿")
    : "交付样例 · 60 秒";
}

async function fetchSrt(language) {
  const response = await fetch(`kit/example/product-demo_v1.${language}.srt`);
  if (!response.ok) throw Error("Subtitle file unavailable");
  return response.text();
}

function addTrack(id, language, label, source) {
  const cues = source.replace(/^(\d{2}:\d{2}:\d{2}),(\d{3}) --> (\d{2}:\d{2}:\d{2}),(\d{3})$/gm, "$1.$2 --> $3.$4");
  const element = document.createElement("track");
  element.kind = "subtitles";
  element.label = label;
  element.srclang = language;
  element.src = URL.createObjectURL(new Blob(["WEBVTT\n\n", cues], { type: "text/vtt" }));
  video.append(element);
  tracks.set(id, element.track);
}

const tracksReady = Promise.all([fetchSrt("en"), fetchSrt("zh-CN")]).then(([english, chinese]) => {
  addTrack("en", "en", "English", english);
  addTrack("zh-CN", "zh-CN", "简中定稿", chinese);
  // Reproduce only the recorded 800 ms change in cue 5 for the local comparison.
  const draft = chinese.replace(
    /^5(\r?\n)00:00:23,700 --> 00:00:28,580$/m,
    (_, newline) => `5${newline}00:00:22,900 --> 00:00:27,780`,
  );
  if (draft !== chinese) addTrack("draft", "zh-CN", "简中对照草稿", draft);
  chooseTrack("zh-CN");
  for (const button of trackButtons) {
    button.disabled = false;
    button.addEventListener("click", () => chooseTrack(button.dataset.track));
  }
}).catch(() => { document.getElementById("track-error").hidden = false; });

// A local static server may omit byte ranges. Buffer this short demo so seeking still works.
async function prepareSeek() {
  const response = await fetch(video.querySelector("source").src);
  if (!response.ok) throw Error("Demo video unavailable");
  const blob = await response.blob();
  const ready = new Promise((resolve) => video.addEventListener("loadedmetadata", resolve, { once: true }));
  video.src = URL.createObjectURL(blob);
  video.preload = "metadata";
  return ready;
}

Promise.all([tracksReady, prepareSeek()]).then(() => {
  for (const button of reviewButtons) {
    const version = button.dataset.review;
    if (!tracks.has(version)) continue;
    button.disabled = false;
    button.addEventListener("click", () => {
      chooseTrack(version, true);
      video.currentTime = 22.55;
      video.scrollIntoView({ block: "nearest" });
      video.play().catch(() => {});
    });
  }
}).catch(() => {});
