const decision = document.querySelector("[data-decision]");
const tabList = decision.querySelector(".scenario-tabs");
const tabs = Array.from(tabList.querySelectorAll("[data-scenario]"));
const panels = Array.from(decision.querySelectorAll("[data-panel]"));

function selectScenario(selectedTab) {
  for (const tab of tabs) {
    const selected = tab === selectedTab;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  }
  for (const panel of panels) {
    const selected = panel.dataset.panel === selectedTab.dataset.scenario;
    panel.hidden = !selected;
    panel.tabIndex = selected ? 0 : -1;
  }
}

tabList.setAttribute("role", "tablist");
for (const tab of tabs) {
  tab.setAttribute("role", "tab");
  tab.setAttribute("aria-controls", `panel-${tab.dataset.scenario}`);
  tab.addEventListener("click", () => selectScenario(tab));
}
for (const panel of panels) {
  panel.setAttribute("role", "tabpanel");
  panel.setAttribute("aria-labelledby", `tab-${panel.dataset.panel}`);
}

tabList.addEventListener("keydown", (event) => {
  const currentIndex = tabs.indexOf(event.target);
  if (currentIndex === -1) return;

  const lastIndex = tabs.length - 1;
  let nextIndex;
  switch (event.key) {
    case "ArrowLeft":
      nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
      break;
    case "ArrowRight":
      nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
      break;
    case "Home":
      nextIndex = 0;
      break;
    case "End":
      nextIndex = lastIndex;
      break;
    default:
      return;
  }

  event.preventDefault();
  selectScenario(tabs[nextIndex]);
  tabs[nextIndex].focus();
});

selectScenario(tabs[0]);
decision.classList.add("is-interactive");
