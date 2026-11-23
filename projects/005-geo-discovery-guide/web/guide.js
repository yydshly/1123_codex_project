const sourceToolbar = document.querySelector("#source-toolbar");
const sourceSearch = document.querySelector("#source-search");
const sourceCards = Array.from(document.querySelectorAll("#source-list [data-category]"));
const sourceFilters = Array.from(sourceToolbar.querySelectorAll("[data-filter]"));
const sourceEmpty = document.querySelector("#source-empty");
const sourceCount = document.querySelector("#source-count");
const feedback = document.querySelector("#feedback");
let activeCategory = "all";
let feedbackTimeout;

function updateSources() {
  const terms = sourceSearch.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
  let visibleCount = 0;

  for (const card of sourceCards) {
    const matchesCategory = activeCategory === "all" || card.dataset.category === activeCategory;
    const text = card.textContent.toLowerCase();
    const matchesTerms = terms.every((term) => text.includes(term));
    card.hidden = !matchesCategory || !matchesTerms;
    visibleCount += Number(!card.hidden);
  }

  sourceEmpty.hidden = visibleCount > 0;
  sourceCount.textContent = `显示 ${visibleCount} 个来源`;
}

sourceToolbar.hidden = false;
sourceSearch.addEventListener("input", updateSources);
for (const filter of sourceFilters) {
  filter.addEventListener("click", () => {
    activeCategory = filter.dataset.filter;
    for (const button of sourceFilters) {
      button.setAttribute("aria-pressed", String(button === filter));
    }
    updateSources();
  });
}

function showFeedback(message) {
  clearTimeout(feedbackTimeout);
  feedback.textContent = message;
  feedbackTimeout = setTimeout(() => {
    feedback.textContent = "";
  }, 2500);
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Direct file previews and some browser settings require the selection fallback.
    }
  }

  const previousFocus = document.activeElement;
  const selection = document.createElement("textarea");
  selection.value = text;
  selection.readOnly = true;
  selection.className = "visually-hidden";
  document.body.append(selection);
  selection.select();
  const copied = document.execCommand("copy");
  selection.remove();
  previousFocus?.focus();
  return copied;
}

for (const button of document.querySelectorAll("[data-copy]")) {
  button.addEventListener("click", async () => {
    const source = document.getElementById(button.dataset.copy);
    const text = source.matches("ol")
      ? Array.from(source.children, (item, index) => `${index + 1}. ${item.textContent.trim()}`).join("\n")
      : source.textContent.trim();

    const copied = await copyText(text);
    showFeedback(copied ? "已复制" : "复制不可用，可以手动选中文字。");
  });
}
