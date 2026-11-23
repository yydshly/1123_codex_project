"""Create the original Word report, including the three values to audit."""

from pathlib import Path
from sys import argv

from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor
from PIL import Image, ImageDraw, ImageFont


OUTPUT = Path(__file__).parent / "outputs" / "scan-proofing"
FONT = "Microsoft YaHei"
WINDOWS_FONTS = Path("C:/Windows/Fonts")
TITLE = "角色扫描验证报告"


def chart(path):
    image = Image.new("RGB", (1110, 430), "#FFFFFF")
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype(str(WINDOWS_FONTS / "msyh.ttc"), 23)
    left, right, top, bottom = 108, 1050, 51, 341

    def point(t, progress):
        return (left + (right - left) * t, bottom - (bottom - top) * progress)

    for index in range(5):
        fraction = index / 4
        x, y = point(fraction, fraction)
        draw.line((left, y, right, y), fill="#DBE5DF", width=2)
        draw.line((x, top, x, bottom), fill="#DBE5DF", width=2)
        draw.text((left - 12, y), f"{fraction:.0%}", fill="#40564D", font=font, anchor="rm")
        draw.text((x, bottom + 17), f"{fraction:g}", fill="#40564D", font=font, anchor="mt")
    draw.line((left, top, left, bottom, right, bottom), fill="#698177", width=2)
    steps = [value / 240 for value in range(241)]
    draw.line([point(t, t * t * (3 - 2 * t)) for t in steps], fill="#087960", width=6)
    draw.text((left, 4), "扫描路程比例 F(t)", fill="#263E34", font=font, anchor="lt")
    draw.text((right, 405), "归一化时间 t", fill="#263E34", font=font, anchor="rt")
    image.save(path)


def bookmarked_value(paragraph, name, identifier, value):
    start = OxmlElement("w:bookmarkStart")
    start.set(qn("w:id"), str(identifier))
    start.set(qn("w:name"), name)
    paragraph._p.append(start)
    paragraph.add_run(value)
    end = OxmlElement("w:bookmarkEnd")
    end.set(qn("w:id"), str(identifier))
    paragraph._p.append(end)


def set_styles(document):
    for name, size, bold in [
        ("Normal", 11, False), ("Title", 24, True), ("Heading 1", 14, True),
        ("Caption", 10, False), ("Subtitle", 10, False),
    ]:
        style = document.styles[name]
        style.font.name = FONT
        style.font.size = Pt(size)
        style.font.bold = bold
        style.font.italic = False
        style.font.color.rgb = RGBColor(0, 0, 0) if name != "Caption" else RGBColor(55, 69, 64)
        style.element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), FONT)
        style.paragraph_format.line_spacing = 1.22
        style.paragraph_format.space_after = Pt(7)
    title_props = document.styles["Title"].element.get_or_add_pPr()
    for border in title_props.findall(qn("w:pBdr")):
        title_props.remove(border)
    document.styles["Heading 1"].paragraph_format.space_before = Pt(11)
    document.styles["Caption"].paragraph_format.space_before = Pt(5)


def result_table(document, value):
    table = document.add_table(rows=3, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    table.autofit = False
    widths = (Inches(2.8), Inches(3.6))
    for column, width in zip(table.columns, widths):
        column.width = width
    props = table._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        border = OxmlElement(f"w:{edge}")
        for name, attr in [("val", "single"), ("sz", "6"), ("color", "D9D9D9")]:
            border.set(qn(f"w:{name}"), attr)
        borders.append(border)
    props.append(borders)
    for row_index, fields in enumerate([("取样时刻（秒）", "已走路程比例"), ("0.00", "0.000%"), ("0.27", value)]):
        for column_index, (cell, field) in enumerate(zip(table.rows[row_index].cells, fields)):
            cell.width = widths[column_index]
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            paragraph = cell.paragraphs[0]
            paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
            paragraph.paragraph_format.space_before = Pt(4)
            paragraph.paragraph_format.space_after = Pt(4)
            if row_index == 2 and column_index == 1:
                bookmarked_value(paragraph, "ScanTable", 2, field)
            else:
                paragraph.add_run(field).bold = row_index == 0
            if row_index == 0:
                shading = OxmlElement("w:shd")
                shading.set(qn("w:fill"), "E8EFEB")
                cell._tc.get_or_add_tcPr().append(shading)


def build_report(scratch):
    image_path = scratch / "scan-curve.png"
    chart(image_path)
    document = Document()
    document.core_properties.title = TITLE
    document.core_properties.subject = "深潜档案中的平滑扫描曲线"
    section = document.sections[0]
    section.page_width, section.page_height = Inches(8.5), Inches(11)
    section.top_margin, section.bottom_margin = Inches(0.82), Inches(0.78)
    section.left_margin = section.right_margin = Inches(1.05)
    set_styles(document)

    t = 0.27 / 1.08
    original_value = f"{t * t * (3 - 2 * t):.3%}"
    document.add_paragraph(TITLE, "Title")
    document.add_paragraph("本报告记录深潜档案中 Vesper 切换至 Brine 的扫描线进度，取样时刻为 0.27 秒。")
    document.add_heading("取样结果", level=1)
    paragraph = document.add_paragraph("从切换开始计时，第 0.27 秒时，扫描线已走过全程的 ")
    bookmarked_value(paragraph, "ScanBody", 1, original_value)
    paragraph.add_run("。")
    label = document.add_paragraph("表 1  扫描进度取样", "Caption")
    label.paragraph_format.keep_with_next = True
    result_table(document, original_value)

    document.add_heading("曲线与计算方法", level=1)
    document.add_paragraph("用已过秒数 τ 除以总时长 T，得到归一化时间 t，上限为 1。扫描线在该时刻走过的路程比例由 F(t) = t²(3 − 2t) 计算。")
    plot = document.add_paragraph()
    plot.paragraph_format.keep_with_next = True
    plot.add_run().add_picture(str(image_path), width=Inches(6.24))
    caption = document.add_paragraph("图 1  归一化扫描曲线。第 0.27 秒对应的扫描路程为 ", "Caption")
    bookmarked_value(caption, "ScanCaption", 3, original_value)
    caption.add_run("。")
    document.add_paragraph("实现来源为深潜档案的 src/app.js 和 src/mesh-scan.js。")

    OUTPUT.mkdir(parents=True, exist_ok=True)
    document.save(OUTPUT / "角色扫描验证报告.docx")


if __name__ == "__main__":
    scratch_path = Path(argv[1])
    scratch_path.mkdir(parents=True, exist_ok=True)
    build_report(scratch_path)
