(() => {
  const wordNS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const linkNS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const utf8 = new TextDecoder();
  const byteLimit = 20 * 1024 * 1024;
  const partLimit = 6 * 1024 * 1024;
  const elements = (node, name) => Array.from(node.getElementsByTagNameNS('*', name));
  const first = (node, name) => elements(node, name)[0];

  function openArchive(buffer) {
    if (buffer.byteLength > byteLimit) throw new Error('文件请控制在 20 MB 以内。');
    const view = new DataView(buffer);
    const u16 = offset => view.getUint16(offset, true);
    const u32 = offset => view.getUint32(offset, true);
    const bytes = (offset, length) => new Uint8Array(buffer, offset, length);
    let end = view.byteLength - 22;
    const minimum = Math.max(0, end - 65535);
    while (end >= minimum && !(u32(end) === 0x06054b50 && end + 22 + u16(end + 20) === view.byteLength)) end--;
    if (end < minimum || u16(end + 4) || u16(end + 6)) throw new Error('无法读取 Office 文件。');
    const parts = new Map();
    let offset = u32(end + 16);
    for (let index = 0; index < u16(end + 10); index++) {
      if (offset > end - 46 || u32(offset) !== 0x02014b50) throw new Error('文件目录不完整。');
      const length = u16(offset + 28);
      const name = utf8.decode(bytes(offset + 46, length));
      parts.set(name, {
        flags: u16(offset + 8),
        method: u16(offset + 10),
        compressed: u32(offset + 20),
        size: u32(offset + 24),
        offset: u32(offset + 42),
      });
      offset += 46 + length + u16(offset + 30) + u16(offset + 32);
    }

    async function read(name) {
      const item = parts.get(name);
      if (!item || item.offset > end - 30 || u32(item.offset) !== 0x04034b50) {
        throw new Error('Office 文件缺少所需的内容。');
      }
      if (item.size > partLimit || (item.flags & 1) || ![0, 8].includes(item.method)) {
        throw new Error('暂时无法读取加密文件或过大的文件内容。');
      }
      const start = item.offset + 30 + u16(item.offset + 26) + u16(item.offset + 28);
      if (start + item.compressed > end) throw new Error('文件内容不完整。');
      const raw = bytes(start, item.compressed);
      if (item.method === 0) {
        if (item.compressed !== item.size) throw new Error('文件内容大小与目录不符。');
        return raw;
      }
      const reader = new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
      const result = new Uint8Array(item.size);
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (size + value.length > result.length) {
          await reader.cancel();
          throw new Error('文件内容大小与目录不符。');
        }
        result.set(value, size);
        size += value.length;
      }
      if (size !== result.length) throw new Error('文件内容大小与目录不符。');
      return result;
    }

    return {
      has: name => parts.has(name),
      read,
      async xml(name) {
        const source = utf8.decode(await read(name));
        if (/<!DOCTYPE/i.test(source)) throw new Error('Office 文件包含无法读取的 XML 内容。');
        const document = new DOMParser().parseFromString(source, 'application/xml');
        if (first(document, 'parsererror')) throw new Error('Office 文件内容无法解析。');
        return document;
      },
    };
  }

  function relatedPart(rels, id, owner) {
    const link = elements(rels, 'Relationship').find(item => item.getAttribute('Id') === id);
    if (!link || link.getAttribute('TargetMode') === 'External') return '';
    const target = new URL(link.getAttribute('Target'), 'https://office.local/' + owner);
    return target.origin === 'https://office.local' ? decodeURIComponent(target.pathname.slice(1)) : '';
  }

  function paragraph(node) {
    const segments = [];
    const images = [];
    const open = new Map();
    const tags = ['bookmarkStart', 'bookmarkEnd', 't', 'tab', 'br', 'blip'];
    const walker = node.ownerDocument.createTreeWalker(node, NodeFilter.SHOW_ELEMENT);
    for (let child = walker.nextNode(); child; child = walker.nextNode()) {
      const tag = child.localName;
      if (!tags.includes(tag)) continue;
      const id = child.getAttributeNS(wordNS, 'id');
      if (tag === 'bookmarkStart') {
        open.set(id, child.getAttributeNS(wordNS, 'name'));
      } else if (tag === 'bookmarkEnd') {
        open.delete(id);
      } else if (tag === 'blip') {
        images.push(child.getAttributeNS(linkNS, 'embed'));
      } else if (child.namespaceURI === wordNS) {
        const bookmark = Array.from(open.values()).find(name => /^Scan(?:Body|Table|Caption)$/.test(name));
        const value = tag === 't' ? child.textContent : tag === 'tab' ? ' ' : '\n';
        if (segments.at(-1)?.bookmark === bookmark && segments.length) segments.at(-1).value += value;
        else segments.push({ value, bookmark });
      }
    }
    return { style: first(node, 'pStyle')?.getAttributeNS(wordNS, 'val'), segments, images };
  }

  async function readWord(buffer) {
    const archive = openArchive(buffer);
    const [document, rels] = await Promise.all([
      archive.xml('word/document.xml'),
      archive.has('word/_rels/document.xml.rels') ? archive.xml('word/_rels/document.xml.rels') : null,
    ]);
    const blocks = Array.from(first(document, 'body').children).flatMap(node => {
      if (node.localName === 'p') return [{ ...paragraph(node), kind: 'paragraph' }];
      if (node.localName !== 'tbl') return [];
      const rows = Array.from(node.children).filter(row => row.localName === 'tr').map(row =>
        Array.from(row.children).filter(cell => cell.localName === 'tc').map(cell =>
          Array.from(cell.children).filter(p => p.localName === 'p').map(paragraph)));
      return [{ kind: 'table', rows }];
    });
    const byBookmark = new Map();
    const pictures = new Map();
    for (const block of blocks) {
      const paragraphs = block.kind === 'paragraph' ? [block] : block.rows.flat(2);
      for (const p of paragraphs) {
        for (const { bookmark, value } of p.segments) {
          if (!bookmark) continue;
          if (byBookmark.has(bookmark)) throw new Error('Word 中有重复的样例书签。');
          byBookmark.set(bookmark, value);
        }
        for (const id of p.images) {
          const path = rels ? relatedPart(rels, id, 'word/document.xml') : '';
          const type = /\.png$/i.test(path) ? 'image/png' : /\.jpe?g$/i.test(path) ? 'image/jpeg' : '';
          if (type && !pictures.has(id)) pictures.set(id, new Blob([await archive.read(path)], { type }));
        }
      }
    }
    return { blocks, byBookmark, pictures };
  }

  async function readWorkbook(buffer, wantedName) {
    const archive = openArchive(buffer);
    const [book, rels] = await Promise.all([
      archive.xml('xl/workbook.xml'),
      archive.xml('xl/_rels/workbook.xml.rels'),
    ]);
    const sheets = elements(book, 'sheet').filter(sheet => !wantedName || sheet.getAttribute('name') === wantedName);
    if (!sheets.length) throw new Error(wantedName ? `Excel 中找不到「${wantedName}」工作表。` : 'Excel 中找不到工作表。');
    const stringRel = elements(rels, 'Relationship').find(node => node.getAttribute('Type')?.endsWith('/sharedStrings'));
    const stringPath = stringRel ? relatedPart(rels, stringRel.getAttribute('Id'), 'xl/workbook.xml') : 'xl/sharedStrings.xml';
    const strings = archive.has(stringPath) ? await archive.xml(stringPath) : null;
    const entries = strings ? elements(strings, 'si').map(item => elements(item, 't').map(t => t.textContent).join('')) : [];
    return Promise.all(sheets.map(async sheet => {
      const sheetName = sheet.getAttribute('name');
      const path = relatedPart(rels, sheet.getAttributeNS(linkNS, 'id'), 'xl/workbook.xml');
      const data = await archive.xml(path);
      const cells = new Map(elements(data, 'c').map(cell => {
        const address = cell.getAttribute('r');
        const type = cell.getAttribute('t');
        const raw = first(cell, 'v')?.textContent;
        let value = raw;
        if (type === 's') value = entries[Number(raw)];
        else if (type === 'inlineStr') value = elements(cell, 't').map(t => t.textContent).join('');
        else if ((type === null || type === 'n') && raw != null && raw.trim() !== '') value = Number(raw);
        return [address, { value, formula: first(cell, 'f')?.textContent }];
      }));
      return { sheetName, cells };
    }));
  }

  async function readExcel(buffer) {
    const [sheet] = await readWorkbook(buffer, '参数与取样');
    return sheet;
  }

  window.scanOffice = { readWord, readExcel, readWorkbook };
})();
