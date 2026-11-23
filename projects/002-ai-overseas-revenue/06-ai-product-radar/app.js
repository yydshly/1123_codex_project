'use strict';

const { checked, evidence, sources, sourceGroups, products, opportunities } = RADAR_DATA;
const sourceById = new Map(sources.map(source => [source.id, source]));
const productById = new Map(products.map(product => [product.id, product]));
const selected = new Set();
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const date = new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeZone: 'UTC' });
const $ = id => document.getElementById(id);

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);
const displayDate = value => date.format(new Date(`${value}T00:00:00Z`));
const amount = (metric, digits = 0) => metric ? new Intl.NumberFormat('en-US', {
  style: 'currency', currency: metric.currency, minimumFractionDigits: digits, maximumFractionDigits: digits
}).format(metric.value) : '未公开';
const percent = value => `${value > 0 ? '+' : ''}${number.format(value)}%`;
const usdMrr = product => product.mrr?.currency === 'USD' ? product.mrr.value : -Infinity;
const linkList = links => links.map(([label, url]) => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)}</a>`).join('');
const detailButton = (product, label, className) => `<button type="button" class="${className}" data-detail="${product.id}" aria-label="查看 ${escape(product.name)} 的案例">${escape(label)}</button>`;

const search = $('search');
const category = $('category');
const sourceInput = $('source');
const evidenceInput = $('evidence');
const sort = $('sort');
const chartMetric = $('chart-metric');
const dialog = $('detail-dialog');

function renderOverview() {
  $('top-date').textContent = `核对于 ${displayDate(checked)}`;
  const direct = products.filter(product => product.evidence === 'provider');
  const growth = products.filter(product => product.growth);
  const stats = [
    [sources.length, '个数据入口'],
    [products.length, '个已整理样本'],
    [direct.length, '个支付直连样本'],
    [growth.length, '个披露增长样本']
  ];
  $('stats').innerHTML = stats.map(([value, label]) => `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`).join('');

  const mrr = direct.filter(product => Number.isFinite(usdMrr(product))).map(usdMrr).sort((left, right) => left - right);
  const middle = Math.floor(mrr.length / 2);
  const median = mrr.length % 2 === 0 ? (mrr[middle - 1] + mrr[middle]) / 2 : mrr[middle];
  const range = `${amount({ value: mrr[0], currency: 'USD' })} 到 ${amount({ value: mrr.at(-1), currency: 'USD' })}`;
  $('readout').innerHTML = `
    <p>样本中 <strong>${mrr.length} 个</strong>有支付直连的美元 MRR，中位数 <strong>${amount({ value: median, currency: 'USD' })}</strong>。区间从 ${range}，涵盖早期小工具与成熟订阅产品。</p>
    <p><strong>${growth.length} 个样本</strong>公开了增长，其中 ${growth.filter(product => product.evidence === 'provider').length} 个来自支付直连。继续跟踪前，先对齐指标、时间段和验证方式。</p>
    <p>这批案例按研究方向挑选，包含不同日期的快照。区间适合看规模，市场容量和平均增速需要更广的样本。</p>`;
}

function matchingProducts() {
  const query = search.value.trim().toLowerCase();
  const matching = products.filter(product => {
    const searchable = [product.name, product.category, sourceById.get(product.source).name, product.offer, product.audience].join(' ').toLowerCase();
    return searchable.includes(query)
      && (category.value === 'all' || category.value === product.category)
      && (sourceInput.value === 'all' || sourceInput.value === product.source)
      && (evidenceInput.value === 'all' || evidenceInput.value === product.evidence);
  });
  if (sort.value === 'mrr') matching.sort((left, right) => usdMrr(right) - usdMrr(left));
  if (sort.value === 'name') matching.sort((left, right) => left.name.localeCompare(right.name));
  return matching;
}

function renderProducts() {
  const matching = matchingProducts();
  $('result-count').textContent = `显示 ${matching.length} / ${products.length} 个样本`;
  $('export').disabled = matching.length === 0;
  $('product-list').innerHTML = matching.map(product => `
    <article class="product-row">
      <div class="product-identity">
        <span class="product-icon" data-category="${escape(product.category)}" aria-hidden="true">${escape(product.mark)}</span>
        <div>${detailButton(product, product.name, 'product-name')}
          <span class="product-subtitle">${escape(product.category)} · ${escape(sourceById.get(product.source).name)}</span>
        </div>
      </div>
      <div><strong class="metric-value">${amount(product.mrr)}</strong><span class="metric-label">MRR · ${escape(evidence[product.evidence])}</span></div>
      <div class="row-actions">
        ${detailButton(product, '详情', 'button quiet small')}
        <button type="button" class="button quiet small compare-toggle" data-select="${product.id}" aria-label="比较 ${escape(product.name)}" aria-pressed="false">比较</button>
      </div>
    </article>`).join('') || '<p class="empty">没有匹配样本。可以换个关键词或重置筛选。</p>';
  renderChart(matching);
  syncCompare();
}

function renderChart(matching = matchingProducts()) {
  const metric = chartMetric.value;
  const descriptions = {
    mrr: '仅显示筛选结果中支付直连的美元 MRR。条长相对于该组最大值。',
    netGrowth: '最近 30 天净营收对比之前 30 天，采用支付平台直连数据。',
    mrrGrowth: '当前 MRR 对比约 30 天前，采用支付平台直连数据。'
  };
  $('chart-caption').textContent = descriptions[metric];
  const points = matching.filter(product => product.evidence === 'provider')
    .map(product => ({
      product,
      value: metric === 'mrr' ? usdMrr(product) : product.growth?.kind === metric ? product.growth.value : undefined
    }))
    .filter(point => Number.isFinite(point.value))
    .sort((left, right) => right.value - left.value);
  const showGrowth = metric !== 'mrr';
  const max = Math.max(showGrowth ? 100 : 1, ...points.map(point => Math.abs(point.value)));
  $('chart').innerHTML = points.map(({ product, value }) => {
    const label = showGrowth ? percent(value) : amount(product.mrr);
    const width = Math.abs(value) / max * (showGrowth ? 50 : 100);
    const left = showGrowth ? 50 - (value < 0 ? width : 0) : 0;
    return `<div class="bar"><div class="bar-info">${detailButton(product, product.name, 'text-button')}<strong>${label}</strong></div>
      <div class="bar-track${showGrowth ? ' growth' : ''}" aria-hidden="true"><span class="bar-fill${value < 0 ? ' negative' : ''}" style="left:${left}%;width:${width}%"></span></div></div>`;
  }).join('') || '<p class="empty">筛选结果中没有这个口径的支付直连数据。</p>';
}

function syncCompare() {
  for (const control of document.querySelectorAll('[data-select]')) {
    const checked = selected.has(control.dataset.select);
    control.textContent = checked ? '已加入' : '比较';
    control.setAttribute('aria-pressed', checked);
  }
  $('compare-bar').hidden = selected.size === 0;
  $('show-compare').disabled = selected.size < 2;
  const names = [...selected].map(id => productById.get(id).name);
  $('compare-label').textContent = `${names.join('、')} · ${selected.size} / 3`;
}

function showDialog(title, contents) {
  $('dialog-title').textContent = title;
  $('dialog-content').innerHTML = contents;
  if (!dialog.open) dialog.showModal();
}

function showDetail(product) {
  const metrics = [
    ['MRR', amount(product.mrr)],
    [product.revenue?.label ?? '其他营收', amount(product.revenue)],
    [product.growth?.label ?? '同期增长', product.growth ? percent(product.growth.value) : '未公开']
  ];
  if (product.subscribers !== undefined) metrics.push(['活跃订阅', number.format(product.subscribers)]);
  const earlier = product.growth?.earlier;
  showDialog(product.name, `
    <span class="pill ${product.evidence}">${escape(evidence[product.evidence])}</span>
    <p class="detail-intro">${escape(product.category)} · ${escape(sourceById.get(product.source).name)} · ${escape(product.dateType)} ${displayDate(product.date)}</p>
    <dl class="detail-metrics">${metrics.map(([label, value]) => `<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl>
    <div class="dialog-content-grid">
      <p><strong>目标客户</strong> ${escape(product.audience)}</p>
      <p><strong>产品交付</strong> ${escape(product.offer)}</p>
      <p><strong>收费方式</strong> ${escape(product.monetization)}</p>
      <p><strong>可参考的切入点</strong> ${escape(product.insight)}</p>
      ${earlier ? `<p><strong>上一快照</strong> ${displayDate(earlier.date)} 显示 ${percent(earlier.value)}，与当前使用相同指标。</p>` : ''}
      <p><strong>证据说明</strong> ${escape(product.caveat)}</p>
    </div><div class="source-links">${linkList(product.links)}</div>`);
}

function showComparison() {
  const comparing = [...selected].map(id => productById.get(id));
  if (comparing.length < 2) return;
  const rows = [
    ['证据', product => evidence[product.evidence]],
    ['日期', product => `${product.dateType} ${displayDate(product.date)}`],
    ['MRR', product => amount(product.mrr)],
    ['活跃订阅', product => product.subscribers !== undefined ? number.format(product.subscribers) : '未公开'],
    ['其他营收', product => product.revenue ? `${amount(product.revenue)} · ${product.revenue.label}` : '未公开'],
    ['增长', product => product.growth ? `${percent(product.growth.value)} · ${product.growth.label}` : '未公开'],
    ['目标客户', product => product.audience],
    ['产品交付', product => product.offer],
    ['证据说明', product => product.caveat]
  ];
  showDialog('比较产品样本', `
    <p class="detail-intro">保留各项目的原币种、原指标和采集日期。</p>
    <div class="compare-table-scroll" tabindex="0" aria-label="产品横向对比表"><table class="compare-table">
      <thead><tr><th scope="col">对照项</th>${comparing.map(product => `<th scope="col">${escape(product.name)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(([label, getValue]) => `<tr><th scope="row">${label}</th>${comparing.map(product => `<td>${escape(getValue(product))}</td>`).join('')}</tr>`).join('')}
      <tr><th scope="row">证据链接</th>${comparing.map(product => `<td>${linkList(product.links.slice(0, 1))}</td>`).join('')}</tr></tbody>
    </table></div>`);
}

function renderSources(group) {
  for (const button of $('source-filters').querySelectorAll('button')) {
    button.setAttribute('aria-pressed', button.dataset.group === group);
  }
  $('source-grid').innerHTML = sources.filter(source => group === 'all' || source.group === group).map(source => `
    <article class="panel source-card">
      <span class="pill">${escape(source.group)}</span><h3>${escape(source.name)}</h3>
      <p>${escape(source.description)}</p>
      <dl><div><dt>营收来源</dt><dd>${escape(source.revenue)}</dd></div><div><dt>增长与限制</dt><dd>${escape(source.growth)}</dd></div></dl>
      <div class="source-links">${linkList(source.links)}</div>
    </article>`).join('');
}

function renderAnalysis() {
  const [magic, lightloop, playlingo, treeid, revise] = ['productmagic', 'lightloop', 'playlingo', 'treeid', 'revise'].map(id => productById.get(id));
  const earlier = revise.growth.earlier;
  const comparisons = [
    {
      scope: 'Flippa · 美元 MRR', title: '相似模型能力，两种交付',
      values: [magic, lightloop].map(product => [product, `${amount(product.mrr)} MRR`, `${product.subscribers} 个活跃订阅 · MRR 除以订阅数 ${amount({ value: product.mrr.value / product.subscribers, currency: 'USD' }, 2)}`]),
      note: '商品上架和设计原型对应不同客户。两项比值来自挂牌数据栏，套餐成交价需要另查。'
    },
    {
      scope: 'MobileMRR · 近 28 天收入', title: '看用户会不会重复使用',
      values: [playlingo, treeid].map(product => [product, amount(product.revenue), `${amount(product.mrr)} MRR · RevenueCat 验证`]),
      note: '视频练习可能天天做，树木识别常在特定场景使用。这是使用频次的假设，收入差距还涉及客群规模、获客和定价。'
    },
    {
      scope: 'BootstrapArena · 同指标快照', title: '两天之间，增长读数变了',
      values: [[revise, percent(earlier.value), displayDate(earlier.date)], [revise, percent(revise.growth.value), displayDate(revise.date)]],
      note: `Revise AI 两个读数相差 ${number.format(Math.abs(revise.growth.value - earlier.value))} 个百分点。滚动 30 天窗口相互重叠，仍需连续记录才能判断趋势。`
    }
  ];
  $('analysis-grid').innerHTML = comparisons.map(item => `
    <article class="panel analysis-card">
      <p class="eyebrow">${escape(item.scope)}</p><h3>${escape(item.title)}</h3>
      <div class="analysis-pairs">${item.values.map(([product, value, note]) => `<div><span>${detailButton(product, product.name, 'text-button')}</span><strong>${escape(value)}</strong><small>${escape(note)}</small></div>`).join('')}</div>
      <p class="analysis-note">${escape(item.note)}</p>
    </article>`).join('');

  $('coverage').innerHTML = sources.map(source => {
    const matches = products.filter(product => product.source === source.id);
    return { source, total: matches.length, growth: matches.filter(product => product.growth).length };
  }).filter(item => item.total).sort((left, right) => right.total - left.total).map(({ source, total, growth }) => `
    <button type="button" class="coverage-item" data-source-view="${source.id}"><strong>${escape(source.name)}</strong><span>${total} 个案例 · ${growth} 个披露增长</span></button>`).join('');
}

function renderOpportunities() {
  $('opportunity-grid').innerHTML = opportunities.map(item => `
    <article class="panel opportunity-card">
      <span class="pill">${escape(item.priority)}</span><h3>${escape(item.title)}</h3>
      <p><strong>客户</strong> ${escape(item.audience)}</p>
      <p><strong>依据</strong> ${escape(item.basis)}</p>
      <p class="test"><strong>首轮测试</strong> ${escape(item.test)}</p>
      <details class="trial"><summary>记录指标与继续条件</summary>
        <p><strong>记录</strong> ${escape(item.measure)}</p>
        <p><strong>继续</strong> ${escape(item.go)}</p>
        <p><strong>暂停</strong> ${escape(item.pause)}</p>
      </details>
      <div class="case-links">${item.cases.map(id => productById.get(id)).map(product => detailButton(product, product.name, 'text-button')).join('')}</div>
    </article>`).join('');
}

function exportCsv() {
  const rows = [['产品', '方向', '来源', '证据', '日期', '日期类型', 'MRR', 'MRR 币种', '活跃订阅', '其他收入', '收入币种', '收入口径', '增长率（%）', '增长口径', '上次增长率（%）', '上次增长快照日期', '来源链接']];
  for (const product of matchingProducts()) {
    rows.push([product.name, product.category, sourceById.get(product.source).name, evidence[product.evidence], product.date, product.dateType,
      product.mrr?.value, product.mrr?.currency, product.subscribers, product.revenue?.value, product.revenue?.currency, product.revenue?.label,
      product.growth?.value, product.growth?.label, product.growth?.earlier?.value, product.growth?.earlier?.date, product.links[0][1]]);
  }
  const csv = rows.map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `ai-product-radar-${checked}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

for (const value of new Set(products.map(product => product.category))) {
  category.add(new Option(value, value));
}
for (const [value, label] of Object.entries(evidence)) {
  evidenceInput.add(new Option(label, value));
}
for (const source of sources.filter(source => products.some(product => product.source === source.id))) {
  sourceInput.add(new Option(source.name, source.id));
}
$('source-filters').innerHTML = [['all', '全部入口'], ...sourceGroups.map(group => [group, group])].map(([group, label]) =>
  `<button type="button" data-group="${escape(group)}" aria-pressed="false">${escape(label)}</button>`).join('');

$('filters').addEventListener('submit', event => event.preventDefault());
search.addEventListener('input', renderProducts);
for (const control of [category, sourceInput, evidenceInput, sort]) control.addEventListener('change', renderProducts);
chartMetric.addEventListener('change', () => renderChart());
$('reset').addEventListener('click', () => { $('filters').reset(); renderProducts(); });
$('export').addEventListener('click', exportCsv);
$('clear-compare').addEventListener('click', () => { selected.clear(); $('compare-notice').textContent = ''; syncCompare(); });
$('show-compare').addEventListener('click', showComparison);
document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  const { detail, select, group, sourceView } = button.dataset;
  if (detail) showDetail(productById.get(detail));
  if (group) renderSources(group);
  if (sourceView) {
    $('filters').reset();
    sourceInput.value = sourceView;
    renderProducts();
    location.hash = 'products';
    sourceInput.focus({ preventScroll: true });
  }
  if (!select) return;
  $('compare-notice').textContent = '';
  if (selected.has(select)) selected.delete(select);
  else if (selected.size < 3) selected.add(select);
  else $('compare-notice').textContent = '每次最多比较 3 个项目。可以先取消一个。';
  syncCompare();
});

renderOverview();
renderProducts();
renderAnalysis();
renderSources('all');
renderOpportunities();
