(() => {
  const tools = window.toolResearch;
  const deepDives = window.toolDeepDives;
  const main = document.querySelector('main');
  const navigation = document.querySelector('#site-nav');
  const originalPost = 'https://x.com/AdrianPunk115/status/';
  const twoDigits = index => String(index + 1).padStart(2, '0');
  const external = (name, url, className = '') =>
    `<a class="${className}" href="${url}" target="_blank" rel="noopener">${name} <span aria-hidden="true">↗</span></a>`;
  const sourceList = items => `<ul class="source-list">${items.map(([label, url]) => `<li>${external(label, url)}</li>`).join('')}</ul>`;
  const swatch = (tool, index) =>
    `<span class="swatch" style="--tool-color:${tool.color}">${twoDigits(index)}</span>`;
  const chapters = [
    ['capabilities', '能力'],
    ['principle', '原理'],
    ['value', '对你的价值'],
    ['products', '可扩展产品'],
    ['effects', '效果展示'],
    ['limits', '边界与实测'],
    ['sources', '一手资料'],
  ];
  const toolChapters = deep => [
    ...(deep.recap ? [['recap', '理解图解']] : []),
    ...(deep.courseGuide ? [['courses', '课程与讲者']] : []),
    ...(deep.paperGuide ? [['paper', '论文阅读']] : []),
    ...(deep.translationGuide ? [['translation', '用法与对照']] : []),
    ...(deep.referenceGuide ? [['reference', '角色参考图']] : []),
    ...(deep.calculatorGuide ? [['calculators', '两站实测']] : []),
    ...(deep.mathPaperGuide ? [['paper-math', '论文中的数学']] : []),
    ...(deep.proofreadingGuide ? [['proofreading', '公式与表格校对']] : []),
    ...(deep.scanGuide ? [['scenes', '项目试验']] : []),
    ...(deep.scanGuide ? [['scan', '角色扫描']] : []),
    ...chapters,
  ];
  let renderedRoute;

  function revealInStrip(link) {
    if (!link) return;
    const strip = link.parentElement;
    if (strip.scrollWidth <= strip.clientWidth) return;
    const item = link.getBoundingClientRect();
    const viewport = strip.getBoundingClientRect();
    if (item.left < viewport.left) strip.scrollLeft += item.left - viewport.left - 6;
    if (item.right > viewport.right) strip.scrollLeft += item.right - viewport.right + 6;
  }

  function renderNavigation(route) {
    const navItem = (id, label, prefix) =>
      `<a class="nav-link" href="#${id}"${id === route ? ' aria-current="page"' : ''}>${prefix}<span>${label}</span></a>`;
    navigation.innerHTML = `
      <div class="nav-group">
        ${navItem('overview', '研究总览', '<span class="nav-symbol" aria-hidden="true">▦</span>')}
        ${navItem('summary', '成果汇总', '<span class="nav-symbol" aria-hidden="true">≡</span>')}
        ${navItem('compare', '对照与复用', '<span class="nav-symbol" aria-hidden="true">≋</span>')}
      </div>
      <div class="nav-group tool-nav">
        <h2>原帖顺序</h2>
        ${tools.map((tool, index) => navItem(tool.id, tool.name, `<span class="nav-index">${twoDigits(index)}</span>`)).join('')}
      </div>`;
  }

  function renderOverview() {
    const map = [
      { id: 'perplexity', label: '找一手资料' },
      { id: 'notebooklm', label: '整理证据' },
      { id: 'photopea', label: '准备参考图' },
      { id: 'jimeng', label: '验证镜头' },
    ];
    main.innerHTML = `
      <section class="hero" aria-labelledby="page-title">
        <div class="hero-copy">
          <div class="overline"><span class="small-square"></span> 7 个专题 · 7 份成果样板</div>
          <h1 id="page-title">七个工具入口</h1>
          <p>覆盖资料研读、联网查源、在线课程、翻译与术语、图像编辑、数学可视化和视频试镜。用论文和角色制作案例，展示如何保存出处、参考图、公式参数和可复核的结果。</p>
          <div class="action-row">
            <a class="button primary" href="#summary">查看成果汇总 <span aria-hidden="true">→</span></a>
            <a class="button secondary" href="#compare">比较七个入口</a>
          </div>
        </div>
        <div class="hero-map">
          <div class="map-heading"><span>示例工作流</span><span aria-hidden="true">↘</span></div>
          <ol>${map.map((step, index) => `
            <li><a href="#${step.id}"><span class="map-no">${twoDigits(index)}</span><span>${step.label}</span><span aria-hidden="true">↗</span></a></li>
          `).join('')}</ol>
        </div>
      </section>
      <section aria-labelledby="tool-list" class="overview-list">
        <div class="section-heading">
          <h2 id="tool-list">逐项研究</h2><p>按作者在评论区发布的顺序排列</p>
        </div>
        <div class="tool-grid">${tools.map((tool, index) => `
          <a class="tool-card" style="--tool-color:${tool.color}" href="#${tool.id}">
            <div class="tool-card-top">${swatch(tool, index)}<span class="category">${tool.category}</span><span class="card-arrow" aria-hidden="true">↗</span></div>
            <h3>${tool.name}</h3>
            <p>${tool.use}</p>
          </a>`).join('')}</div>
      </section>
      <div class="reading-note">
        <strong>怎样读这份手册</strong>
        <p>工具能力以官方资料为依据。演示区域会标明预设案例或真实本地计算。各工具在我们项目里的耗时、成功率和成本需要用相同素材实测。</p>
      </div>`;
  }

  function renderStudyGraphic() {
    const columns = ['核心价值', '已经展示的效果', '对我们的意义'];
    return `
      <figure class="study-graphic" aria-labelledby="study-graphic-title">
        <header class="study-graphic-header">
          <p>工具研究手册</p>
          <h2 id="study-graphic-title">七个工具的价值与实践成果</h2>
          <p>从查资料、读论文到准备角色素材、验证动画和核对结果</p>
        </header>
        <table class="study-graphic-table">
          <thead><tr><th scope="col">工具</th>${columns.map(label => `<th scope="col">${label}</th>`).join('')}</tr></thead>
          <tbody>
            ${tools.map(tool => `
              <tr>
                <th scope="row"><strong>${tool.name}</strong><span>${tool.category}</span></th>
                ${tool.outcome.figure.map((detail, index) => `<td data-label="${columns[index]}">${detail}</td>`).join('')}
              </tr>`).join('')}
          </tbody>
        </table>
        <div class="study-graphic-examples" aria-label="三组项目成果">
          <section class="study-graphic-example" aria-labelledby="graphic-asset">
            <h3 id="graphic-asset">参考图 · 同一原图，两种交付</h3>
            <div class="study-graphic-pictures study-graphic-characters">
              <img src="assets/photopea-vesper-back-clean.png" alt="Vesper 背面渲染干净版">
              <img src="assets/photopea-vesper-back-annotated.png" alt="用文字和箭头标出 Vesper 背面装备的参考图">
            </div>
            <p>干净版用于生成，标注版用于沟通和验收。</p>
          </section>
          <section class="study-graphic-example" aria-labelledby="graphic-math">
            <h3 id="graphic-math">扫描曲线 · 同一公式，两站实测</h3>
            <div class="study-graphic-pictures study-graphic-plots">
              <div><img src="assets/desmos-scan-live.jpg" alt="Desmos 官网绘制的平滑扫描曲线"><span>Desmos</span></div>
              <div><img src="assets/natanalysis-scan-live.jpg" alt="自然分析官网绘制的平滑扫描曲线"><span>自然分析</span></div>
            </div>
            <p>第 0.27 秒，两站均算出 <strong>15.625%</strong>。在角色校对原型里，总时长改为 0.90 秒，结果更新为 <strong>21.6%</strong>。</p>
          </section>
          <section class="study-graphic-example" aria-labelledby="graphic-proof">
            <h3 id="graphic-proof">论文校对 · 一条数据改动影响三处</h3>
            <div class="study-graphic-pictures study-graphic-proof">
              <img src="assets/paper-review-results.png" alt="无书签企鹅论文校对原型列出正文、表格、图注三处差异和一处待确认">
            </div>
            <p>正文、表格、图注均可回查。口径不清时待确认。</p>
          </section>
        </div>
        <figcaption>同一个角色项目可以用 Photopea 整理参考图，用 Desmos 试扫描节奏，再把素材、动作和验收项写进试镜卡。</figcaption>
      </figure>`;
  }

  function renderStudySummary() {
    const { cases } = deepDives.desmos.proofreadingGuide;
    main.innerHTML = `
      <section class="case study-summary" aria-labelledby="page-title">
        <header class="case-header">
          <a class="crumb" href="#overview">← 研究总览</a>
          <h1 id="page-title">成果汇总</h1>
          <p class="case-intro">七个工具的使用结论，以及这轮留下的图解、案例、素材和可操作原型。</p>
          <div class="action-row">${external('查看高清总图', 'assets/tool-research-summary.png', 'button primary')}</div>
        </header>
        ${renderStudyGraphic()}
        <section class="summary-prototypes" aria-labelledby="summary-prototype-title">
          <h2 id="summary-prototype-title">公式和论文数据怎么核对</h2>
          <p>从扫描公式绘图延伸到 Word 和 Excel 对账。两套原型分别演示按书签精确定位，以及无书签时按统计口径匹配。</p>
          <div class="action-row">
            <a class="button primary" href="#desmos/proofreading">查看实测与源文件 →</a>
            ${cases.map(({ title, path }) => `<a class="button secondary" href="${path}">${title}原型 →</a>`).join('')}
          </div>
        </section>
        <section class="research-section" aria-labelledby="summary-tools-title">
          <h2 id="summary-tools-title">七项研究</h2>
          <div class="study-results">
            ${tools.map((tool, index) => {
              const { chapter, label, conclusion, evidence } = tool.outcome;
              return `
                <article class="study-result" style="--tool-color:${tool.color}">
                  <header>
                    ${swatch(tool, index)}
                    <div><h3><a href="#${tool.id}">${tool.name}</a></h3><p>${tool.category}</p></div>
                  </header>
                  <div class="study-result-copy"><p>${conclusion}</p><p>${evidence}</p></div>
                  <div class="study-result-links">
                    <a href="#${tool.id}/${chapter}">${label} →</a>
                    ${deepDives[tool.id].recap ? `<a href="#${tool.id}/recap">看理解图解 →</a>` : ''}
                  </div>
                </article>`;
            }).join('')}
          </div>
        </section>
      </section>`;
  }

  function renderSample(sample) {
    const sourceItems = sample.sources ?? [];
    const markdown = [
      `# ${sample.title}`, '', sample.status, '',
      ...sample.rows.map(([field, value]) => `- **${field}** ${value}`),
      ...(sourceItems.length ? ['', '## 一手资料', '', ...sourceItems.map(([label, url]) => `- [${label}](${url})`)] : []),
      '',
    ].join('\n');
    return `
      <div class="sample-sheet">
        <div class="sample-heading">
          <div><span class="evidence">${sample.status}</span><h3>${sample.title}</h3></div>
          <a class="button secondary" data-sample-download href="data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}" download="${sample.file}">下载成果样板 ↓</a>
        </div>
        <dl class="sample-fields">${sample.rows.map(([field, value]) => `<div><dt>${field}</dt><dd>${value}</dd></div>`).join('')}</dl>
        ${sourceItems.length ? `<ul class="source-list">${sourceItems.map(([name, url]) => `<li>${external(name, url)}</li>`).join('')}</ul>` : ''}
      </div>`;
  }

  function renderImageViews(views, label, inRecap = false) {
    return `
            <ul class="image-views${inRecap ? ' recap-image-views' : ''}" aria-label="${label}">
              ${views.map(([title, use, filename, alt]) => `
                <li>
                  <img src="assets/${filename}" alt="${alt}">
                  <div class="image-view-caption"><strong>${title}</strong><p>${use}</p></div>
                  ${inRecap ? '' : external(`查看${title}原图`, `assets/${filename}`, 'button secondary')}
                </li>`).join('')}
            </ul>`;
  }

  function renderRecap(tool, { recap, courseGuide, referenceGuide, calculatorGuide, scanGuide }) {
    const [exampleLabel, example] = recap.example;
    const [guideChapter, guideLabel] = recap.guideLink ?? [];
    return `
        <section class="research-section detail-section" aria-labelledby="recap-title">
          <h2 id="recap-title" tabindex="-1">我们的理解</h2>
          <p class="recap-summary">${recap.summary}</p>
          <figure class="recap-graphic" aria-labelledby="recap-graphic-title">
            <header class="recap-graphic-header">
              <p class="recap-brand">${tool.name}</p>
              <h3 id="recap-graphic-title">${recap.headline}</h3>
            </header>
            <ol class="recap-flow" aria-label="流程">
              ${recap.stages.map(([title, description], index) => `<li><span aria-hidden="true">${twoDigits(index)}</span><h4>${title}</h4><p>${description}</p></li>`).join('')}
            </ol>
            ${courseGuide ? `<div class="recap-subjects"><h4>八类学科</h4>
              <ul>${courseGuide.subjects.map(([title]) => `<li>${title}</li>`).join('')}</ul>
            </div>` : ''}
            ${referenceGuide ? renderImageViews(referenceGuide.backViews, 'Vesper 背面干净版和标注版', true) : ''}
            ${calculatorGuide ? renderImageViews(calculatorGuide.images, '同一个扫描公式在两站的实测截图', true) : ''}
            <dl class="recap-points">
              ${recap.points.map(([title, description]) => `<div><dt>${title}</dt><dd>${description}</dd></div>`).join('')}
            </dl>
            <dl class="recap-comparison" aria-label="对照">
              ${recap.comparison.map(([title, description]) => `<div><dt>${title}</dt><dd>${description}</dd></div>`).join('')}
            </dl>
            <figcaption><strong>${exampleLabel}</strong><span>${example}</span></figcaption>
          </figure>
          <div class="action-row recap-actions">
            <a class="button primary" href="assets/${tool.id}-summary.png" target="_blank" rel="noopener">查看高清 PNG ↗</a>
            ${scanGuide ? '<a class="button secondary" href="#desmos/scenes">动手试三个场景 →</a>' : ''}
            ${guideChapter ? `<a class="button secondary" href="#${tool.id}/${guideChapter}">${guideLabel} →</a>` : ''}
            <a class="button secondary" href="#${tool.id}/effects">${recap.demoLink} →</a>
          </div>
        </section>`;
  }

  function renderCourseGuide(guide) {
    return `
        <section class="research-section detail-section course-guide" aria-labelledby="courses-title">
          <h2 id="courses-title" tabindex="-1">课程与讲者</h2>

          <h3>课程怎么展示</h3>
          <dl class="feature-list course-layout">
            ${guide.layout.map(([title, detail]) => `<div><dt>${title}</dt><dd>${detail}</dd></div>`).join('')}
          </dl>
          <div class="callout">
            <h4>实际练习里的反馈</h4>
            <p>${guide.walkthrough}</p>
            ${sourceList(guide.lessonLinks)}
          </div>

          <h3>八类学科</h3>
          <ul class="course-subjects">
            ${guide.subjects.map(([title, description, url]) => `
              <li><h4>${title}</h4><p>${description}</p>${external('查看' + title + '目录', url)}</li>
            `).join('')}
          </ul>
          <div class="callout">
            <h4>和你的项目相关的课</h4>
            ${sourceList(guide.projectLinks)}
          </div>

          <h3>真人讲解、课内提示和 AI 辅导</h3>
          <dl class="feature-list course-teaching">
            ${guide.teaching.map(([title, description, sources]) => `
              <div><dt>${title}</dt><dd><p>${description}</p>${sourceList(sources)}</dd></div>
            `).join('')}
          </dl>
        </section>`;
  }

  function renderTranslationSample(sample, reviewedLabel) {
    return `
          <div class="translation-sample">
            <div class="result-box"><h4>英文原句</h4><p lang="en">${sample.original}</p></div>
            <div class="result-box"><h4>DeepL 网页实测</h4><p>${sample.raw}</p></div>
            <div class="result-box"><h4>${reviewedLabel}</h4><p>${sample.revised}</p></div>
          </div>
          <p class="translation-note">${sample.note}</p>`;
  }

  function renderThreeColumnComparison(headingId, [task, firstTool, secondTool], rows) {
    return `
          <div class="compare-table compact-comparison">
            <table aria-labelledby="${headingId}">
              <thead><tr><th scope="col">${task}</th><th scope="col">${firstTool}</th><th scope="col">${secondTool}</th></tr></thead>
              <tbody>${rows.map(([label, first, second]) => `
                <tr><th scope="row">${label}</th><td>${first}</td><td>${second}</td></tr>`).join('')}</tbody>
            </table>
          </div>`;
  }

  function renderPaperGuide(guide) {
    return `
        <section class="research-section detail-section translation-guide paper-guide" aria-labelledby="paper-title">
          <h2 id="paper-title" tabindex="-1">读英文论文时，什么时候用哪个</h2>
          <dl class="feature-list paper-routes">
            ${guide.routes.map(([title, detail, sources]) => `
              <div><dt>${title}</dt><dd><p>${detail}</p>${sourceList(sources)}</dd></div>`).join('')}
          </dl>

          <h3>什么是译稿、什么是术语表</h3>
          <dl class="feature-list paper-definitions">
            ${guide.definitions.map(([title, detail]) => `<div><dt>${title}</dt><dd>${detail}</dd></div>`).join('')}
          </dl>

          <h3>一段论文式英文从初译到译稿</h3>
          ${renderTranslationSample(guide.sample, '校对后的中文译稿节选')}

          <h3>引用论文之前查什么</h3>
          <dl class="feature-list">
            ${guide.checks.map(([title, detail]) => `<div><dt>${title}</dt><dd>${detail}</dd></div>`).join('')}
          </dl>
          ${sourceList([guide.pdfLink])}
        </section>`;
  }

  function renderTranslationGuide(guide) {
    const { sample } = guide;
    return `
        <section class="research-section detail-section translation-guide" aria-labelledby="translation-title">
          <h2 id="translation-title" tabindex="-1">DeepL 怎么用，和直接问 AI 有什么区别</h2>
          <dl class="feature-list translation-steps">
            ${guide.steps.map(([title, detail]) => `<div><dt>${title}</dt><dd>${detail}</dd></div>`).join('')}
          </dl>
          ${sourceList(guide.usageLinks)}

          <h3 id="translation-comparison-title">DeepL 和通用 AI 的工作方式</h3>
          ${renderThreeColumnComparison('translation-comparison-title', ['任务', 'DeepL', '通用 AI'], guide.comparison)}

          <h3>一条 SaaS 字幕从英文到上屏</h3>
          ${renderTranslationSample(sample, '项目字幕校对')}
          <div class="callout">
            <h4>交给通用 AI 的提示词</h4>
            <blockquote>${sample.prompt}<br>英文原句 <span lang="en">${sample.original}</span></blockquote>
          </div>
          <div class="action-row">
            <a class="button primary" href="#deepl/effects">试用字幕与术语导出 →</a>
            ${external('打开现有 SRT 检查器', '../ai-overseas-revenue/01-independent-website/index.html', 'button secondary')}
          </div>
        </section>`;
  }

  function renderReferenceGuide(guide) {
    return `
        <section class="research-section detail-section reference-guide" aria-labelledby="reference-title">
          <h2 id="reference-title" tabindex="-1">用 Photopea 整理 Vesper 的参考图</h2>
          <h3>什么时候截图，什么时候用 Photopea</h3>
          <dl class="feature-list reference-choice">
            ${guide.whenToUse.map(([title, detail]) => `<div><dt>${title}</dt><dd>${detail}</dd></div>`).join('')}
          </dl>

          <h3>Vesper 背面图的两个版本</h3>
          ${renderImageViews(guide.backViews, 'Vesper 背面干净版和标注版')}

          <h3>什么是分层 PSD</h3>
          <p class="reference-layer-intro">${guide.layerIntro}</p>
          <dl class="feature-list reference-layers">
            ${guide.layers.map(([title, detail]) => `<div><dt>${title}</dt><dd>${detail}</dd></div>`).join('')}
          </dl>
          <p class="reference-layer-workflow">${guide.layerWorkflow}</p>
          ${sourceList(guide.layerSources)}

          <h3>如何从正面图裁出头盔和胸口</h3>
          <ol class="expansions principle-steps">
            ${guide.steps.map(([title, detail]) => `<li><strong>${title}</strong><p>${detail}</p></li>`).join('')}
          </ol>
          ${sourceList(guide.editingSources)}
          <div class="action-row">
            <a class="button primary" href="#photopea/effects">试裁切并导出 PNG →</a>
            <a class="button secondary" href="${window.vesperImageUrl}" download="vesper-reference.png">下载 Vesper 正面图 ↓</a>
            ${external('查看 Vesper 背面原图', 'assets/photopea-vesper-back-clean.png', 'button secondary')}
          </div>

          <h3 id="reference-comparison-title">Photopea 和 Photoshop 有什么区别</h3>
          ${renderThreeColumnComparison('reference-comparison-title', ['任务', 'Photopea', 'Photoshop 桌面版'], guide.comparison)}
          ${sourceList(guide.comparisonSources)}

          <h3>三张图各用在什么地方</h3>
          <dl class="feature-list reference-outputs">
            ${guide.outputs.map(([title, detail]) => `<div><dt>${title}</dt><dd>${detail}</dd></div>`).join('')}
          </dl>
          <div class="callout"><h4>下一个角色怎么复用</h4><p>${guide.reuse}</p></div>
        </section>`;
  }

  function renderCalculatorGuide(guide) {
    return `
        <section class="research-section detail-section scan-guide" aria-labelledby="calculators-title">
          <h2 id="calculators-title" tabindex="-1">同一条角色扫描公式，两站实测</h2>
          <code class="scan-formula">${guide.formula}</code>
          <p>${guide.example}</p>

          <h3>同一时刻的官网截图</h3>
          ${renderImageViews(guide.images, 'Desmos 和自然分析在 t=0.25 时的图与读数')}

          <h3 id="calculator-samples-title">同一时刻，走了多少扫描路程</h3>
          ${renderThreeColumnComparison('calculator-samples-title', ['时间进度与秒数', 'Desmos', '自然分析'], guide.samples)}

          <h3 id="calculator-comparison-title">同一个任务，操作差在哪里</h3>
          ${renderThreeColumnComparison('calculator-comparison-title', ['操作', 'Desmos', '自然分析'], guide.comparisons)}
          <div class="callout"><p>${guide.takeaway}</p></div>
          <div class="action-row">
            ${external('在 Desmos 输入公式', 'https://www.desmos.com/calculator?lang=zh-CN', 'button secondary')}
            ${external('在自然分析输入公式', 'https://natanalysis.com/grapher/', 'button secondary')}
            <a class="button secondary" href="#desmos/effects">在站内拖滑块 →</a>
          </div>
          ${sourceList(guide.sources)}
        </section>`;
  }

  function renderMathPaperGuide(guide) {
    return `
        <section class="research-section detail-section scan-guide" aria-labelledby="paper-math-title">
          <h2 id="paper-math-title" tabindex="-1">从输入公式到写进论文</h2>
          <dl class="feature-list">
            ${guide.tasks.map(([title, detail]) => `<div><dt>${title}</dt><dd>${detail}</dd></div>`).join('')}
          </dl>
          <h3>拿扫描曲线写一条方法说明</h3>
          <div class="callout"><p>${guide.example}</p></div>
          <div class="action-row">
            <a class="button primary" href="#desmos/proofreading">查看两套公式与表格校对原型 →</a>
          </div>
          <h3>相关工具与文档</h3>
          ${sourceList(guide.sources)}
        </section>`;
  }

  function renderProofreadingGuide(guide) {
    return `
        <section class="research-section detail-section scan-guide proofreading-guide" aria-labelledby="proofreading-title">
          <h2 id="proofreading-title" tabindex="-1">公式与表格校对</h2>
          <p>${guide.summary}</p>
          <div class="product-grid">
            ${guide.cases.map(({ title, method, result, scope, path, files }) => `
              <article class="product-card">
                <h3>${title}</h3>
                <dl>
                  <div><dt>定位方法</dt><dd>${method}</dd></div>
                  <div><dt>实测结果</dt><dd>${result}</dd></div>
                  <div><dt>当前范围</dt><dd>${scope}</dd></div>
                </dl>
                <div class="action-row"><a class="button secondary" href="${path}">打开原型 →</a></div>
                <ul class="source-list">${files.map(([label, path]) => `<li><a href="${path}" download>${label} ↓</a></li>`).join('')}</ul>
              </article>`).join('')}
          </div>
          <div class="callout"><h3>校对时保留的证据</h3><p>${guide.takeaway}</p></div>
          <h3>讨论中提到的相邻场景</h3>
          <dl class="feature-list">
            ${guide.neighbors.map(([title, detail]) => `<div><dt>${title}</dt><dd>${detail}</dd></div>`).join('')}
          </dl>
          <h3>论文案例出处</h3>
          ${sourceList(guide.sources)}
        </section>`;
  }

  function renderScanGuide(guide) {
    const expressions = guide.expressions.join('\n').replaceAll('<', '&lt;');
    return `
        <section class="research-section detail-section scan-guide" aria-labelledby="scan-title">
          <h2 id="scan-title" tabindex="-1">什么时候用 Desmos 调角色扫描</h2>
          <p>${guide.scenario}</p>

          <h3>实际扫描与曲线试算</h3>
          ${renderImageViews(guide.images, '深潜档案运行截图和三条扫描曲线')}

          <h3>在 Desmos 里怎么操作</h3>
          <div class="scan-calculator-instructions">
            <pre class="result-box" aria-label="逐行输入到 Desmos 的公式"><code>${expressions}</code></pre>
            <div><p>${guide.sliderHelp}</p>
              <div class="action-row">
                ${external('打开 Desmos 图形计算器', 'https://www.desmos.com/calculator?lang=zh-CN', 'button secondary')}
                <a class="button primary" href="#desmos/effects">在站内拖滑块 →</a>
              </div>
              ${sourceList(guide.sources)}
            </div>
          </div>

          <h3>第 0.27 秒的数字是什么意思</h3>
          <div class="callout"><p>${guide.axes}</p></div>

          <h3>拿结果回项目改哪里</h3>
          <dl class="feature-list scan-decisions">
            ${guide.decisions.map(([title, detail]) => `<div><dt>${title}</dt><dd>${detail}</dd></div>`).join('')}
          </dl>
          <div class="action-row">
            <a class="button secondary" href="#desmos/scenes">试角色切换节奏 →</a>
          </div>
        </section>`;
  }

  function renderTool(tool, index) {
    const previous = tools[index - 1];
    const next = tools[index + 1];
    const deep = deepDives[tool.id];
    main.innerHTML = `
      <article class="case" style="--tool-color:${tool.color}">
        <header class="case-header">
          <a class="crumb" href="#overview">← 研究总览</a>
          <div class="case-heading">${swatch(tool, index)}
            <div><span class="overline">${tool.category} · ${tool.priority}</span><h1 id="page-title">${tool.name}</h1></div>
          </div>
          <p class="case-intro">${tool.intro}</p>
          <div class="action-row">${external('打开官网', tool.official, 'button primary')}${external('查看作者回复', originalPost + tool.reply, 'button secondary')}</div>
        </header>

        <nav class="chapter-nav" aria-label="本页章节">
          ${toolChapters(deep).map(([id, label]) => `<a href="#${tool.id}/${id}">${label}</a>`).join('')}
        </nav>

        ${deep.recap ? renderRecap(tool, deep) : ''}
        ${deep.courseGuide ? renderCourseGuide(deep.courseGuide) : ''}
        ${deep.paperGuide ? renderPaperGuide(deep.paperGuide) : ''}
        ${deep.translationGuide ? renderTranslationGuide(deep.translationGuide) : ''}
        ${deep.referenceGuide ? renderReferenceGuide(deep.referenceGuide) : ''}
        ${deep.calculatorGuide ? renderCalculatorGuide(deep.calculatorGuide) : ''}
        ${deep.mathPaperGuide ? renderMathPaperGuide(deep.mathPaperGuide) : ''}
        ${deep.proofreadingGuide ? renderProofreadingGuide(deep.proofreadingGuide) : ''}
        ${deep.scanGuide ? `<section class="research-section detail-section math-scenes" aria-labelledby="scenes-title">
          <h2 id="scenes-title" tabindex="-1">把项目里的规则画出来</h2>
          <p class="math-scenes-intro">拖动时间看角色怎么换，改变连击奖励比分数，再加一阵横风观察尾迹。每个试验都标出采用的项目规则和可调的参数。</p>
          <div id="math-scenes-mount"></div>
        </section>` : ''}
        ${deep.scanGuide ? renderScanGuide(deep.scanGuide) : ''}
        <section class="research-section detail-section" aria-labelledby="capabilities-title">
          <h2 id="capabilities-title" tabindex="-1">能力与用法</h2>
          <dl class="feature-list">${tool.capabilities.map(([title, body]) => `<div><dt>${title}</dt><dd>${body}</dd></div>`).join('')}</dl>
        </section>
        <section class="research-section detail-section" aria-labelledby="principle-title">
          <h2 id="principle-title" tabindex="-1">工作原理</h2>
          <ol class="expansions principle-steps">${deep.principle.map(([title, body]) => `<li><strong>${title}</strong><p>${body}</p></li>`).join('')}</ol>
          <p class="mechanism">${deep.mechanism}</p>
          ${deep.modes ? `<div class="search-modes">
            <h3>不同入口怎么选</h3>
            <dl class="feature-list">${deep.modes.map(([title, body]) => `<div><dt>${title}</dt><dd>${body}</dd></div>`).join('')}</dl>
          </div>` : ''}
          <ul class="source-list principle-sources">${deep.principleSources.map(([name, url]) => `<li>${external(name, url)}</li>`).join('')}</ul>
        </section>
        <section class="research-section detail-section" aria-labelledby="value-title">
          <h2 id="value-title" tabindex="-1">实际价值与对你的意义</h2>
          <div class="brief"><p>${tool.value}</p></div>
          <dl class="feature-list personal-list">${deep.personal.map(([title, body]) => `<div><dt>${title}</dt><dd>${body}</dd></div>`).join('')}</dl>
        </section>
        <section class="research-section detail-section" aria-labelledby="products-title">
          <h2 id="products-title" tabindex="-1">可扩展产品</h2>
          <div class="product-grid">${deep.products.map(([title, audience, handoff, pilot]) => `
            <article class="product-card">
              <h3>${title}</h3>
              <dl>
                <div><dt>适用人群</dt><dd>${audience}</dd></div>
                <div><dt>输入与交付</dt><dd>${handoff}</dd></div>
                <div><dt>最小版本与验收</dt><dd>${pilot}</dd></div>
              </dl>
            </article>`).join('')}</div>
          <details class="reuse-details">
            <summary>从一次使用到可复用流程</summary>
            <ol class="expansions">${tool.expansions.map(([title, body]) => `<li><strong>${title}</strong><p>${body}</p></li>`).join('')}</ol>
          </details>
          <div class="callout"><h3>要保留的资产</h3><p>${tool.asset}</p></div>
        </section>
        <section class="research-section detail-section" aria-labelledby="effects-title">
          <h2 id="effects-title" tabindex="-1">可实现的效果</h2>
          <div class="demo-panel" aria-labelledby="demo-title">
            <div class="demo-header">
              <div><span class="evidence">${tool.demoType}</span><h3 id="demo-title">${tool.demoName}</h3></div>
            </div>
            <p class="demo-intro">${tool.demoIntro}</p>
            <p class="demo-steps">${deep.demoSteps}</p>
            <div id="demo-mount"></div>
          </div>
          ${renderSample(deep.sample)}
        </section>
        <section class="research-section detail-section" aria-labelledby="limits-title">
          <h2 id="limits-title" tabindex="-1">边界与实测办法</h2>
          <ul class="limits">${tool.boundaries.map(body => `<li>${body}</li>`).join('')}</ul>
          <div class="callout"><h3>项目实测办法</h3><p>${tool.benchmark}</p></div>
        </section>
        <section class="research-section detail-section" aria-labelledby="sources-title">
          <h2 id="sources-title" tabindex="-1">一手资料</h2>
          <ul class="source-list">${tool.sources.map(([name, url]) => `<li>${external(name, url)}</li>`).join('')}</ul>
        </section>
        <nav class="pager" aria-label="相邻专题">
          <a href="#${previous?.id ?? 'overview'}"><span>← ${previous ? '上一个' : '返回'}</span><strong>${previous?.name ?? '研究总览'}</strong></a>
          <a href="#${next?.id ?? 'compare'}"><span>${next ? '下一个' : '继续'} →</span><strong>${next?.name ?? '对照与复用'}</strong></a>
        </nav>
      </article>`;
    window.entryDemos[tool.id](document.querySelector('#demo-mount'));
    if (deep.scanGuide) window.renderMathScenes(document.querySelector('#math-scenes-mount'), deep.scanGuide);
  }

  function renderCompare() {
    main.innerHTML = `
      <section class="case compare" aria-labelledby="page-title">
        <header class="case-header">
          <a class="crumb" href="#overview">← 研究总览</a>
          <h1 id="page-title">对照与复用</h1>
          <p class="case-intro">比较七个入口能解决的任务、可带走的资产和切入产品。每个专题可以直接跳到工作原理、产品方向或效果演示。</p>
          <div class="action-row"><a class="button primary" href="#notebooklm">从第 1 项开始深读 →</a></div>
        </header>
        <div class="compare-table" tabindex="0" role="region" aria-label="七个工具对照表">
          <table>
            <thead><tr><th scope="col">工具</th><th scope="col">适合什么时候用</th><th scope="col">用完带走什么</th><th scope="col">可先验证的产品</th></tr></thead>
            <tbody>${tools.map((tool, index) => `
              <tr><th scope="row"><a href="#${tool.id}"><span>${twoDigits(index)}</span> ${tool.name}</a></th>
              <td>${tool.use}</td><td>${tool.asset}</td><td><a href="#${tool.id}/products">${deepDives[tool.id].products[0][0]}</a></td></tr>`).join('')}</tbody>
          </table>
        </div>
        <section class="research-section" aria-labelledby="workflow-title">
          <h2 id="workflow-title">从研究到制作</h2>
          <ol class="expansions">
            <li><strong>先定一个可验证的问题</strong><p>例如「参考图能否让 Vesper 的双联气瓶和阀轮在转身时保持一致」。用 Perplexity 找一手资料，把已核实的资料与试验记录放进 NotebookLM。</p></li>
            <li><strong>固定可重复的输入</strong><p>从深潜档案的 GLB 渲染所需视角，用 Photopea 修图或注释。统一尺寸、命名和镜头编号。术语有歧义时可查 DeepL 的译法，并保存团队术语表。</p></li>
            <li><strong>用同一标准比较路线</strong><p>用相同目标比较三维直接渲染和即梦试镜。涉及扫描线或镜头位移的参数，可用 Desmos 查看曲线。需要补三角函数或概率时，从可汗学院挑相应练习。</p></li>
            <li><strong>换一个角色检验复用性</strong><p>保留输入、设置、样片和验收结果，用 Brine 重跑。只有角色特有的部分需要替换时，就可把共同步骤提炼为项目模板或技能。</p></li>
          </ol>
        </section>
        <section class="research-section" aria-labelledby="metrics-title">
          <h2 id="metrics-title">实测时怎么记</h2>
          <dl class="feature-list">
            <div><dt>结果质量</dt><dd>资料类核对来源回查与关键结论。图像和视频类检查轮廓、道具、构图及镜头连续性。</dd></div>
            <div><dt>投入</dt><dd>记录首次拿到可用结果的时间、重试次数和人工干预。平台消耗按实测账号内的数据填写。</dd></div>
            <div><dt>可复用性</dt><dd>记录换角色、换工具或重新运行时，需要修改的文件和参数。</dd></div>
            <div><dt>证据</dt><dd>保留链接、核验日期、输入版本、参数、通过及失败样例。每个工具专题页有对应的实测办法。</dd></div>
          </dl>
        </section>
      </section>`;
  }

  function navigate() {
    const [requestedRoute, chapter] = window.location.hash.slice(1).split('/');
    const index = tools.findIndex(tool => tool.id === requestedRoute);
    const route = index >= 0 || ['compare', 'summary'].includes(requestedRoute) ? requestedRoute : 'overview';
    if (renderedRoute !== route) {
      renderNavigation(route);
      if (index >= 0) {
        renderTool(tools[index], index);
      } else if (route === 'compare') {
        renderCompare();
      } else if (route === 'summary') {
        renderStudySummary();
      } else {
        renderOverview();
      }
      document.title = `${document.getElementById('page-title').textContent} · 工具研究手册`;
      revealInStrip(navigation.querySelector('.tool-nav [aria-current]'));
      renderedRoute = route;
    }
    const chapterExists = index >= 0 && toolChapters(deepDives[route]).some(([id]) => id === chapter);
    for (const link of main.querySelectorAll('.chapter-nav a')) {
      if (chapterExists && link.hash === window.location.hash) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    if (chapterExists) {
      revealInStrip(main.querySelector('.chapter-nav [aria-current]'));
      const heading = document.getElementById(`${chapter}-title`);
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ block: 'start' });
    } else {
      window.scrollTo(0, 0);
      main.focus({ preventScroll: true });
    }
  }

  document.querySelector('.skip-link').addEventListener('click', event => {
    event.preventDefault();
    main.focus();
  });
  window.addEventListener('hashchange', navigate);
  navigate();
})();
