(() => {
  const $ = id => document.getElementById(id);
  const checks = [
    { bookmark: 'ScanBody', kind: '正文', location: '取样结果' },
    { bookmark: 'ScanTable', kind: '表格', location: '表 1 · 0.27 秒所在行' },
    { bookmark: 'ScanCaption', kind: '图注', location: '图 1 · 归一化扫描曲线' },
  ];
  const wordType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const excelType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const buttons = { word: $('word-tab'), excel: $('excel-tab') };
  const panels = { word: $('word-panel'), excel: $('excel-panel') };
  const knownCells = ['B5', 'B6', 'B7', 'B9', 'B10'];
  const seconds = value => value.toFixed(2);
  const exactSeconds = value => Number(seconds(value)) === value ? seconds(value) : String(value);
  const percent = value => Number((value * 100).toFixed(3)) + '%';
  const normalizedFormula = formula => (formula ?? '').toUpperCase().replace(/[\s$]/g, '');
  const expectedTimeFormula = 'IF(AND(COUNT(B5:B6)=2,B5>0,B6>=0),MIN(B6/B5,1),NA())';
  const expectedDistanceFormula = 'B9^2*(3-2*B9)';
  let report;
  let excel;
  let sourceType = 'word';
  let mode = 'loading';
  let imageUrls = new Map();
  let selectedBookmark;
  let selectedCell = 'B10';

  function element(tag, text, className) {
    const node = document.createElement(tag);
    node.textContent = text ?? '';
    if (className) node.className = className;
    return node;
  }

  function sourceFile(buffer, name, type) {
    return { name, url: URL.createObjectURL(new Blob([buffer], { type })) };
  }

  async function loadReport(buffer, name) {
    const parsed = await window.scanOffice.readWord(buffer);
    for (const { bookmark, kind } of checks) {
      const value = parsed.byBookmark.get(bookmark)?.trim();
      if (!/^\d+(?:\.\d{1,12})?\s*[%％]$/.test(value ?? '')) {
        throw new Error(`Word 的${kind}书签中找不到百分比。请保留样例里的三个书签。`);
      }
    }
    return { ...parsed, ...sourceFile(buffer, name, wordType) };
  }

  async function loadWorkbook(buffer, name) {
    const parsed = await window.scanOffice.readExcel(buffer);
    const duration = parsed.cells.get('B5')?.value;
    const sample = parsed.cells.get('B6')?.value;
    if (!Number.isFinite(duration) || duration <= 0) throw new Error('Excel 的 B5 必须是大于 0 的总时长。');
    if (sample !== 0.27) throw new Error('这份 Word 样例取样于第 0.27 秒，请保留 Excel B6 为 0.27。');
    if (normalizedFormula(parsed.cells.get('B9')?.formula) !== expectedTimeFormula ||
        normalizedFormula(parsed.cells.get('B10')?.formula) !== expectedDistanceFormula) {
      throw new Error('请保留样例 Excel 在 B9 和 B10 中的扫描公式。');
    }
    const t = Math.min(sample / duration, 1);
    const distance = t * t * (3 - 2 * t);
    const hasStaleCache = [['B9', t], ['B10', distance]].some(([cell, computed]) => {
      const saved = parsed.cells.get(cell)?.value;
      return !Number.isFinite(saved) || Math.abs(saved - computed) > 1e-9;
    });
    return { ...parsed, ...sourceFile(buffer, name, excelType), duration, sample, t, distance, hasStaleCache };
  }

  function fromBase64(encoded) {
    return Uint8Array.from(atob(encoded), character => character.charCodeAt(0)).buffer;
  }

  const sampleWorkbook = version => loadWorkbook(fromBase64(window.scanSamples[version]), '角色扫描参数表.xlsx');

  function changeSource(type) {
    sourceType = type;
    for (const id of Object.keys(buttons)) {
      const selected = id === type;
      buttons[id].setAttribute('aria-selected', selected);
      buttons[id].tabIndex = selected ? 0 : -1;
      panels[id].hidden = !selected;
    }
    updateDownload();
  }

  function updateDownload() {
    const file = sourceType === 'word' ? report : excel;
    if (!file) return;
    $('file-name').textContent = file.name + (sourceType === 'excel' ? ' · ' + modeLabel() : '');
    $('download-source').href = file.url;
    $('download-source').download = file.name;
  }

  function modeLabel() {
    return { baseline: '改动前', changed: '已应用改动', imported: '已导入' }[mode];
  }

  function highlightWord(bookmark) {
    selectedBookmark = bookmark;
    for (const target of $('word-preview').querySelectorAll('mark')) {
      target.dataset.active = String(target.id === bookmark);
    }
    for (const button of $('checks').querySelectorAll('button')) {
      button.setAttribute('aria-pressed', button.dataset.bookmark === bookmark);
    }
  }

  function locateWord(bookmark) {
    changeSource('word');
    highlightWord(bookmark);
    const target = $(bookmark);
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'center', inline: 'nearest' });
  }

  function wordParagraph(block, findings) {
    const tag = { Title: 'h3', Heading1: 'h4' }[block.style] ?? 'p';
    const node = element(tag, '', block.style === 'Caption' ? 'caption' : '');
    for (const segment of block.segments) {
      if (segment.bookmark) {
        const mark = element('mark', segment.value);
        mark.id = segment.bookmark;
        mark.tabIndex = -1;
        mark.dataset.mismatch = findings.get(segment.bookmark).mismatch;
        node.append(mark);
      } else {
        node.append(document.createTextNode(segment.value));
      }
    }
    for (const id of block.images) {
      if (!imageUrls.has(id)) continue;
      const image = element('img');
      image.src = imageUrls.get(id);
      image.alt = 'Word 原图，扫描路程随归一化时间变化的曲线。';
      node.append(image);
    }
    return node;
  }

  function renderWord(findings) {
    for (const url of imageUrls.values()) URL.revokeObjectURL(url);
    imageUrls = new Map([...report.pictures].map(([id, blob]) => [id, URL.createObjectURL(blob)]));
    const blocks = report.blocks.map(block => {
      if (block.kind === 'paragraph') return wordParagraph(block, findings);
      const table = element('table');
      table.setAttribute('aria-label', '表 1 扫描进度取样');
      const head = table.createTHead();
      const body = table.createTBody();
      block.rows.forEach((cells, index) => {
        const row = (index === 0 ? head : body).insertRow();
        for (const paragraphs of cells) {
          const cell = element(index === 0 ? 'th' : 'td');
          if (index === 0) cell.scope = 'col';
          cell.append(...paragraphs.map(paragraph => wordParagraph(paragraph, findings)));
          row.append(cell);
        }
      });
      return table;
    });
    $('word-preview').replaceChildren(...blocks);
  }

  function inspectCell(address) {
    selectedCell = address;
    const cell = excel.cells.get(address);
    $('cell-reference').textContent = excel.sheetName + ' · ' + address;
    $('cell-formula').textContent = cell?.formula ? '=' + cell.formula : String(cell?.value ?? '');
    for (const target of $('excel-preview').querySelectorAll('[data-focus]')) {
      target.dataset.active = String(target.dataset.cell === address);
      target.firstElementChild.setAttribute('aria-pressed', target.dataset.active);
    }
  }

  function displayCell(address) {
    const value = excel.cells.get(address)?.value;
    if (typeof value !== 'number') return value ?? '';
    if (address === 'B10') return (value * 100).toFixed(3) + '%';
    return seconds(value);
  }

  function renderExcel() {
    const table = element('table');
    table.setAttribute('aria-label', excel.sheetName);
    const header = table.createTHead().insertRow();
    for (const key of ['', 'A', 'B', 'C', 'D']) header.append(element('th', key));
    const body = table.createTBody();
    for (let index = 1; index <= 10; index++) {
      const row = body.insertRow();
      const rowNumber = element('th', index);
      rowNumber.scope = 'row';
      row.append(rowNumber);
      for (const column of ['A', 'B', 'C', 'D']) {
        const address = column + index;
        const cell = row.insertCell();
        cell.dataset.cell = address;
        const value = displayCell(address);
        if (knownCells.includes(address)) {
          const button = element('button', value || '空');
          button.type = 'button';
          button.setAttribute('aria-label', address + ' ' + value);
          button.addEventListener('click', () => inspectCell(address));
          cell.dataset.focus = 'true';
          cell.append(button);
        } else {
          cell.textContent = value;
        }
      }
    }
    $('excel-preview').replaceChildren(table);
    inspectCell(selectedCell);
    $('sheet-note').textContent = excel.hasStaleCache
      ? 'Excel 保存的公式结果可能未更新。校对使用 B5 和 B6 重新计算。请在 Excel 中重算并保存。'
      : '公式保存值与复算结果一致。点击数值可查看单元格内容和公式。';
  }

  function render() {
    const findings = new Map(checks.map(({ bookmark }) => {
      const original = report.byBookmark.get(bookmark).trim();
      const decimals = original.match(/\.(\d+)/)?.[1].length ?? 0;
      const mismatch = Number.parseFloat(original) !== Number((excel.distance * 100).toFixed(decimals));
      return [bookmark, { original, mismatch }];
    }));
    const mismatchCount = [...findings.values()].filter(finding => finding.mismatch).length;
    $('count').textContent = mismatchCount ? mismatchCount + ' 处需核对' : '0 处不一致';
    $('count').dataset.mismatches = String(mismatchCount > 0);

    const rows = checks.map(({ bookmark, kind, location }) => {
      const { original, mismatch } = findings.get(bookmark);
      const button = element('button', '', 'check');
      button.type = 'button';
      button.dataset.bookmark = bookmark;
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => locateWord(bookmark));
      const locationLine = element('div', '', 'check-location');
      locationLine.append(element('strong', kind), document.createTextNode(' · ' + location));
      const values = element('div', '', 'check-values');
      values.dataset.mismatch = mismatch;
      values.append(element('small', '原文'), element('strong', original, 'old'));
      if (mismatch) {
        values.append(element('span', '→'), element('small', '复算'), element('strong', percent(excel.distance), 'expected'));
      } else {
        values.append(element('small', '与复算一致'));
      }
      button.append(locationLine, values, element('span', '查看原文 ↗', 'check-link'));
      return button;
    });
    $('checks').replaceChildren(...rows);
    renderWord(findings);
    if (selectedBookmark) highlightWord(selectedBookmark);
    renderExcel();
    updateDownload();
    $('calculation').hidden = false;
    $('time-calc').textContent = `t = min(${exactSeconds(excel.sample)} ÷ ${exactSeconds(excel.duration)}, 1) = ${Number(excel.t.toFixed(8))}`;
    $('distance-calc').textContent = 'F(t) = t²(3 − 2t) = ' + percent(excel.distance);
    $('change').disabled = mode === 'changed';
    $('reset').disabled = mode === 'baseline';
    const messages = {
      baseline: '已校对 1.08 秒版，三处数字均与复算一致。',
      changed: '已读取改动后的 Excel，Word 保留原稿。',
      imported: '已读取导入文件，总时长为 ' + exactSeconds(excel.duration) + ' 秒。',
    };
    status(messages[mode]);
  }

  function status(message, isError = false) {
    $('run-status').textContent = message;
    $('run-status').toggleAttribute('data-error', isError);
  }

  function fail(error) {
    status(error instanceof RangeError || error instanceof TypeError ? '文件无法读取，请选用有效的 Word 或 Excel 样例。' : error.message, true);
  }

  async function operate(action) {
    $('change').disabled = $('reset').disabled = true;
    for (const id of ['upload-word', 'upload-excel']) $(id).disabled = true;
    try {
      await action();
      render();
    } catch (error) {
      fail(error);
      $('change').disabled = !report || mode === 'changed';
      $('reset').disabled = !report || mode === 'baseline';
    } finally {
      for (const id of ['upload-word', 'upload-excel']) $(id).disabled = !report;
    }
  }

  function replaceExcel(next) {
    if (excel) URL.revokeObjectURL(excel.url);
    excel = next;
  }

  async function resetDemo() {
    const samples = window.scanSamples;
    const nextReport = await loadReport(fromBase64(samples.word), '角色扫描验证报告.docx');
    const nextExcel = await sampleWorkbook('baseline');
    if (report) URL.revokeObjectURL(report.url);
    report = nextReport;
    replaceExcel(nextExcel);
    mode = 'baseline';
    selectedBookmark = null;
    selectedCell = 'B10';
    changeSource('word');
    panels.word.scrollTop = 0;
  }

  for (const id of Object.keys(buttons)) {
    const other = id === 'word' ? 'excel' : 'word';
    buttons[id].addEventListener('click', () => changeSource(id));
    buttons[id].addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const target = event.key === 'Home' ? 'word' : event.key === 'End' ? 'excel' : other;
      changeSource(target);
      buttons[target].focus();
    });
  }
  $('change').addEventListener('click', () => operate(async () => {
    replaceExcel(await sampleWorkbook('revised'));
    mode = 'changed';
  }));
  $('reset').addEventListener('click', () => operate(resetDemo));
  $('show-excel').addEventListener('click', () => {
    changeSource('excel');
    inspectCell('B10');
    const cell = $('excel-preview').querySelector('[data-cell="B10"] button');
    cell.focus({ preventScroll: true });
    cell.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  });
  $('upload-word').addEventListener('change', event => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    operate(async () => {
      const next = await loadReport(await file.arrayBuffer(), file.name);
      URL.revokeObjectURL(report.url);
      report = next;
      selectedBookmark = null;
      changeSource('word');
    });
  });
  $('upload-excel').addEventListener('change', event => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    operate(async () => {
      replaceExcel(await loadWorkbook(await file.arrayBuffer(), file.name));
      mode = 'imported';
      changeSource('excel');
    });
  });
  operate(resetDemo);
})();
