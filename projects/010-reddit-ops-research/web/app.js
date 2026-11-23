"use strict";

const creators = research.creators.map((creator) => ({
  ...creator,
  articles: creator.articles.map((article) => ({
    ...article,
    url: article.url ?? ("https://x.com/" + creator.handle + "/status/" + article.post),
  })),
}));
const articles = new Map(creators.flatMap((creator) =>
  creator.articles.map((article) => [article.key, article])
));
const topics = research.topics;
const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric", month: "numeric", day: "numeric", timeZone: "Asia/Shanghai",
});
const search = document.querySelector("#search");
const focus = document.querySelector("#focus");
const topicOptions = document.querySelector("#topic-options");
const list = document.querySelector("#creator-list");
const count = document.querySelector("#result-count");
const toggleAll = document.querySelector("#toggle-library");
const openCreators = new Set([creators[0].handle]);
let topic = "";

function element(tag, className, label) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (label) node.textContent = label;
  return node;
}

function externalLink(link, url) {
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}

function articleDate(article) {
  if (article.date) return new Date(article.date + "T12:00:00+08:00");
  const postId = new URL(article.url).pathname.match(/\/status\/(\d+)$/)?.[1];
  if (!postId) return null;
  return new Date(Number((BigInt(postId) >> 22n) + 1288834974657n));
}

function renderArticle(article) {
  const item = element("li", "article-row");
  const info = element("div", "article-copy");
  const heading = element("h4");
  heading.append(externalLink(element("a", "article-link", article.title), article.url));
  const meta = element("div", "article-meta");
  meta.append(element("span", "kind", article.kind));
  const date = articleDate(article);
  if (date) {
    const clock = element("time", "", dateFormatter.format(date));
    clock.dateTime = article.date ?? date.toISOString();
    meta.append(clock);
  }
  meta.append(element("span", "", article.topics.map((key) => topics[key]).join(" · ")));
  info.append(heading, meta);
  const interpretation = element("div", "article-interpretation");
  interpretation.append(element("p", "article-value", article.value));
  if (article.note) interpretation.append(element("p", "article-note", article.note));
  if (article.reference) {
    interpretation.append(externalLink(
      element("a", "article-reference", article.reference.title), article.reference.url
    ));
  }
  item.append(info, interpretation);
  return item;
}

function renderCreator(creator, filtered) {
  const panel = element("article", "creator");
  const header = element("header", "creator-heading");
  const title = element("div", "creator-title");
  title.append(
    element("h3", "", creator.name),
    externalLink(element("a", "handle", "@" + creator.handle), "https://x.com/" + creator.handle),
  );
  const overview = element("div", "creator-overview");
  overview.append(
    element("span", "creator-focus", creator.focus),
    element("p", "", creator.value),
  );
  header.append(title, overview);
  const details = element("details", "creator-details");
  details.open = filtered || openCreators.has(creator.handle);
  const summary = element("summary", "");
  summary.append(
    element("span", "details-closed", "查看 " + creator.articles.length + " 条资料"),
    element("span", "details-open", creator.articles.length + " 条资料"),
    element("span", "details-icon"),
  );
  const rows = element("ul", "article-list");
  rows.append(...creator.articles.map(renderArticle));
  details.append(summary, rows);
  details.addEventListener("toggle", () => {
    if (!details.isConnected) return;
    if (!filtered) {
      if (details.open) openCreators.add(creator.handle);
      else openCreators.delete(creator.handle);
    }
    syncToggle();
  });
  panel.append(header, details);
  return panel;
}

function syncToggle() {
  const groups = [...list.querySelectorAll("details")];
  toggleAll.disabled = groups.length === 0;
  toggleAll.textContent = groups.length && groups.every((group) => group.open)
    ? "收起全部资料"
    : "展开全部资料";
}

function renderLibrary() {
  const words = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = Boolean(words.length || topic || focus.value);
  const visible = creators
    .filter((creator) => !focus.value || focus.value === creator.focus)
    .map((creator) => ({
      ...creator,
      articles: creator.articles.filter((article) => {
        const searchable = [
          creator.name, creator.handle, creator.focus, creator.value,
          article.title, article.kind, article.value, article.note,
          ...article.topics.map((key) => topics[key]),
        ].join(" ").toLowerCase();
        return (!topic || article.topics.includes(topic))
          && words.every((word) => searchable.includes(word));
      }),
    }))
    .filter((creator) => creator.articles.length > 0);

  const articleCount = visible.reduce((total, creator) => total + creator.articles.length, 0);
  count.textContent = visible.length + " 位创作者 · " + articleCount + " 条资料";
  if (visible.length) {
    list.replaceChildren(...visible.map((creator) => renderCreator(creator, filtered)));
  } else {
    const empty = element("div", "no-results");
    const reset = element("button", "text-button", "清除筛选");
    reset.type = "button";
    reset.addEventListener("click", () => {
      search.value = "";
      focus.value = "";
      topic = "";
      topicOptions.querySelector("input[value='']").checked = true;
      renderLibrary();
      search.focus();
    });
    empty.append(element("p", "", "没有找到匹配的资料。"), reset);
    list.replaceChildren(empty);
  }
  syncToggle();
}

for (const [key, name] of [["", "全部主题"], ...Object.entries(topics)]) {
  const label = element("label", "topic-chip");
  const radio = element("input", "sr-only");
  radio.type = "radio";
  radio.name = "topic";
  radio.value = key;
  radio.checked = key === "";
  label.append(radio, element("span", "", name));
  topicOptions.append(label);
}

document.querySelectorAll("[data-source]").forEach((link) => {
  const article = articles.get(link.dataset.source);
  if (article) externalLink(link, article.url);
});
document.querySelector("#creator-total").textContent = creators.length;
document.querySelector("#article-total").textContent = articles.size;
document.querySelector("#topic-total").textContent = Object.keys(topics).length;
document.querySelector(".library-controls").addEventListener("submit", (event) => event.preventDefault());
search.addEventListener("input", renderLibrary);
focus.addEventListener("change", renderLibrary);
topicOptions.addEventListener("change", (event) => {
  topic = event.target.value;
  renderLibrary();
});
toggleAll.addEventListener("click", () => {
  const groups = [...list.querySelectorAll("details")];
  const open = groups.some((group) => !group.open);
  groups.forEach((group) => { group.open = open; });
  syncToggle();
});
renderLibrary();

const validation = document.querySelector("#field-checklist");
const validationItems = [...validation.querySelectorAll('input[type="checkbox"]')];
const validationProgress = document.querySelector("#validation-progress");
const validationStorage = "reddit-ops-research:ai-video-checklist";

function updateValidationProgress() {
  const checked = validationItems.filter((item) => item.checked);
  validationProgress.textContent = checked.length + " / " + validationItems.length + " 已完成";
  return checked.map((item) => item.value);
}

try {
  const saved = new Set(JSON.parse(localStorage.getItem(validationStorage) ?? "[]"));
  validationItems.forEach((item) => { item.checked = saved.has(item.value); });
} catch {
  // Local browser settings may disable storage for file URLs.
}
updateValidationProgress();

validation.addEventListener("change", () => {
  const checked = updateValidationProgress();
  try {
    localStorage.setItem(validationStorage, JSON.stringify(checked));
  } catch {
    // The checklist remains usable for the current session.
  }
});
