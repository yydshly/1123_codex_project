"""Build an unbookmarked, Chinese demonstration excerpt from public data."""

import csv
from pathlib import Path
from sys import argv

from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor
from PIL import Image, ImageDraw, ImageFont


SOURCE = "https://journal.r-project.org/articles/RJ-2022-020/"
FONT = "Microsoft YaHei"
OUTPUT = Path(__file__).parent / "outputs" / "penguins"


def scatter(rows, path):
    image = Image.new("RGB", (1020, 375), "white")
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 20)

    def point(length, weight):
        return 108 + (length - 170) / 65 * 853, 298 - (weight - 2500) / 4000 * 245

    for grams in range(2500, 6501, 1000):
        _, y = point(170, grams)
        draw.line((108, y, 961, y), fill="#DEE7DF", width=2)
        draw.text((98, y), str(grams), font=font, fill="#40564D", anchor="rm")
    for length in range(170, 231, 10):
        x, _ = point(length, 2500)
        draw.line((x, 53, x, 298), fill="#DEE7DF", width=2)
        draw.text((x, 306), str(length), font=font, fill="#40564D", anchor="mt")
    colors = {"Adelie": "#A45733", "Chinstrap": "#57558E", "Gentoo": "#17725B"}
    for row in rows:
        x, y = point(int(row["flipper_length_mm"]), int(row["body_mass_g"]))
        draw.ellipse((x - 4, y - 4, x + 4, y + 4), fill=colors[row["species"]])
    draw.text((108, 10), "体重（g）", font=font, fill="#263E34")
    draw.text((870, 344), "鳍长（mm）", font=font, fill="#263E34")
    for index, (species, color) in enumerate(colors.items()):
        x = 499 + index * 140
        draw.ellipse((x, 13, x + 9, 22), fill=color)
        draw.text((x + 16, 17), species, font=font, fill="#263E34", anchor="lm")
    image.save(path)


scratch = Path(argv[1])
with (scratch / "penguins.csv").open(encoding="utf-8", newline="") as file:
    all_rows = list(csv.DictReader(file))
complete = [r for r in all_rows if r["flipper_length_mm"] != "NA" and r["body_mass_g"] != "NA"]
assert (len(all_rows), len(complete)) == (344, 342)
plot = scratch / "penguins-scatter.png"
scatter(complete, plot)

doc = Document()
doc.core_properties.title = "帕默群岛企鹅数据核对样例"
section = doc.sections[0]
section.page_width, section.page_height = Inches(8.5), Inches(11)
section.top_margin, section.bottom_margin = Inches(.78), Inches(.74)
section.left_margin = section.right_margin = Inches(1.02)
for name, size in [("Title", 23), ("Normal", 11), ("Heading 1", 14), ("Caption", 10)]:
    style = doc.styles[name]
    style.font.name = FONT
    style.font.color.rgb = RGBColor(0, 0, 0)
    style.font.size = Pt(size)
    style.font.italic = False
    style.element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), FONT)
    style.paragraph_format.line_spacing = 1.14
    style.paragraph_format.space_after = Pt(5)
props = doc.styles["Title"].element.get_or_add_pPr()
for border in props.findall(qn("w:pBdr")):
    props.remove(border)
doc.styles["Heading 1"].paragraph_format.space_before = Pt(9)
doc.styles["Caption"].paragraph_format.space_before = Pt(4)

doc.add_paragraph("帕默群岛企鹅数据核对样例", "Title")
doc.add_paragraph("根据 Horst、Hill 与 Gorman 发表于 The R Journal 的论文和公开数据重建。")
doc.add_heading("数据与样本", 1)
doc.add_paragraph(f"penguins 数据集的全部观测共 {len(all_rows)} 条。原论文正文和表 1 均报告了这一数据规模。")
table_caption = doc.add_paragraph("表 1 企鹅数据的样本量", "Caption")
table_caption.paragraph_format.keep_with_next = True
table = doc.add_table(rows=2, cols=2)
table.style = "Table Grid"
for row, items in zip(table.rows, [["统计范围", "样本量（只）"], ["全部观测", str(len(all_rows))]]):
    for cell, item in zip(row.cells, items):
        cell.text = item
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(5)
        p.paragraph_format.space_after = Pt(5)
        if item in ("统计范围", "样本量（只）"):
            p.runs[0].bold = True
            shading = OxmlElement("w:shd")
            shading.set(qn("w:fill"), "E8EFEB")
            cell._tc.get_or_add_tcPr().append(shading)
borders = OxmlElement("w:tblBorders")
for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
    border = OxmlElement(f"w:{edge}")
    for attr, val in [("val", "single"), ("sz", "5"), ("color", "D9D9D9")]:
        border.set(qn(f"w:{attr}"), val)
    borders.append(border)
table._tbl.tblPr.append(borders)
doc.add_heading("体重与鳍长", 1)
par = doc.add_paragraph()
par.paragraph_format.keep_with_next = True
par.add_run().add_picture(str(plot), width=Inches(6.18))
doc.add_paragraph(f"图 1 体重与鳍长的散点图。两项测量均有效的样本量为 {len(complete)} 只。", "Caption")
doc.add_heading("演示附注", 1)
doc.add_paragraph("样本量为 344 只。")
doc.add_paragraph("附注用于测试缺少统计范围时的处理。图据公开数据重绘，图注样本量由数据复算。")
doc.add_paragraph(SOURCE)

OUTPUT.mkdir(parents=True, exist_ok=True)
doc.save(OUTPUT / "企鹅论文核对样例.docx")
