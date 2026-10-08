"""Crtanje brenda iz brend.json (logo, Lisko, knjiga, piktogrami) u ReportLab canvas."""
import json, os
from reportlab.lib.colors import Color

_J = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "brend.json")))
_CAP = {0: 0, 1: 1, 2: 2}

def dimenzije(ime): return _J[ime]["w"], _J[ime]["h"]

def crtaj(c, ime, x, y, sirina=None, visina=None, boja=None, debljina=None):
    """Crta stavku tako da joj donji levi ugao bude (x, y). Zadaj sirinu ILI visinu (proporcionalno).
    boja: zameni sve boje linije (za piktograme); debljina: faktor debljine linije."""
    g = _J[ime]; w, h = g["w"], g["h"]
    s = (sirina / w) if sirina else (visina / h)
    X = lambda v: x + (v - g["x0"]) * s
    Y = lambda v: y + (h - (v - g["y0"])) * s
    stek = []
    def put(p):
        pt = c.beginPath(); cur = None
        for it in p["items"]:
            k = it[0]
            if k == "l":
                if cur != (it[1], it[2]): pt.moveTo(X(it[1]), Y(it[2]))
                pt.lineTo(X(it[3]), Y(it[4])); cur = (it[3], it[4])
            elif k == "c":
                if cur != (it[1], it[2]): pt.moveTo(X(it[1]), Y(it[2]))
                pt.curveTo(X(it[3]), Y(it[4]), X(it[5]), Y(it[6]), X(it[7]), Y(it[8])); cur = (it[7], it[8])
            elif k == "re":
                pt.rect(X(it[1]), Y(it[4]), (it[3] - it[1]) * s, (it[4] - it[2]) * s); cur = None
            elif k == "poly":
                pt.moveTo(X(it[1]), Y(it[2]))
                for i in (3, 5, 7): pt.lineTo(X(it[i]), Y(it[i + 1]))
                pt.close(); cur = None
        return pt
    c.saveState()
    for p in g["paths"]:
        lv = p.get("level", 0)
        while stek and stek[-1] >= lv: c.restoreState(); stek.pop()
        if p.get("clip"):
            c.saveState(); pt = put(p); pt.close(); c.clipPath(pt, stroke=0, fill=0, fillMode=0 if p["eo"] else 1); stek.append(lv); continue
        pt = put(p)
        if p["close"]: pt.close()
        fill, stroke = p["fill"], p["stroke"]
        if fill is not None and not (boja and stroke is not None): c.setFillColor(Color(*fill))
        if boja is not None and stroke is not None: c.setStrokeColor(boja)
        elif stroke is not None: c.setStrokeColor(Color(*stroke))
        if stroke is not None:
            c.setLineWidth(max(p["w"], 0.01) * s * (debljina or 1))
            c.setLineCap(_CAP.get(p["cap"], 0)); c.setLineJoin(p["join"] if p["join"] in (0, 1, 2) else 0)
        c.drawPath(pt, stroke=1 if stroke is not None else 0, fill=1 if fill is not None else 0, fillMode=0 if p["eo"] else 1)
    while stek: c.restoreState(); stek.pop()
    c.restoreState()
