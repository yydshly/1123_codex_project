(() => {
  const $ = id => document.getElementById(id);
  const office = window.scanOffice;
  const { findMentions, indexWorkbook, suggest, textOf } = window.paperMatching;
  const fromBase64 = value => Uint8Array.from(atob(value), c => c.charCodeAt(0)).buffer;
  const buttons = { word: $('word-tab'), excel: $('excel-tab') };
  const panels = { word: $('word-panel'), excel: $('excel-panel') };
  let report, workbook, active, selectedCell;
  let type = 'word';
  let mode = 'original';
  let findings = [];
  const bindings = new Map();

  function make(tag, text = '', className = '') {
    const node = document.createElement(tag);
    node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function button(label, handler, className = 'quiet') {
    const control = make('button', label, className);
    control.type = 'button';
    control.addEventListener('click', handler);
    return control;
  }

  const fileInfo = (buffer, name) => ({ name, url: URL.createObjectURL(new Blob([buffer])) });
  const originalWorkbook = () => fromBase64(window.paperSamples.original);

  async function setWord(buffer, name) {
    const parsed = await office.readWord(buffer);
    const mentions = findMentions(parsed.blocks);
    if (report) {
      URL.revokeObjectURL(report.url);
      for (const url of report.pictures.values()) URL.revokeObjectURL(url);
    }
    const pictures = new Map([...parsed.pictures].map(([id, blob]) => [id, URL.createObjectURL(blob)]));
    report = { ...parsed, ...fileInfo(buffer, name), pictures, mentions };
  }

  async function setWorkbook(buffer, name) {
    const sheets = await office.readWorkbook(buffer);
    const candidates = indexWorkbook(sheets);
    if (workbook) URL.revokeObjectURL(workbook.url);
    workbook = { sheets, candidates, ...fileInfo(buffer, name) };
  }

  function cellAt(sheetName, address) {
    const cell = workbook.sheets.find(sheet => sheet.sheetName === sheetName)?.cells.get(address);
    return cell ? { ...cell, sheetName, address } : null;
  }

  function chooseWord(id) {
    active = id;
    changeSource('word');
    renderSelection();
    const mark = $(id);
    mark.focus({ preventScroll: true });
    mark.scrollIntoView({ block: 'center', inline: 'nearest' });
  }

  function changeSource(next) {
    type = next;
    for (const [key, panel] of Object.entries(panels)) {
      panel.hidden = key !== next;
      buttons[key].setAttribute('aria-pressed', key === next);
    }
    const file = type === 'word' ? report : workbook;
    if (file) {
      $('file-name').textContent = file.name;
      $('download').download = file.name;
      $('download').href = file.url;
    }
  }

  function renderSelection() {
    for (const node of $('word-preview').querySelectorAll('mark')) node.dataset.active = String(node.id === active);
    for (const node of $('checks').querySelectorAll('button')) node.setAttribute('aria-pressed', node.dataset.location === active);
    renderDetails();
  }

  function markedText(text, points) {
    const result = document.createDocumentFragment();
    let cursor = 0;
    for (const { mention, selected } of points) {
      result.append(document.createTextNode(text.slice(cursor, mention.start)));
      const mark = make('mark', mention.raw);
      mark.id = mention.id;
      mark.tabIndex = -1;
      mark.dataset.pending = String(!selected);
      mark.dataset.mismatch = String(selected != null && selected.value !== mention.value);
      result.append(mark);
      cursor = mention.start + mention.raw.length;
    }
    result.append(document.createTextNode(text.slice(cursor)));
    return result;
  }

  function renderWord() {
    const byBlock = new Map();
    for (const finding of findings) {
      const block = finding.mention.blockIndex;
      if (!byBlock.has(block)) byBlock.set(block, []);
      byBlock.get(block).push(finding);
    }
    const parts = report.blocks.map((block, index) => {
      const points = byBlock.get(index) ?? [];
      if (block.kind === 'table') {
        const table = make('table');
        const head = table.createTHead();
        const body = table.createTBody();
        block.rows.forEach((cells, rowIndex) => {
          const row = (rowIndex === 0 ? head : body).insertRow();
          cells.forEach((paragraphs, column) => {
            const cell = make(rowIndex === 0 ? 'th' : 'td');
            if (rowIndex === 0) cell.scope = 'col';
            const text = paragraphs.map(p => textOf(p.segments)).join('\n');
            cell.append(markedText(text, points.filter(({ mention }) => mention.row === rowIndex && mention.column === column)));
            row.append(cell);
          });
        });
        return table;
      }
      const tag = block.style === 'Title' ? 'h3' : /^Heading\d+$/.test(block.style ?? '') ? 'h4' : 'p';
      const paragraph = make(tag, '', block.style === 'Caption' ? 'caption' : '');
      paragraph.append(markedText(textOf(block.segments), points));
      for (const id of block.images) {
        if (!report.pictures.has(id)) continue;
        const img = make('img');
        img.src = report.pictures.get(id);
        img.alt = 'Word 文档中的原图';
        paragraph.append(img);
      }
      return paragraph;
    });
    $('word-preview').replaceChildren(...parts);
  }

  function label(cell) {
    return cell.sheetName + '!' + cell.address;
  }

  function showCell(cell) {
    selectedCell = cell;
    changeSource('excel');
    renderExcel();
  }

  function columnNumber(letters) {
    return Array.from(letters).reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0);
  }

  function columnLabel(number) {
    let text = '';
    while (number > 0) {
      number--;
      text = String.fromCharCode(65 + number % 26) + text;
      number = Math.floor(number / 26);
    }
    return text;
  }

  function renderExcel() {
    const formula = $('excel-formula');
    const note = $('excel-note');
    const view = $('excel-preview');
    formula.replaceChildren();
    view.replaceChildren();
    note.replaceChildren();
    if (!selectedCell) {
      formula.append(make('p', '选择一条校对结果，再打开它对应的 Excel 单元格。'));
      return;
    }
    const cell = selectedCell;
    const sheet = workbook.sheets.find(item => item.sheetName === cell.sheetName);
    if (!sheet) return;
    formula.append(make('strong', label(cell)), make('code', cell.formula ? '=' + cell.formula : String(cell.value ?? '')));

    const table = make('table', '', 'paper-sheet');
    table.setAttribute('aria-label', cell.sheetName);
    const [, letters, rowText] = /^([A-Z]+)(\d+)$/.exec(cell.address);
    const targetRow = Number(rowText);
    const column = columnNumber(letters);
    const startColumn = Math.max(1, column - 3);
    let maxColumn = column;
    for (const key of sheet.cells.keys()) maxColumn = Math.max(maxColumn, columnNumber(key.replace(/\d+/g, '')));
    const endColumn = Math.min(maxColumn, column + 3, startColumn + 7);
    const columns = Array.from({ length: endColumn - startColumn + 1 }, (_, index) => columnLabel(startColumn + index));
    const head = table.createTHead().insertRow();
    for (const item of ['', ...columns]) head.append(make('th', item));
    const body = table.createTBody();
    for (let row = Math.max(1, targetRow - 4); row <= targetRow + 3; row++) {
      const tr = body.insertRow();
      const header = make('th', String(row));
      header.scope = 'row';
      tr.append(header);
      for (const name of columns) {
        const address = name + row;
        const input = cellAt(cell.sheetName, address);
        const td = tr.insertCell();
        td.dataset.address = address;
        if (address === cell.address) td.dataset.active = 'true';
        td.textContent = String(input?.value ?? '');
      }
    }
    view.append(table);
    view.querySelector('[data-active]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });

    const references = [...(cell.formula ?? '').matchAll(/(?:'([^']+)'|([\p{L}\w]+))!\$?([A-Z]+)\$?(\d+)(?::\$?([A-Z]+)\$?(\d+))?/gu)];
    const actions = make('div', '', 'sheet-preview-actions');
    for (const [, quoted, plain, col, row, endCol, endRow] of references) {
      const source = cellAt(quoted ?? plain, col + row);
      if (source) actions.append(button('查看 ' + label(source) + (endCol ? ':' + endCol + endRow : ''), () => showCell(source)));
    }
    const matched = findings.find(({ mention }) => mention.id === active)?.selected;
    if (matched && label(matched) !== label(cell)) actions.append(button('返回结果单元格', () => showCell(matched)));
    note.append(make('p', cell.formula ? '显示 Excel 中保存的公式和值。' : '显示 Excel 中的原始单元格。'), actions);
  }

  function bind(mention, cell) {
    bindings.set(mention.id, cell);
    render();
    showCell(cell);
  }

  function renderDetails() {
    const detail = $('details');
    detail.replaceChildren();
    const finding = findings.find(({ mention }) => mention.id === active);
    if (!finding) {
      detail.append(make('p', '点击左边任意结果查看定位和匹配依据。', 'detail-line'));
      return;
    }
    const { mention, selected, options } = finding;
    const title = make('h3', mention.kind + ' · ' + mention.location, 'detail-title');
    const line = make('p', 'Word 提取到 ' + mention.clues.join(' / '), 'detail-line');
    detail.append(title, line);
    const actions = make('div', '', 'detail-actions');
    if (selected) {
      detail.append(make('p', (bindings.has(mention.id) ? '已手动确认 ' : '唯一同口径候选 ') + label(selected) + (selected.rowLabel ? ' · ' + selected.rowLabel : ''), 'detail-line'));
      actions.append(button('定位 ' + label(selected) + ' ↗', () => showCell(selected)));
    } else {
      detail.append(make('p', (mention.scope ? '没有唯一对应的 Excel 单元格。' : '原句缺少统计范围。') + '请确认后再比较数值。', 'detail-line'));
      options.slice(0, 6).forEach(candidate => {
        actions.append(button('选 ' + label(candidate) + ' · ' + candidate.rowLabel + ' ' + candidate.value, () => bind(mention, candidate)));
      });
    }
    const manual = make('details');
    manual.append(make('summary', '手动指定 Excel 地址', 'manual-label'));
    const form = make('form');
    const field = make('input');
    field.placeholder = '例如 统计汇总!B5';
    field.setAttribute('aria-label', 'Excel 工作表和单元格');
    field.required = true;
    const send = make('button', '按此口径核对', 'quiet');
    send.type = 'submit';
    const message = make('span', '', 'detail-line');
    message.setAttribute('role', 'status');
    form.append(field, send, message);
    form.addEventListener('submit', event => {
      event.preventDefault();
      const match = /^(.*)!\s*\$?([a-z]+)\$?(\d+)$/i.exec(field.value.trim());
      const cell = match ? cellAt(match[1].trim(), match[2].toUpperCase() + match[3]) : null;
      if (!cell || !Number.isSafeInteger(cell.value) || cell.value < 0) {
        message.textContent = '请填写含非负整数的工作表和单元格。';
        return;
      }
      bind(mention, cell);
    });
    manual.append(form);
    actions.append(manual);
    detail.append(actions);
  }

  function render() {
    findings = report.mentions.map(mention => {
      const inference = suggest(mention, workbook.candidates);
      const binding = bindings.get(mention.id);
      const selected = binding ? cellAt(binding.sheetName, binding.address) : inference.selected;
      return { mention, ...inference, selected };
    });
    if (!findings.some(({ mention }) => mention.id === active)) active = findings[0]?.mention.id;
    const counts = { same: 0, different: 0, pending: 0 };
    const rows = findings.map(({ mention, selected }) => {
      const mismatch = selected && selected.value !== mention.value;
      counts[selected ? (mismatch ? 'different' : 'same') : 'pending']++;
      const row = button('', () => chooseWord(mention.id), 'check');
      row.dataset.location = mention.id;
      row.dataset.kind = mention.kind;
      row.dataset.pending = String(!selected);
      const values = make('span', '', 'check-values');
      values.dataset.mismatch = String(Boolean(mismatch));
      values.append(make('small', '原文'), make('strong', mention.raw, 'old'));
      if (selected) values.append(make('span', '→'), make('small', 'Excel'), make('strong', String(selected.value), 'expected'));
      const clue = selected ? label(selected) : '待确认 · ' + (mention.scope ? '没有唯一对应项' : '原文未说明统计范围');
      row.append(make('span', mention.kind + ' · ' + mention.location, 'check-location'),
        values, make('span', '查看原文 ↗', 'check-link'), make('span', clue, 'study-clues'));
      return row;
    });
    const summary = [counts.different && counts.different + ' 处差异', counts.same && counts.same + ' 处一致', counts.pending && counts.pending + ' 处待确认'].filter(Boolean);
    $('count').textContent = summary.join(' · ') || '没有候选数字';
    $('count').dataset.mismatches = String(counts.different > 0);
    $('checks').replaceChildren(...(rows.length ? rows : [make('p', '没有识别到支持的样本量写法。可试带有“样本量”列标题或“n =”的数字。', 'empty-result')]));
    renderWord();
    renderSelection();
    if (selectedCell) selectedCell = cellAt(selectedCell.sheetName, selectedCell.address);
    changeSource(type);
    if (type === 'excel') renderExcel();
  }

  async function operate(action, message) {
    const controls = ['alter', 'reset', 'upload-word', 'upload-excel'].map($);
    controls.forEach(control => { control.disabled = true; });
    try {
      await action();
      render();
      $('run-status').textContent = message;
      $('run-status').removeAttribute('data-error');
    } catch (error) {
      $('run-status').textContent = '文件未载入。' + (error instanceof RangeError ? '请检查 Office 文件格式。' : error.message);
      $('run-status').setAttribute('data-error', '');
    } finally {
      $('alter').disabled = !workbook || !report || mode !== 'original';
      $('reset').disabled = !report || mode === 'original';
      $('upload-word').disabled = $('upload-excel').disabled = !report || !workbook;
    }
  }

  const reset = () => operate(async () => {
    await setWord(fromBase64(window.paperSamples.word), '企鹅论文核对样例.docx');
    await setWorkbook(originalWorkbook(), '企鹅公开数据.xlsx');
    bindings.clear();
    mode = 'original';
    type = 'word';
    active = selectedCell = null;
  }, '已经读取未加书签的 Word 和原始 Excel。');

  $('alter').addEventListener('click', () => operate(async () => {
    await setWorkbook(fromBase64(window.paperSamples.altered), '企鹅公开数据 演示改版.xlsx');
    mode = 'altered';
  }, '已读取演示改版。Excel 的观测!I2 从 1 改为 0，Word 保留原有数字。'));
  $('reset').addEventListener('click', reset);
  buttons.word.addEventListener('click', () => changeSource('word'));
  buttons.excel.addEventListener('click', () => {
    const finding = findings.find(({ mention }) => mention.id === active);
    if (finding?.selected) showCell(finding.selected);
    else { selectedCell = null; changeSource('excel'); renderExcel(); }
  });
  for (const [kind, importer] of [['word', setWord], ['excel', setWorkbook]]) {
    $('upload-' + kind).addEventListener('change', event => {
      const file = event.target.files[0];
      event.target.value = '';
      if (!file) return;
      operate(async () => {
        await importer(await file.arrayBuffer(), file.name);
        mode = 'imported';
        type = 'word';
        bindings.clear();
        active = selectedCell = null;
      }, '已读取 ' + file.name + '，按新文件重新匹配。');
    });
  }
  reset();
})();
