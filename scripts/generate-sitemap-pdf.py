from __future__ import annotations

from datetime import date
from html import escape
from html.parser import HTMLParser
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A3, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "index.html"
OUTPUT = ROOT / "output" / "pdf" / "mappa-completa-ai-it.pdf"


class SiteMapParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.nodes: list[dict[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag != "button":
            return
        attributes = {key: value or "" for key, value in attrs}
        if "data-map-node" not in attributes:
            return
        self.nodes.append(
            {
                "key": attributes["data-map-node"],
                "index": attributes.get("data-map-index", ""),
                "kind": attributes.get("data-map-kind", ""),
                "title": attributes.get("data-map-title", ""),
                "description": attributes.get("data-map-description", ""),
                "href": attributes.get("data-map-href", ""),
            }
        )


def read_nodes() -> dict[str, dict[str, str]]:
    parser = SiteMapParser()
    parser.feed(SOURCE.read_text(encoding="utf-8"))
    nodes = {node["key"]: node for node in parser.nodes}
    expected = {
        "home",
        "energy",
        "chip",
        "algorithms",
        "inference",
        "altro",
        "novita",
        "benchmark",
        "politica",
        "guerra",
    }
    if set(nodes) != expected:
        missing = ", ".join(sorted(expected - set(nodes))) or "nessuno"
        extra = ", ".join(sorted(set(nodes) - expected)) or "nessuno"
        raise RuntimeError(f"Mappa HTML inattesa. Mancanti: {missing}. Extra: {extra}.")
    nodes["spooky"] = {
        "key": "spooky",
        "index": "S1",
        "kind": "Esperienza narrativa nascosta",
        "title": "Spooky timeline",
        "description": "Segnali 2025-2026, timeline speculative e dodici futuri alternativi. Non compare nella navigazione pubblica e usa noindex.",
        "href": "spooky-timeline.html",
    }
    return nodes


PAPER = colors.HexColor("#F2F0E8")
PAPER_DEEP = colors.HexColor("#E9E6DC")
INK = colors.HexColor("#191915")
MUTED = colors.HexColor("#615F57")
ACID = colors.HexColor("#C7EF3A")
CORAL = colors.HexColor("#FF6B35")
VIOLET = colors.HexColor("#7B61FF")
BLUE = colors.HexColor("#6E7CFF")
LINE = colors.HexColor("#A7A49B")


ACCENTS = {
    "home": INK,
    "energy": ACID,
    "chip": VIOLET,
    "algorithms": CORAL,
    "inference": BLUE,
    "altro": INK,
    "novita": CORAL,
    "benchmark": ACID,
    "politica": VIOLET,
    "guerra": BLUE,
    "spooky": MUTED,
}


NODE_POSITIONS = {
    "spooky": (54, 635, 300, 90),
    "home": (445, 635, 300, 90),
    "energy": (50, 440, 190, 115),
    "chip": (275, 440, 190, 115),
    "algorithms": (500, 440, 190, 115),
    "inference": (725, 440, 190, 115),
    "altro": (950, 440, 190, 115),
    "novita": (300, 215, 180, 125),
    "benchmark": (520, 215, 180, 125),
    "politica": (740, 215, 180, 125),
    "guerra": (960, 215, 180, 125),
}


BODY_STYLE = ParagraphStyle(
    "node-body",
    fontName="Helvetica",
    fontSize=8.3,
    leading=10.4,
    textColor=MUTED,
    alignment=TA_LEFT,
    spaceAfter=0,
    spaceBefore=0,
)


def draw_polyline(pdf: canvas.Canvas, points: list[tuple[float, float]], dashed: bool = False) -> None:
    pdf.saveState()
    pdf.setStrokeColor(LINE)
    pdf.setLineWidth(1.2)
    pdf.setDash(5, 4) if dashed else pdf.setDash()
    path = pdf.beginPath()
    path.moveTo(*points[0])
    for point in points[1:]:
        path.lineTo(*point)
    pdf.drawPath(path, stroke=1, fill=0)
    pdf.restoreState()


def draw_node(pdf: canvas.Canvas, node: dict[str, str], hidden: bool = False) -> None:
    x, y, width, height = NODE_POSITIONS[node["key"]]
    accent = ACCENTS[node["key"]]

    pdf.saveState()
    if hidden:
        pdf.setDash(5, 4)
    pdf.setFillColor(PAPER)
    pdf.setStrokeColor(INK if not hidden else MUTED)
    pdf.setLineWidth(1.1)
    pdf.roundRect(x, y, width, height, 2, stroke=1, fill=1)
    pdf.setDash()
    pdf.setFillColor(accent)
    pdf.rect(x, y + height - 6, width, 6, stroke=0, fill=1)

    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica-Bold", 7.2)
    kind = f'{node["index"]} / {node["kind"]}'.upper()
    pdf.drawString(x + 13, y + height - 22, kind[:46])

    pdf.setFont("Helvetica", 7)
    route = node["href"]
    route_width = stringWidth(route, "Helvetica", 7)
    if route_width < width * 0.52:
        pdf.drawRightString(x + width - 13, y + height - 22, route)

    pdf.setFillColor(INK)
    title_size = 18 if width >= 190 else 16.5
    pdf.setFont("Times-Roman", title_size)
    pdf.drawString(x + 13, y + height - 47, node["title"])

    paragraph = Paragraph(escape(node["description"]), BODY_STYLE)
    paragraph_width = width - 26
    paragraph.wrap(paragraph_width, height - 62)
    paragraph.drawOn(pdf, x + 13, y + 12)
    pdf.restoreState()


def build_pdf() -> Path:
    nodes = read_nodes()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    page_width, page_height = landscape(A3)
    pdf = canvas.Canvas(str(OUTPUT), pagesize=(page_width, page_height), pageCompression=1)
    pdf.setTitle("Mappa completa di AI.it")
    pdf.setAuthor("AI.it")

    pdf.setFillColor(PAPER_DEEP)
    pdf.rect(0, 0, page_width, page_height, stroke=0, fill=1)

    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica-Bold", 8)
    generated_on = date.today().strftime("%d.%m.%Y")
    pdf.drawString(54, 802, f"ARCHITETTURA DEI CONTENUTI / {generated_on}")
    pdf.setFillColor(INK)
    pdf.setFont("Times-Roman", 31)
    pdf.drawString(54, 765, "Mappa completa di AI.it")
    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 11)
    pdf.drawString(54, 744, "10 pagine pubbliche, 1 esperienza narrativa nascosta, 2 livelli editoriali.")
    pdf.setFillColor(CORAL)
    pdf.setFont("Times-Roman", 56)
    pdf.drawRightString(page_width - 54, 758, "11")

    draw_polyline(pdf, [(354, 680), (445, 680)], dashed=True)

    home_x, home_y, home_w, _ = NODE_POSITIONS["home"]
    root_x = home_x + home_w / 2
    main_centers = []
    for key in ["energy", "chip", "algorithms", "inference", "altro"]:
        x, y, width, height = NODE_POSITIONS[key]
        main_centers.append((x + width / 2, y + height))
    for center_x, top_y in main_centers:
        draw_polyline(pdf, [(root_x, home_y), (root_x, 590), (center_x, 590), (center_x, top_y)])

    altro_x, altro_y, altro_w, _ = NODE_POSITIONS["altro"]
    altro_center = altro_x + altro_w / 2
    for key in ["novita", "benchmark", "politica", "guerra"]:
        x, y, width, height = NODE_POSITIONS[key]
        dossier_center = x + width / 2
        draw_polyline(pdf, [(altro_center, altro_y), (altro_center, 390), (dossier_center, 390), (dossier_center, y + height)])

    for key in ["spooky", "home", "energy", "chip", "algorithms", "inference", "altro", "novita", "benchmark", "politica", "guerra"]:
        draw_node(pdf, nodes[key], hidden=key == "spooky")

    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica-Bold", 7.5)
    pdf.drawString(54, 170, "LEGENDA")
    pdf.setStrokeColor(INK)
    pdf.setLineWidth(1.2)
    pdf.line(54, 151, 92, 151)
    pdf.setFont("Helvetica", 8.5)
    pdf.drawString(101, 148, "Percorso pubblico e navigabile")
    pdf.setDash(5, 4)
    pdf.setStrokeColor(MUTED)
    pdf.line(276, 151, 314, 151)
    pdf.setDash()
    pdf.drawString(323, 148, "Esperienza intenzionalmente nascosta")
    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 8.5)
    pdf.drawString(54, 123, "La mappa della Home mostra soltanto le 10 pagine pubbliche, così il gesto di sblocco della Spooky timeline resta una sorpresa narrativa.")

    pdf.setStrokeColor(LINE)
    pdf.setLineWidth(0.8)
    pdf.line(54, 76, page_width - 54, 76)
    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 7.5)
    pdf.drawString(54, 57, "Fonte: struttura locale dei file HTML e mappa interattiva della Home.")
    pdf.drawRightString(page_width - 54, 57, "AI.it - imparare in pubblico")

    pdf.showPage()
    pdf.save()
    return OUTPUT


if __name__ == "__main__":
    print(build_pdf())
