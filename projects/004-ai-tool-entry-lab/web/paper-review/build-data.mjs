import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const [dependencies, scratch] = process.argv.slice(2);
const require = createRequire(join(dependencies, 'paper-proofing.cjs'));
const { Workbook, SpreadsheetFile } = require('@oai/artifact-tool');
const output = fileURLToPath(new URL('outputs/penguins/', import.meta.url));
const data = await readFile(join(scratch, 'penguins.csv'));
assert.equal(createHash('sha256').update(data).digest('hex'), 'f204db2c753b0937caac3cb35258562c14f073e4bbc76be24b4c51ce22767a93');
const [header, ...lines] = data.toString('utf8').trim().split(/\r?\n/);
const rows = lines.map(line => [...line.split(',').map((item, column) => {
  if (item === 'NA') return null;
  return [0, 1, 6].includes(column) ? item : Number(item);
}), 1]);
assert.equal(rows.length, 344);
assert.equal(rows.filter(row => row[4] && row[5]).length, 342);

const book = Workbook.create();
const summary = book.worksheets.add('统计汇总');
const sources = book.worksheets.add('观测');
const stats = address => summary.getRange(address);
const raw = address => sources.getRange(address);
const end = rows.length + 1;
const field = column => `'观测'!${column}2:${column}${end}`;
const include = field('I');

raw('A1:I1').values = [[...header.split(','), '纳入分析']];
raw(`A2:I${end}`).values = rows;
raw('K1').values = [['数据来源']];
raw('K2').values = [['https://github.com/allisonhorst/palmerpenguins/blob/main/inst/extdata/penguins.csv']];
raw('K3').values = [['I 列是演示加入的开关。1 为纳入，0 为排除。']];
stats('A2').values = [['企鹅样本量汇总']];
stats('A4:C9').values = [
  ['统计范围', '样本量（只）', '统计口径'],
  ['全部观测', null, '纳入分析的全部数据行。'],
  ['体重与鳍长均有效', null, '纳入分析，且体重与鳍长均有有效值。'],
  ['Adélie', null, '纳入分析的 Adélie 个体。'],
  ['Chinstrap', null, '纳入分析的 Chinstrap 个体。'],
  ['Gentoo', null, '纳入分析的 Gentoo 个体。'],
];
stats('B5:B9').formulas = [
  [`=COUNTIF(${include},1)`],
  [`=COUNTIFS(${include},1,${field('E')},">0",${field('F')},">0")`],
  ...['Adelie', 'Chinstrap', 'Gentoo'].map(species => [`=COUNTIFS(${include},1,${field('A')},"${species}")`]),
];
stats('A11').values = [['来源']];
stats('C11').values = [['https://journal.r-project.org/articles/RJ-2022-020/']];

for (const [sheet, used, band] of [[summary, 'A2:C11', 'A4:C4'], [sources, `A1:K${end}`, 'A1:I1']]) {
  sheet.showGridLines = false;
  sheet.tabColor = '#285B4B';
  sheet.getRange(used).format.font = { name: 'Microsoft YaHei', size: 11, color: '#20352D' };
  sheet.getRange(used).format.rowHeight = 23;
  sheet.getRange(used).format.verticalAlignment = 'center';
  sheet.getRange(band).format = {
    fill: '#285B4B', horizontalAlignment: 'center', verticalAlignment: 'center',
    font: { name: 'Microsoft YaHei', size: 11, bold: true, color: '#FFFFFF' },
  };
}
stats('A2').format.font = { name: 'Microsoft YaHei', size: 16, bold: true };
stats('A2').format.rowHeight = 29;
stats('A:A').format.columnWidthPx = 198;
stats('B:B').format.columnWidthPx = 126;
stats('C:C').format.columnWidthPx = 386;
stats('B5:B9').setNumberFormat('0');
raw('A:I').format.columnWidthPx = 119;
raw('C:F').format.columnWidthPx = 145;
raw('K:K').format.columnWidthPx = 665;
raw('I2').format.fill = '#FFF0BD';
sources.freezePanes.freezeRows(1);

const original = join(scratch, 'penguins-original.xlsx');
const altered = join(scratch, 'penguins-edit.xlsx');
book.recalculate();
assert.deepEqual(stats('B5:B9').values.flat(), [344, 342, 152, 68, 124]);
await (await SpreadsheetFile.exportXlsx(book)).save(original);
await copyFile(original, join(output, '企鹅公开数据.xlsx'));
for (const [sheetName, range, name] of [['统计汇总', 'A1:C11', 'summary'], ['观测', 'A1:I7', 'source']]) {
  const png = await book.render({ sheetName, range, scale: 1.25, format: 'png' });
  await writeFile(join(scratch, name + '.png'), new Uint8Array(await png.arrayBuffer()));
}
raw('I2').values = [[0]];
book.recalculate();
assert.deepEqual(stats('B5:B9').values.flat(), [343, 341, 151, 68, 124]);
console.log((await book.inspect({ kind: 'table', range: '统计汇总!A4:C9', include: 'values,formulas' })).ndjson);
const errors = await book.inspect({
  kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!',
  options: { useRegex: true, maxResults: 10 },
});
assert.match(errors.ndjson, /matched 0|0 matches|No items matched/i);
await (await SpreadsheetFile.exportXlsx(book)).save(altered);

const samples = Object.fromEntries(await Promise.all(Object.entries({
  word: join(output, '企鹅论文核对样例.docx'), original, altered,
}).map(async ([key, path]) => [key, (await readFile(path)).toString('base64')])));
await writeFile(new URL('samples.generated.js', import.meta.url), 'window.paperSamples = ' + JSON.stringify(samples) + ';\n');
