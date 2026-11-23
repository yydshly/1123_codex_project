const main = document.querySelector("#main");
const caseNav = document.querySelector("#case-nav");
const breadcrumbs = document.querySelector("#breadcrumbs");
const workspace = document.querySelector(".workspace");
const navToggle = document.querySelector(".nav-toggle");
const stages = { deep: "深入分析", initial: "初步整理" };
const directory = { filter: "all", query: "" };
const casesById = new Map(researchCases.map((entry, index) => [entry.id, { ...entry, number: String(index + 1).padStart(2, "0") }]));
const allCases = [...casesById.values()];
let activePage;

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function sources(links) {
  if (!links?.length) return "";
  return `<ul class="sources" aria-label="资料来源">${links.map(([label, url]) => `
    <li><a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(label)} <span aria-hidden="true">↗</span></a></li>`).join("")}</ul>`;
}

function setMenu(open) {
  workspace.toggleAttribute("data-menu-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
}

function renderNav(entry) {
  const personLink = (item) => `<a href="#case/${item.id}"${item.id === entry?.id ? ' aria-current="page"' : ""}>
    <span class="nav-number">${item.number}</span><span>${escapeHTML(item.name)}</span></a>`;

  caseNav.innerHTML = `
    <a class="nav-overview" href="#overview"${entry ? "" : ' aria-current="page"'}><span class="overview-icon" aria-hidden="true">▦</span>研究总览</a>
    ${Object.entries(stages).map(([stage, label]) => `<div class="nav-group">
      <p>${label}</p>
      ${allCases.filter((item) => item.stage === stage).map(personLink).join("")}
    </div>`).join("")}`;

  breadcrumbs.innerHTML = entry
    ? `<a href="#overview">研究总览</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHTML(entry.name)}</span>`
    : `<span aria-current="page">研究总览</span>`;
}

function card(entry) {
  return `<a class="case-card tone-${entry.accent}" href="#case/${entry.id}">
    <div class="card-meta"><span class="case-number">${entry.number}</span><span class="stage-label">${stages[entry.stage]}</span><span class="card-arrow" aria-hidden="true">↗</span></div>
    <h3>${escapeHTML(entry.name)}</h3>
    <p class="card-topic">${escapeHTML(entry.topic)}</p>
    <p class="card-product">${escapeHTML(entry.product)}</p>
  </a>`;
}

function renderDirectory() {
  const query = directory.query.trim().toLowerCase();
  const filtered = allCases.filter((entry) => {
    const searchable = [entry.name, entry.handle, entry.topic, entry.product, entry.acquisition, entry.revenue, entry.takeaway];
    return (directory.filter === "all" || entry.stage === directory.filter) && searchable.some((value) => value.toLowerCase().includes(query));
  });

  document.querySelector("#result-count").textContent = `显示 ${filtered.length} / ${allCases.length} 个案例`;
  document.querySelector("#case-grid").innerHTML = filtered.length
    ? filtered.map(card).join("")
    : '<p class="empty-state">没有找到匹配的案例。试试姓名、产品名，或切换研究进度。</p>';
}

function renderOverview() {
  const filters = [["all", "全部"], ...Object.entries(stages)];
  const deepCount = allCases.filter((entry) => entry.stage === "deep").length;

  main.innerHTML = `
    <div class="content overview">
      <section class="overview-hero" aria-labelledby="overview-title">
        <div class="overview-intro">
          <p class="hero-meta">${allCases.length} 个案例 <span aria-hidden="true">·</span> ${deepCount} 个深入分析</p>
          <h1 id="overview-title">AI 出海案例研究</h1>
          <p class="hero-description">跟着十位实践者的具体产品，看他们怎样发现需求、把产品交给用户、找到客户并收费。每一步都有实例和可核对的出处。</p>
          <a class="primary-button" href="#case/yuwen/methods">查看需求发现方法 <span aria-hidden="true">→</span></a>
        </div>
        <div class="hero-model" aria-label="研究顺序：需求、产品、获客、收费">
          <div class="model-node"><span>需求</span><strong>用户卡在哪一步</strong></div>
          <div class="model-node"><span>产品</span><strong>实际交付什么</strong></div>
          <div class="model-node"><span>获客</span><strong>客户从哪里来</strong></div>
          <div class="model-node"><span>收费</span><strong>为什么愿意付钱</strong></div>
        </div>
      </section>
      <section class="overview-summary" aria-labelledby="summary-title">
        <h2 id="summary-title">研究摘要</h2>
        <dl>
          <div><dt>能力</dt><dd>用社区里的重复问题找需求，用搜索词和 AI 回答检验用户能否找到产品，再沿真实页面追到试用和付款。</dd></div>
          <div><dt>效果</dt><dd>整理十位实践者、九张研究图和可回查来源。对照了实际产品、定价、搜索点击和付费记录，也标明自述及缺失的数据。</dd></div>
          <div><dt>价值</dt><dd>选一项用户反复需要的交付，先验证有人使用、有人付费，再按每单留下的收益和转化率决定推广是否值得投入。</dd></div>
        </dl>
      </section>
      <section class="overview-guide" aria-labelledby="guide-title">
        <div>
          <h2 id="guide-title">引导案例｜ToolCenter 与 SparkVid</h2>
          <p>沿着真实的收录页看用户从哪儿来、怎样跳到官网，再对照 29 美元的套餐权益和回本条件。</p>
          <a href="#case/sitin/toolcenter">打开案例与资料来源 <span aria-hidden="true">→</span></a>
        </div>
        <a class="overview-guide-image" href="sitin-toolcenter-sparkvid-map.png" target="_blank" rel="noopener noreferrer" aria-label="打开 ToolCenter 与 SparkVid 引导图原图">
          <img src="sitin-toolcenter-sparkvid-map.png" width="1920" height="2598" alt="ToolCenter 与 SparkVid 引导图，记录搜索数据、官网跳转、收录权益与回本假设。" loading="lazy">
        </a>
      </section>
      <section class="directory" aria-labelledby="directory-title">
        <div class="directory-heading"><h2 id="directory-title">案例目录</h2><p id="result-count" aria-live="polite"></p></div>
        <div class="directory-tools">
          <div class="filters" role="group" aria-label="研究进度">
            ${filters.map(([id, label]) => `<button type="button" data-filter="${id}" aria-pressed="${directory.filter === id}">${label} <span>${id === "all" ? allCases.length : allCases.filter((entry) => entry.stage === id).length}</span></button>`).join("")}
          </div>
          <label class="search-field"><span class="search-icon" aria-hidden="true"></span><span class="screen-reader">搜索案例</span><input id="case-search" type="search" value="${escapeHTML(directory.query)}" placeholder="搜索人物、产品或方向" autocomplete="off"></label>
        </div>
        <div class="case-grid" id="case-grid"></div>
      </section>
      <footer class="site-footer"><p>2026 年 11 月 23 日整理。收益、渠道与数据口径以各案例所附资料为准。</p>${sources([originalPost, ["原帖镜像", "https://fxtwitter.com/DDDDDDayu/status/2124329441514123670"]])}</footer>
    </div>`;

  const filterButtons = [...main.querySelectorAll("[data-filter]")];
  for (const button of filterButtons) {
    button.addEventListener("click", () => {
      directory.filter = button.dataset.filter;
      filterButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      renderDirectory();
    });
  }
  main.querySelector("#case-search").addEventListener("input", (event) => {
    directory.query = event.target.value;
    renderDirectory();
  });
  renderDirectory();
}

function renderGraphic(graphic, title) {
  if (!graphic) return "";
  return `<figure class="case-graphic">
    <figcaption>研究长图<span>点击图片查看高清原图 <span aria-hidden="true">↗</span></span></figcaption>
    <a href="${escapeHTML(graphic.src)}" target="_blank" rel="noopener noreferrer" aria-label="打开${escapeHTML(title)}研究长图的高清原图">
      <img src="${escapeHTML(graphic.src)}" width="${graphic.width}" height="${graphic.height}" alt="${escapeHTML(graphic.alt)}">
    </a>
  </figure>`;
}

function renderSection(section) {
  const id = `section-${section.id}`;
  return `<section class="case-section" id="${id}" aria-labelledby="${id}-title">
    <h2 id="${id}-title">${escapeHTML(section.title)}</h2>
    ${renderGraphic(section.graphic, section.title)}
    ${section.methods ? `<div class="methods">${section.methods.map((method) => `
      <section class="method"><h3>${escapeHTML(method.name)}</h3><p class="method-purpose">${escapeHTML(method.purpose)}</p>
        <ol>${method.steps.map((step) => `<li>${escapeHTML(step)}</li>`).join("")}</ol>
        <p class="method-result">${escapeHTML(method.result)}</p>${sources(method.sources)}
      </section>`).join("")}</div>` : ""}
    ${section.timeline || section.steps ? `<ol class="${section.timeline ? "timeline" : "steps"}">${(section.timeline || section.steps).map(([number, title, description]) => `
      <li><span class="step-number">${escapeHTML(number)}</span><div><h3>${escapeHTML(title)}</h3><p>${escapeHTML(description)}</p></div></li>`).join("")}</ol>` : ""}
    ${(section.paragraphs || []).map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join("")}
    ${section.bullets ? `<dl class="section-list">${section.bullets.map(([term, description]) => `<div><dt>${escapeHTML(term)}</dt><dd>${escapeHTML(description)}</dd></div>`).join("")}</dl>` : ""}
    ${section.table ? `<div class="table-wrap" role="region" aria-labelledby="${id}-title" tabindex="0"><table class="case-table">
      <thead><tr>${section.table.headers.map((header) => `<th scope="col">${escapeHTML(header)}</th>`).join("")}</tr></thead>
      <tbody>${section.table.rows.map(([title, ...cells]) => `<tr><th scope="row">${escapeHTML(title)}</th>${cells.map((cell) => `<td>${Array.isArray(cell) ? sources(cell) : escapeHTML(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table></div>` : ""}
    ${section.callout ? `<div class="callout"><h3>${escapeHTML(section.callout[0])}</h3><p>${escapeHTML(section.callout[1])}</p></div>` : ""}
    ${sources(section.sources)}
  </section>`;
}

function renderCase(entry) {
  const index = allCases.indexOf(entry);
  const previous = allCases[index - 1];
  const next = allCases[index + 1];
  const sections = entry.sections || [
    { id: "profile", title: "产品、获客与收费", bullets: [["产品", entry.product], ["获客", entry.acquisition], ["收费", entry.revenue]], sources: entry.sources },
    { id: "judgment", title: "我们的初步理解", paragraphs: [entry.takeaway], callout: ["下次重点追问", entry.question] }
  ];
  const contents = `<ul>${sections.map((section) => `<li><a href="#case/${entry.id}/${section.id}">${escapeHTML(section.title)}</a></li>`).join("")}</ul>`;
  const graphic = entry.graphic;

  main.innerHTML = `<div class="content detail tone-${entry.accent}">
    <header class="case-hero">
      <div class="case-meta"><span class="case-number">${entry.number}</span><span class="stage-label">${stages[entry.stage]}</span><a href="https://x.com/${escapeHTML(entry.handle.slice(1))}" target="_blank" rel="noopener noreferrer">${escapeHTML(entry.handle)} <span aria-hidden="true">↗</span></a></div>
      <h1>${escapeHTML(entry.name)}</h1>
      <p class="case-subtitle">${escapeHTML(entry.topic)}</p>
      ${graphic ? `<a class="case-skip-graphic" href="#case/${entry.id}/${sections[0].id}">${escapeHTML(graphic.skipLabel ?? "跳到方法正文")} <span aria-hidden="true">↓</span></a>` : ""}
    </header>
    <div class="detail-layout">
      <article class="case-article">
        ${renderGraphic(graphic, entry.name)}
        ${entry.sections && entry.id !== "yuwen" ? `<div class="case-snapshot"><dl>
          ${[["产品", entry.product], ["获客", entry.acquisition], ["收费", entry.revenue]].map(([name, value]) => `<div><dt>${name}</dt><dd>${escapeHTML(value)}</dd></div>`).join("")}
        </dl></div>` : ""}
        ${sections.map(renderSection).join("")}
      </article>
      <aside class="case-toc">
        <nav class="wide-toc" aria-label="本页目录"><p>本页目录</p>${contents}</nav>
        <details class="compact-toc"><summary>本页目录</summary><nav aria-label="本页目录">${contents}</nav></details>
      </aside>
    </div>
    <nav class="case-pagination" aria-label="相邻案例">
      ${previous ? `<a href="#case/${previous.id}"><small>← 上一个案例</small><strong>${escapeHTML(previous.name)}</strong></a>` : '<a href="#overview"><small>← 返回</small><strong>研究总览</strong></a>'}
      ${next ? `<a href="#case/${next.id}"><small>下一个案例 →</small><strong>${escapeHTML(next.name)}</strong></a>` : '<a href="#overview"><small>返回 →</small><strong>研究总览</strong></a>'}
    </nav>
  </div>`;
}

function loadRoute(shouldFocus = false) {
  const [route, id, sectionId] = location.hash.slice(1).split("/");
  const entry = route === "case" ? casesById.get(id) : undefined;
  const page = entry?.id || "overview";
  const changedPage = page !== activePage;
  if (changedPage) {
    renderNav(entry);
    if (entry) renderCase(entry);
    else renderOverview();
    activePage = page;
    document.title = entry ? `${entry.name} · AI 出海案例研究` : "AI 出海案例研究";
  }
  setMenu(false);
  document.querySelector(".compact-toc[open]")?.removeAttribute("open");
  const section = sectionId && document.getElementById(`section-${sectionId}`);
  if (section) {
    requestAnimationFrame(() => {
      section.scrollIntoView({ block: "start" });
      if (shouldFocus) {
        const heading = section.querySelector("h2");
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    });
  } else {
    window.scrollTo(0, 0);
    if (shouldFocus) main.focus({ preventScroll: true });
  }
}

navToggle.addEventListener("click", () => setMenu(!workspace.hasAttribute("data-menu-open")));
caseNav.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;
  setMenu(false);
  if (link.hash === location.hash) window.scrollTo(0, 0);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && workspace.hasAttribute("data-menu-open")) {
    setMenu(false);
    navToggle.focus();
  }
});
document.querySelector(".skip-link").addEventListener("click", (event) => {
  event.preventDefault();
  main.focus();
});
window.addEventListener("hashchange", () => loadRoute(true));
loadRoute();
