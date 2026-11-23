(() => {
  const clean = value => String(value ?? '').normalize('NFKC').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  const scopes = [
    ['complete', '体重与鳍长均有效', /(?:体重(?:与|和)鳍长|鳍长(?:与|和)体重)均有效/],
    ['all', '全部观测', /全部观测|所有观测|全样本|总样本|all observations|full sample/],
    ['adelie', 'Adélie', /\badelie\b|阿德利/],
    ['chinstrap', 'Chinstrap', /\bchinstrap\b|帽带企鹅/],
    ['gentoo', 'Gentoo', /\bgentoo\b|巴布亚/],
  ];
  const countLabel = /样本量|样本数|观测数|个体数|sample size|observation count|^n(?:\s*[(（].*[)）])?$/;
  const digitToken = '(?:[1-9]\\d{0,2}(?:[,，]\\d{3}){1,3}|\\d{1,12})';
  const countValue = value => Number(value.replace(/[,，]/g, ''));
  const countHeader = value => countLabel.test(clean(value)) && !/[%％]|缺失|排除/.test(value ?? '');
  const scopeOf = (value, surrounding = value) => {
    const context = clean(value);
    const parent = clean(surrounding);
    const referredMeasures = /两项测量均有效/.test(context) && /体重/.test(parent) && /鳍长/.test(parent);
    const matches = scopes.filter(([key, , test]) => test.test(context) || (key === 'complete' && referredMeasures));
    return matches.length === 1 ? matches[0][0] : '';
  };
  const textOf = segments => segments.map(({ value }) => value).join('');

  function findMentions(blocks) {
    const mentions = [];
    const tableValue = new RegExp('^\\s*(' + digitToken + ')\\s*(?:只|条|人|例)?\\s*$');
    const values = new RegExp('\\b(n\\s*=\\s*)(' + digitToken + ')(?!\\d|[.,，]\\d)|(' + digitToken + ')(?![\\d.])\\s*(只|条|人|例)(?!要)', 'gi');
    let heading = '';
    let tableNumber = 0;
    blocks.forEach((block, blockIndex) => {
      if (block.kind === 'table') {
        tableNumber++;
        const rows = block.rows.map(row => row.map(cell => cell.map(p => textOf(p.segments)).join('\n')));
        const headers = rows[0];
        if (!headers) return;
        rows.slice(1).forEach((row, rowIndex) => row.forEach((value, column) => {
          const numeric = tableValue.exec(value);
          if (!numeric || !countHeader(headers[column])) return;
          const rowLabel = row.filter((_, index) => column !== index).join(' ').trim();
          mentions.push({
            id: `word-${blockIndex}-${rowIndex + 1}-${column}`,
            blockIndex, row: rowIndex + 1, column, kind: '表格',
            location: `表 ${tableNumber} · ${rowLabel || `第 ${rowIndex + 1} 行`}`,
            start: value.indexOf(numeric[1]), raw: numeric[1], value: countValue(numeric[1]),
            scope: scopeOf(rowLabel), clues: [headers[column], rowLabel].filter(Boolean),
          });
        }));
        return;
      }

      const text = textOf(block.segments);
      if (/^Heading\d+$/.test(block.style ?? '')) {
        heading = text;
        return;
      }
      if (block.style === 'Title' || /^\s*(?:表|table)\s*\d/i.test(text)) return;
      const isCaption = block.style === 'Caption' || /^\s*(?:图|fig(?:ure)?\.?)[ \t]*\d/i.test(text);
      const label = text.match(/^\s*(?:图|fig(?:ure)?\.?)\s*(\d+)/i);
      for (const match of text.matchAll(values)) {
        const [, prefix, withN, withUnit, unit] = match;
        const raw = withN ?? withUnit;
        const tokenStart = match.index + (prefix?.length ?? 0);
        const previous = text[tokenStart - 1];
        const sentenceStart = Math.max(text.lastIndexOf('。', match.index - 1), text.lastIndexOf('；', match.index - 1)) + 1;
        const sentenceEnd = text.indexOf('。', match.index + match[0].length);
        const sentence = text.slice(sentenceStart, sentenceEnd < 0 ? text.length : sentenceEnd);
        const context = clean(sentence);
        if (previous && /[\d.,，-]/.test(previous)) continue;
        if (!prefix && !countLabel.test(context) && !/观测|记录|企鹅/.test(context)) continue;
        const scope = scopeOf(sentence, text);
        mentions.push({
          id: `word-${blockIndex}-${tokenStart}`,
          blockIndex, kind: isCaption ? '图注' : '正文',
          location: isCaption ? (label ? `图 ${label[1]}` : '图注') : heading || '正文段落',
          start: tokenStart, raw, value: countValue(raw), scope,
          clues: ['样本量', unit ? `单位「${unit}」` : 'n =', scope && scopes.find(([key]) => key === scope)[1]].filter(Boolean),
        });
      }
    });
    return mentions;
  }

  function indexWorkbook(sheets) {
    const results = [];
    sheets.forEach(({ sheetName, cells }) => {
      const firstLabels = new Map();
      for (const [address, { value }] of cells) {
        if (typeof value !== 'string' || !value.trim()) continue;
        const row = address.replace(/^[A-Z]+/, '');
        if (!firstLabels.has(row)) firstLabels.set(row, value);
      }
      for (const [address, cell] of cells) {
        const coordinates = /^([A-Z]+)(\d+)$/.exec(address ?? '');
        if (!coordinates || !Number.isSafeInteger(cell.value) || cell.value < 0) continue;
        const [, column, row] = coordinates;
        const rowIndex = Number(row);
        let header = '';
        for (let previous = rowIndex - 1; previous >= Math.max(1, rowIndex - 15); previous--) {
          const candidate = cells.get(column + previous)?.value;
          if (typeof candidate === 'string' && candidate.trim()) {
            header = candidate;
            break;
          }
        }
        if (!countHeader(header)) continue;
        const rowLabel = firstLabels.get(row) ?? '';
        results.push({ sheetName, address, ...cell, header, rowLabel, scope: scopeOf(rowLabel) });
      }
    });
    return results;
  }

  function suggest(mention, candidates) {
    const sameScope = mention.scope ? candidates.filter(item => item.scope === mention.scope) : [];
    return { selected: sameScope.length === 1 ? sameScope[0] : null, options: sameScope.length ? sameScope : candidates };
  }

  window.paperMatching = { findMentions, indexWorkbook, suggest, textOf };
})();
