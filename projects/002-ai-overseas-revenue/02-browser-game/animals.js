(() => {
  "use strict";

  const ASSETS = "animals-assets/";
  const themes = window.ANIMAL_THEMES;
  const PHOTO_NUMBERS = [1, 2, 3];
  const FIRST_HALF_SIDES = [[0, 0, 1], [0, 1, 0], [0, 1, 1], [1, 0, 0], [1, 0, 1], [1, 1, 0]];
  const CORRECT_FEEDBACK_MS = 1050;
  const BETWEEN_AUDIO_MS = 250;
  const FEEDBACK_TIMEOUT_MS = 4700;
  const MODES = {
    name: { promptClip: "question", feedbackClip: "call", listenLabel: "再听题目", feedbackNotice: "叫声暂时没有播出来。" },
    call: { promptClip: "call", feedbackClip: "name", listenLabel: "再听叫声", feedbackNotice: "动物名字暂时没有播出来。" },
  };
  const byId = (id) => document.getElementById(id);
  const welcome = byId("welcome");
  const quiz = byId("quiz");
  const finish = byId("finish");
  const replay = byId("animal-replay");
  const switchMode = byId("animal-switch");
  const themeButtons = [...welcome.querySelectorAll("[data-theme]")];
  const previewPhotos = [...byId("theme-photos").querySelectorAll("img")];
  const feedback = byId("animal-feedback");
  const audioNotice = byId("audio-notice");
  const sound = byId("animal-sound");
  const listen = byId("listen-again");
  const choices = [...document.querySelectorAll("[data-option]")];
  const dots = [...byId("round-progress").children];
  const lastPhoto = new Map();
  const lastAnswerPhoto = new Map();
  const newPhotos = new Map();
  const foundPhotos = new Map();
  const playtest = window.createAnimalPlaytest(prepareRecording);

  let questions = [];
  let theme = "classic";
  let mode = "name";
  let answerSides = [];
  let index = 0;
  let options = [];
  let answered = false;
  let audioRequest = 0;
  let advanceTimer;
  let correctAt = 0;

  const pick = (items) => items[Math.floor(Math.random() * items.length)];

  function shuffle(items) {
    const list = [...items];
    for (let index = list.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [list[index], list[other]] = [list[other], list[index]];
    }
    return list;
  }

  function blockAfter(animals, previous) {
    const group = shuffle(animals);
    if (group[0] === previous) {
      const next = pick([1, 2]);
      [group[0], group[next]] = [group[next], group[0]];
    }
    return group;
  }

  function planSides(first, second) {
    const plans = FIRST_HALF_SIDES.map((sides) => [
      ...sides,
      ...second.map((animal) => 1 - sides[first.indexOf(animal)]),
    ]);
    return pick(plans.filter((plan) => !/000|111/.test(plan.join(""))));
  }

  function photoFor(animal, answer, newPhoto = false) {
    const reserved = newPhotos.get(animal.id);
    const available = PHOTO_NUMBERS.filter((number) => number !== reserved);
    const differentAnswers = available.filter((number) => !answer || number !== lastAnswerPhoto.get(animal.id));
    const unseen = differentAnswers.filter((number) => number !== lastPhoto.get(animal.id));
    const number = newPhoto ? reserved : pick(unseen.length ? unseen : differentAnswers);
    lastPhoto.set(animal.id, number);
    if (answer) lastAnswerPhoto.set(animal.id, number);
    return { animal, url: `${ASSETS}${animal.id}-${number}.webp` };
  }

  function current() {
    return questions[index];
  }

  function playAudio(file, notice, onFailure) {
    const request = ++audioRequest;
    sound.pause();
    audioNotice.hidden = true;
    sound.src = ASSETS + file;
    sound.play().catch(() => {
      if (request !== audioRequest) return;
      audioNotice.hidden = false;
      audioNotice.textContent = notice;
      onFailure?.();
    });
  }

  function playQuestion() {
    const target = current();
    const notice = mode === "call" ? "点喇叭重听叫声。" : `点喇叭重听。题目是「${target.name}在哪里？」`;
    playAudio(`${target.id}-${MODES[mode].promptClip}.mp3`, notice);
  }

  function showFeedback(message, state = "") {
    feedback.textContent = message;
    feedback.dataset.state = state;
  }

  function updateProgress() {
    const done = index + Number(answered);
    for (const [number, dot] of dots.entries()) dot.classList.toggle("done", number < done);
    byId("round-progress").setAttribute("aria-label", `已完成 ${done} 题，共 ${questions.length} 题`);
  }

  function showQuestion() {
    const animals = themes[theme].animals;
    const target = current();
    const other = pick(animals.filter((animal) => animal !== target));
    const targetSide = answerSides[index];
    const newPhoto = index >= animals.length;
    options = [];
    options[targetSide] = photoFor(target, true, newPhoto);
    options[1 - targetSide] = photoFor(other, false);

    answered = false;
    listen.disabled = false;
    byId("counter").textContent = `第 ${index + 1} 题 / 共 ${questions.length} 题`;
    byId("prompt-text").textContent = mode === "call" ? "听叫声，找出这只动物。" : `${target.name}在哪里？`;
    for (const [option, button] of choices.entries()) {
      button.disabled = false;
      delete button.dataset.feedback;
      const image = button.querySelector("img");
      image.src = options[option].url;
      image.alt = options[option].animal.name;
    }
    showFeedback("听完后，点一张照片。");
    updateProgress();
    listen.focus({ preventScroll: true });
    playtest.showQuestion(target.id, newPhoto);
    playQuestion();
  }

  function selectTheme(selectedTheme) {
    theme = selectedTheme;
    for (const button of themeButtons) {
      button.setAttribute("aria-pressed", button.dataset.theme === theme);
    }
    for (const [index, { id, name }] of themes[theme].animals.entries()) {
      previewPhotos[index].src = `${ASSETS}${id}-1.webp`;
      previewPhotos[index].alt = name;
    }
  }

  function showWelcome() {
    quiz.hidden = true;
    finish.hidden = true;
    welcome.hidden = false;
    themeButtons.find((button) => button.dataset.theme === theme).focus({ preventScroll: true });
  }

  function startRound(selectedMode) {
    const restarting = questions.length > 0;
    const availableNewPhotos = welcome.hidden ? PHOTO_NUMBERS : [2, 3];
    const animals = themes[theme].animals;
    mode = selectedMode;
    byId("listen-label").textContent = MODES[mode].listenLabel;
    const first = blockAfter(animals, questions.at(-1));
    const second = blockAfter(animals, first.at(-1));
    questions = [...first, ...second];
    answerSides = planSides(first, second);
    foundPhotos.clear();
    for (const { id } of animals) newPhotos.set(id, pick(availableNewPhotos));
    index = 0;
    welcome.hidden = true;
    finish.hidden = true;
    quiz.hidden = false;
    playtest.startRound(theme, mode, restarting);
    showQuestion();
  }

  function showFinish() {
    const gallery = themes[theme].animals.map(({ id, name }) => {
      const image = document.createElement("img");
      image.src = foundPhotos.get(id);
      image.alt = name;
      image.width = 480;
      image.height = 360;
      return image;
    });
    byId("found-photos").replaceChildren(...gallery);
    quiz.hidden = true;
    finish.hidden = false;
    switchMode.textContent = mode === "call" ? "试试听名字" : "试试听叫声";
    replay.focus({ preventScroll: true });
  }

  function advance() {
    if (!answered || quiz.hidden) return;
    sound.pause();
    if (index === questions.length - 1) {
      showFinish();
    } else {
      index++;
      showQuestion();
    }
  }

  function queueAfterFeedback() {
    if (!answered || quiz.hidden) return;
    clearTimeout(advanceTimer);
    const wait = Math.max(BETWEEN_AUDIO_MS, CORRECT_FEEDBACK_MS - (performance.now() - correctAt));
    advanceTimer = setTimeout(advance, wait);
  }

  function prepareRecording() {
    clearTimeout(advanceTimer);
    audioRequest++;
    sound.pause();
    answered = false;
    questions = [];
    lastPhoto.clear();
    lastAnswerPhoto.clear();
    selectTheme("classic");
    showWelcome();
  }

  function choose(option) {
    if (answered) return;
    const button = choices[option];
    const target = current();
    const correct = options[option].animal === target;
    playtest.choose(target.id, correct);
    if (!correct) {
      button.dataset.feedback = "wrong";
      showFeedback("再找一次。", "retry");
      playQuestion();
      return;
    }

    answered = true;
    correctAt = performance.now();
    foundPhotos.set(target.id, options[option].url);
    listen.disabled = true;
    for (const choice of choices) {
      choice.disabled = true;
      delete choice.dataset.feedback;
    }
    button.dataset.feedback = "correct";
    showFeedback(`找到${target.name}啦！`, "correct");
    updateProgress();
    const { feedbackClip, feedbackNotice } = MODES[mode];
    advanceTimer = setTimeout(advance, FEEDBACK_TIMEOUT_MS);
    playAudio(`${target.id}-${feedbackClip}.mp3`, feedbackNotice, queueAfterFeedback);
  }

  for (const button of welcome.querySelectorAll("[data-mode]")) {
    button.addEventListener("click", () => startRound(button.dataset.mode));
  }
  for (const button of themeButtons) {
    button.addEventListener("click", () => selectTheme(button.dataset.theme));
  }
  replay.addEventListener("click", () => startRound(mode));
  switchMode.addEventListener("click", () => startRound(mode === "call" ? "name" : "call"));
  byId("animal-theme-switch").addEventListener("click", showWelcome);
  listen.addEventListener("click", playQuestion);
  sound.addEventListener("ended", () => { if (sound.ended) queueAfterFeedback(); });
  for (const [index, button] of choices.entries()) {
    button.addEventListener("click", () => choose(index));
  }
})();
