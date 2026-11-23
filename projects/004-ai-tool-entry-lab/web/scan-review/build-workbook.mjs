import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const [dependencyDirectory, scratch] = process.argv.slice(2);
const require = createRequire(join(dependencyDirectory, 'scan-proofing.cjs'));
const { Workbook, SpreadsheetFile } = require('@oai/artifact-tool');
const output = fileURLToPath(new URL('outputs/scan-proofing/', import.meta.url));
const filename = '角色扫描参数表.xlsx';
const workbook = Workbook.create();
const sheet = workbook.worksheets.add('参数与取样');
const range = address => sheet.getRange(address);
sheet.showGridLines = false;
sheet.tabColor = '#22594F';

range('A2').values = [['角色扫描参数表']];
range('A4:D10').values = [
  ['参数与结果', '数值', '单位', '说明'],
  ['扫描总时长 T', 1.08, 's', '可编辑 B5，保存后重新导入进行校对。'],
  ['取样时刻 τ', 0.27, 's', '从切换开始计时。'],
  ['项目基准总时长', 1.08, 's', '深潜档案 character-atlas/src/app.js'],
  [null, null, null, null],
  ['时间进度 t', null, '比例', '已过时间除以总时长，上限为 1。'],
  ['扫描路程 F(t)', null, '比例', 't²(3−2t)，对应 mesh-scan.js 中的 eased。'],
];
range('B9:B10').formulas = [
  ['=IF(AND(COUNT(B5:B6)=2,B5>0,B6>=0),MIN(B6/B5,1),NA())'],
  ['=B9^2*(3-2*B9)'],
];

range('A2:D10').format.font = { name: 'Microsoft YaHei', size: 11, color: '#1E2F2C' };
range('A2:D10').format.verticalAlignment = 'center';
range('A4:D10').format.rowHeight = 23;
range('A2').format.rowHeight = 29;
range('A2').format.font = { name: 'Microsoft YaHei', size: 16, bold: true, color: '#1E2F2C' };
range('A:A').format.columnWidthPx = 200;
range('B:B').format.columnWidthPx = 105;
range('C:C').format.columnWidthPx = 82;
range('D:D').format.columnWidthPx = 370;
range('A4:D4').format = {
  fill: '#22594F', horizontalAlignment: 'center', verticalAlignment: 'center',
  font: { name: 'Microsoft YaHei', size: 11, color: '#FFFFFF', bold: true },
  borders: { insideVertical: { style: 'thin', color: '#FFFFFF' } },
};
range('A7:D7').format.borders = { bottom: { style: 'thin', color: '#D9E3DD' } };
range('A10:D10').format.borders = { top: { style: 'thin', color: '#C6D8CE' }, bottom: { style: 'thin', color: '#C6D8CE' } };
range('A10:D10').format.fill = '#E8F2EB';
range('A10:B10').format.font.bold = true;
range('B5').format.fill = '#FFF0BD';
range('B5').format.font.bold = true;
range('B5:B10').format.horizontalAlignment = 'right';
range('C5:C10').format.horizontalAlignment = 'center';
range('B5:B9').setNumberFormat('0.00');
range('B10').setNumberFormat('0.000%');

await mkdir(output, { recursive: true });
await mkdir(scratch, { recursive: true });
workbook.recalculate();
assert.equal(range('B9').values[0][0], 0.25);
assert.equal(range('B10').values[0][0], 0.15625);
const baseline = await SpreadsheetFile.exportXlsx(workbook);
await baseline.save(join(scratch, filename));

range('B5').values = [[0.90]];
workbook.recalculate();
assert.equal(range('B9').values[0][0], 0.30);
assert.ok(Math.abs(range('B10').values[0][0] - 0.216) < 1e-12);
const review = await workbook.inspect({
  kind: 'table', range: '参数与取样!A4:D10', include: 'values,formulas', tableMaxRows: 8, tableMaxCols: 4,
});
console.log(review.ndjson);
const errors = await workbook.inspect({
  kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!',
  options: { useRegex: true, maxResults: 10 },
});
assert.match(errors.ndjson, /matched 0|0 matches|No items matched/i);
const preview = await workbook.render({ sheetName: sheet.name, range: 'A1:D11', scale: 1.5, format: 'png' });
await writeFile(join(scratch, 'worksheet.png'), new Uint8Array(await preview.arrayBuffer()));
const revised = await SpreadsheetFile.exportXlsx(workbook);
const revisedPath = join(scratch, 'updated-scan.xlsx');
await revised.save(revisedPath);
await copyFile(revisedPath, join(output, filename));
const samples = Object.fromEntries(await Promise.all(Object.entries({
  word: join(output, '角色扫描验证报告.docx'),
  baseline: join(scratch, filename),
  revised: revisedPath,
}).map(async ([key, path]) => [key, (await readFile(path)).toString('base64')])));
await writeFile(new URL('samples.generated.js', import.meta.url), 'window.scanSamples = ' + JSON.stringify(samples) + ';\n');
