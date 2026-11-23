const byId = (id) => document.getElementById(id);
const labels = {
  date: '日期', date_end: '结束日期（可选）', platform: '平台', week_start: '周起始日',
  account_id: '账户 ID', campaign_id: '广告系列 ID', currency: '币种', timezone: '时区',
  spend: '花费', impressions: '展示', clicks: '点击', conversions: '平台归因转化',
  clicks_scope: '旧报点击口径（选填）', conversions_scope: '旧报转化口径（选填）',
  attribution_setting: '归因设置（选填）',
};
const config = {
  google: ['Google Ads', 'CSV · 按广告系列和日期导出'],
  meta: ['Meta Ads', 'CSV · 按广告系列和日期导出'],
  reference: ['同周旧周报', 'CSV 或对账 JSON · 每个平台一行汇总'],
};
const fallbackFields = ['account_id', 'currency', 'timezone'];
const referenceMeta = [...fallbackFields, 'week_start'];
const scopeFields = {week_start: byId('week-start'), currency: byId('currency'), timezone: byId('timezone')};
const cards = {};
const metricFields = ['clicks', 'conversions'];
const emptyFile = () => ({name: '', text: '', meta: null, mapping: {}, fixed: {}, metric_scopes: {}, confirmed: false});
const notice = byId('run-notice');
const run = byId('run-report');
const demoButtons = { 'load-demo': '/api/sample', 'load-scope-demo': '/api/metric-scope-sample' };
const results = byId('results');
const download = byId('download-report');
const storageKey = 'ads-weekly-workbench-mappings-v1';
let revision = 0;
let loadingDemo = false;
let running = false;
let currentReport = null;

function selectedScope() {
  return Object.fromEntries(Object.entries(scopeFields).map(([name, input]) => [name, input.value.trim()]));
}

function updateRun() {
  const filesReady = Object.values(cards).every(({file}) => file.meta);
  const scopeReady = Object.values(selectedScope()).every(Boolean);
  run.disabled = loadingDemo || running || !filesReady || !scopeReady;
  if (loadingDemo) notice.textContent = '正在读取三份模拟文件…';
  else if (running) notice.textContent = '正在核对本周数据…';
  else if (!filesReady) notice.textContent = '导入三份文件后可运行对账。';
  else if (!scopeReady) notice.textContent = '请填写周起始日、币种和时区。';
  else notice.textContent = '文件已读取，请核对字段和报表口径。';
}

function invalidate() {
  revision += 1;
  currentReport = null;
  download.disabled = true;
  results.hidden = true;
  updateRun();
}

async function api(path, payload) {
  const options = payload ? {
    method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload),
  } : undefined;
  let response;
  try {
    response = await fetch(path, options);
  } catch {
    throw new Error('连接本机服务失败。请启动工作台服务后重试。');
  }
  const value = await response.json();
  if (!response.ok) throw new Error(value.error || '读取失败，请检查文件后重试。');
  return value;
}

function readPresets() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch {
    return {};
  }
}

function mappingKey(kind, meta) {
  return JSON.stringify([kind, meta.headers]);
}

function savePresets() {
  const presets = readPresets();
  for (const {kind, file} of Object.values(cards)) {
    if (!file.isSample && file.meta.format === 'csv') presets[mappingKey(kind, file.meta)] = file.mapping;
  }
  try {
    localStorage.setItem(storageKey, JSON.stringify(presets));
  } catch {
    // Mapping settings are optional when browser storage is unavailable.
  }
}

function fileStatus(card, message, kind = '') {
  card.status.textContent = message;
  card.status.dataset.kind = kind;
}

function refreshMapping(card) {
  const {file, kind} = card;
  const unmapped = Object.keys(file.mapping).filter((field) => file.mapping[field] == null);
  const isReference = kind === 'reference';
  const needsConfirmation = isReference && unmapped.some((field) => referenceMeta.includes(field));
  const missing = new Set(unmapped.filter((field) => {
    if (field === 'date_end' || field === 'attribution_setting' || field.endsWith('_scope')) return false;
    if (isReference) return !referenceMeta.includes(field) || !file.confirmed;
    return !fallbackFields.includes(field) || !file.fixed[field]?.trim();
  }));

  card.confirm.hidden = !needsConfirmation;
  card.confirm.querySelector('input').checked = file.confirmed;
  for (const label of card.mapped.children) label.dataset.missing = missing.has(label.dataset.field);
  for (const label of card.fixed.children) label.hidden = !unmapped.includes(label.dataset.field);
  card.fixed.hidden = isReference || !unmapped.some((field) => fallbackFields.includes(field));
  card.details.querySelector('summary').textContent = missing.size ? `字段匹配 · ${missing.size} 项待确认` : '字段匹配 · 已就绪';
  return missing.size;
}

function updateDefinitionInputs(card) {
  for (const input of card.definitions.querySelectorAll('input')) {
    const field = input.dataset.field;
    input.value = card.file.metric_scopes[field] ?? '';
    if (field === 'clicks') input.placeholder = card.file.meta?.click_scopes[card.file.mapping.clicks] || '填写已确认的点击定义';
  }
}

function showMapping(card) {
  const {file} = card;
  const {meta} = file;
  card.header.value = meta.header_line;
  card.mapped.replaceChildren();
  for (const field of Object.keys(meta.mapping)) {
    const label = document.createElement('label');
    label.dataset.field = field;
    label.append(labels[field]);
    const select = document.createElement('select');
    select.append(new Option('未映射', ''));
    meta.headers.forEach((title, index) => select.append(new Option(`${index + 1} · ${title || '空白列名'}`, String(index))));
    select.value = file.mapping[field] ?? '';
    select.addEventListener('change', () => {
      file.mapping[field] = select.value === '' ? null : Number(select.value);
      if (metricFields.includes(field)) {
        delete file.metric_scopes[field];
        updateDefinitionInputs(card);
      }
      refreshMapping(card);
      invalidate();
    });
    label.append(select);
    card.mapped.append(label);
  }
  for (const label of card.fixed.children) label.querySelector('input').value = file.fixed[label.dataset.field] ?? '';
  updateDefinitionInputs(card);
  card.details.hidden = false;
  card.details.open = refreshMapping(card) > 0;
}

async function inspectFile(card, file, headerLine = null) {
  const request = ++card.request;
  file.meta = null;
  invalidate();
  fileStatus(card, `${file.name} · 正在读取…`);
  try {
    const meta = await api('/api/inspect', {kind: card.kind, text: file.text, header_line: headerLine});
    if (card.request !== request) return;
    file.meta = meta;
    if (meta.format === 'csv') {
      const preset = file.isSample ? {} : readPresets()[mappingKey(card.kind, meta)] || {};
      file.mapping = {...meta.mapping, ...preset};
      for (const [field, heading] of Object.entries(file.headings || {})) file.mapping[field] = meta.headers.indexOf(heading);
      delete file.headings;
      showMapping(card);
      fileStatus(card, `${file.name} · ${meta.rows} 行 · 表头第 ${meta.header_line} 行`);
    } else {
      card.details.hidden = true;
      fileStatus(card, `${file.name} · JSON · 2 个平台`);
    }
  } catch (error) {
    if (card.request !== request) return;
    card.details.hidden = card.kind === 'reference' && file.name.toLowerCase().endsWith('.json');
    card.details.open = true;
    fileStatus(card, `${file.name} · ${error.message}`, 'error');
  } finally {
    updateRun();
  }
}

async function readFile(card, browserFile) {
  const request = ++card.request;
  const file = {...emptyFile(), name: browserFile.name};
  card.file = file;
  card.details.hidden = true;
  card.mapped.replaceChildren();
  card.fixed.hidden = true;
  card.confirm.hidden = true;
  card.header.value = '';
  card.details.querySelector('summary').textContent = '手动指定表头行';
  invalidate();
  fileStatus(card, `${file.name} · 正在读取…`);
  try {
    const bytes = new Uint8Array(await browserFile.arrayBuffer());
    if (card.request !== request) return;
    const encoding = bytes[0] === 0xff && bytes[1] === 0xfe ? 'utf-16le'
      : bytes[0] === 0xfe && bytes[1] === 0xff ? 'utf-16be' : 'utf-8';
    file.text = new TextDecoder(encoding, {fatal: true}).decode(bytes);
  } catch {
    if (card.request === request) fileStatus(card, `${file.name} · 请另存为 UTF-8 后重新导入。`, 'error');
    return;
  }
  await inspectFile(card, file);
}

function createCard(kind, [title, hint]) {
  const container = byId('file-card').content.firstElementChild.cloneNode(true);
  const input = container.querySelector('input[type=file]');
  const card = {
    kind, input, file: emptyFile(), request: 0,
    status: container.querySelector('.file-status'), details: container.querySelector('.mapping'),
    header: container.querySelector('.header-line input'), mapped: container.querySelector('.mapped-fields'),
    fixed: container.querySelector('.fixed-fields'), confirm: container.querySelector('.confirm-ref'),
    definitions: container.querySelector('.scope-definitions'),
  };
  container.dataset.source = kind;
  container.querySelector('h3').textContent = title;
  container.querySelector('.format-note').textContent = hint;
  input.id = `${kind}-file`;
  input.setAttribute('aria-label', `导入${title}`);
  input.accept = kind === 'reference' ? '.csv,.json' : '.csv';
  input.addEventListener('change', () => {
    const file = input.files[0];
    input.value = '';
    if (file) readFile(card, file);
  });
  container.querySelector('.recognize').addEventListener('click', () => {
    if (!card.header.value || !card.header.reportValidity() || !card.file.text) return;
    if (Number(card.header.value) !== card.file.meta?.header_line) card.file.metric_scopes = {};
    inspectFile(card, card.file, Number(card.header.value));
  });
  card.confirm.querySelector('input').addEventListener('change', (event) => {
    card.file.confirmed = event.target.checked;
    refreshMapping(card);
    invalidate();
  });
  for (const field of kind === 'reference' ? [] : fallbackFields) {
    const label = document.createElement('label');
    label.dataset.field = field;
    label.append(`此文件的${labels[field]}`);
    const value = document.createElement('input');
    value.type = 'text';
    value.placeholder = {account_id: '导出所用账户 ID', currency: 'USD', timezone: 'Asia/Shanghai'}[field];
    value.addEventListener('input', () => {
      card.file.fixed[field] = value.value;
      refreshMapping(card);
      invalidate();
    });
    label.append(value);
    card.fixed.append(label);
  }
  if (kind !== 'reference') {
    card.definitions.hidden = false;
    for (const field of metricFields) {
      const label = document.createElement('label');
      label.append(`此文件的${labels[field]}口径`);
      const value = document.createElement('input');
      value.type = 'text';
      value.dataset.field = field;
      value.maxLength = 200;
      if (field === 'conversions') value.placeholder = '填写事件、归属日期、归因窗口等';
      value.addEventListener('input', () => {
        card.file.metric_scopes[field] = value.value;
        invalidate();
      });
      label.append(value);
      card.definitions.append(label);
    }
  }
  byId('files').append(container);
  fileStatus(card, '等待导入');
  return card;
}

function reset() {
  for (const input of Object.values(scopeFields)) input.value = '';
  for (const card of Object.values(cards)) {
    card.request += 1;
    card.file = emptyFile();
    card.details.hidden = true;
    card.details.open = false;
    fileStatus(card, '等待导入');
  }
  invalidate();
}

function addRow(body, values) {
  const row = body.insertRow();
  for (const value of values) row.insertCell().textContent = value;
  return row;
}

function originLabel(origin) {
  const location = origin.line ? `第 ${origin.line} 行 · ` : '';
  const column = origin.column ? `第 ${origin.column} 列 · ` : '';
  return `${location}${column}${origin.field}`;
}

function addTrace(container, compareRow, item) {
  const {trace} = item;
  const detail = document.createElement('details');
  const summary = document.createElement('summary');
  summary.textContent = `${item.source} · ${item.label}`;
  const old = document.createElement('p');
  old.textContent = `旧周报 ${cards.reference.file.name} · ${originLabel(trace.previous)} · ${item.previous}`;
  const current = document.createElement('p');
  current.textContent = `本次 ${cards[item.source_id].file.name} · ${originLabel(trace.current)} · 账户 ${trace.account} · ${trace.row_count} 条计入汇总`;
  const note = document.createElement('p');
  note.textContent = item.scope_status ? `旧报口径 ${item.old_scope || '未提供'} / 本次口径 ${item.new_scope || '未提供'}`
    : '旧周报提供的是平台汇总。以下明细用于复算本次值。';
  const rows = document.createElement('ul');
  for (const row of trace.rows) {
    const line = document.createElement('li');
    line.textContent = `第 ${row.line} 行 · ${row.date} · 广告系列 ${row.campaign} · ${row.value}`;
    rows.append(line);
  }
  detail.append(summary, old, current, note, rows);
  if (trace.current.attribution?.length) {
    const settings = document.createElement('p');
    settings.textContent = `原表归因设置 ${trace.current.attribution.map((value) => value || '空白').join(' / ')}`;
    rows.before(settings);
  }
  if (trace.rows.length < trace.row_count) {
    const limit = document.createElement('p');
    limit.textContent = `已展示前 ${trace.rows.length} 条。其余明细可按所选列查看原 CSV。`;
    detail.append(limit);
  }
  container.append(detail);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'trace-link';
  button.textContent = '查看来源';
  button.setAttribute('aria-label', `查看来源 ${item.source} ${item.label}`);
  button.addEventListener('click', () => {
    detail.open = true;
    summary.focus({preventScroll: true});
    detail.scrollIntoView({block: 'start', behavior: 'instant'});
  });
  compareRow.insertCell().append(button);
}

function showReport(value) {
  const status = byId('result-status');
  const findings = byId('findings');
  const errors = value.errors;
  const lines = errors.length ? errors : [...value.differences, ...value.scope_notes, ...value.warnings];
  findings.replaceChildren();
  findings.hidden = !lines.length;
  findings.dataset.kind = errors.length ? 'error' : 'review';
  for (const line of lines) {
    const item = document.createElement('li');
    item.textContent = line;
    findings.append(item);
  }
  const resultScope = byId('result-scope');
  byId('result-data').hidden = Boolean(errors.length);
  if (errors.length) {
    status.dataset.kind = 'error';
    status.textContent = '请修正后重新对账';
    resultScope.textContent = '';
  } else {
    const {week_start, week_end, currency, timezone} = value.scope;
    status.dataset.kind = lines.length ? 'review' : '';
    const diffStatus = value.differences.length || value.scope_notes.length
      ? `${value.differences.length} 处数值差异 · ${value.scope_notes.length} 处口径待复核` : '四项指标均与旧周报一致';
    status.textContent = `合计花费 ${value.spend_total} ${currency} · ${diffStatus} · ${value.warnings.length} 条导入提醒`;
    resultScope.textContent = `${week_start} 至 ${week_end} · ${currency} · ${timezone}`;
    const totals = byId('totals-body');
    totals.replaceChildren();
    for (const row of value.totals) {
      addRow(totals, [row.source, row.spend, row.impressions, row.clicks, row.ctr, row.conversions, row.cpa]);
    }
    const compare = byId('compare-body');
    const traces = byId('traces');
    compare.replaceChildren();
    traces.replaceChildren();
    traces.hidden = true;
    for (const row of value.comparison) {
      const line = addRow(compare, [row.source, row.label, row.previous, row.calculated, row.scope_status || row.delta]);
      line.dataset.difference = row.changed || Boolean(row.scope_status);
      if (row.trace) {
        traces.hidden = false;
        addTrace(traces, line, row);
      } else line.insertCell().textContent = '—';
    }
    savePresets();
    currentReport = value;
    download.disabled = false;
  }
  results.hidden = false;
  results.scrollIntoView({block: 'start', behavior: 'instant'});
}

for (const [kind, definition] of Object.entries(config)) cards[kind] = createCard(kind, definition);
for (const field of Object.values(scopeFields)) field.addEventListener('input', invalidate);
byId('new-week').addEventListener('click', reset);

async function loadSample(path) {
  if (loadingDemo) return;
  loadingDemo = true;
  for (const id of Object.keys(demoButtons)) byId(id).disabled = true;
  reset();
  const started = revision;
  try {
    const sample = await api(path);
    if (revision !== started) return;
    for (const [field, value] of Object.entries(sample.scope)) scopeFields[field].value = value;
    await Promise.all(Object.entries(sample.inputs).map(([kind, entry]) => {
      const card = cards[kind];
      card.file = {...emptyFile(), ...entry, isSample: true};
      return inspectFile(card, card.file);
    }));
  } catch (error) {
    if (revision !== started) return;
    fileStatus(cards.google, error.message, 'error');
  } finally {
    loadingDemo = false;
    for (const id of Object.keys(demoButtons)) byId(id).disabled = false;
    updateRun();
  }
}
for (const [id, path] of Object.entries(demoButtons)) byId(id).addEventListener('click', () => loadSample(path));

run.addEventListener('click', async () => {
  if (run.disabled) return;
  running = true;
  invalidate();
  const started = revision;
  const inputs = Object.fromEntries(Object.entries(cards).map(([kind, {file}]) => [kind, {
    text: file.text, header_line: file.meta.header_line, mapping: file.mapping, fixed: file.fixed, confirmed: file.confirmed,
    metric_scopes: file.metric_scopes, name: file.name,
  }]));
  try {
    const value = await api('/api/report', {scope: selectedScope(), inputs});
    if (!value.errors.length && !Array.isArray(value.scope_notes)) {
      throw new Error('当前运行的是旧版服务。请打开第 04 项说明中的新版工作台再对账。');
    }
    if (revision === started) showReport(value);
  } catch (error) {
    if (revision === started) showReport({errors: [error.message]});
  } finally {
    running = false;
    updateRun();
  }
});

download.addEventListener('click', () => {
  if (!currentReport) return;
  const file = new Blob([currentReport.report], {type: 'text/markdown;charset=utf-8'});
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = `广告周报-${currentReport.scope.week_start}.md`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
