#!/usr/bin/env python3
"""Izvlači vektorski brend (logo, Liskova glava, ikona knjige, piktogrami) iz uzora "Boje oko mene 3+" u brend.json.
Lisko se ne generiše: crta se iz ovih putanja (brend.py). Upotreba: python3 brend_izvuci.py UZOR.pdf"""
import sys, json, os
import pymupdf

R = pymupdf.Rect
# ime -> (strana 1-based, okvir u pt, isključi_belu_pozadinu)
STAVKE = {
    "logo": (1, R(217.0, 61.9, 378.0, 100.3)),
    "lisko_glava": (4, R(507.4, 741.8, 547.1, 782.3)),
    "knjiga": (4, R(39.2, 743.4, 69.6, 759.7)),
    # piktogrami u naslovu (samo unutrašnji crtež, bez okvira)
    "p_zvezda": (3, R(48, 58, 80, 92)), "p_olovka": (4, R(48, 58, 80, 92)), "p_veza": (8, R(48, 58, 80, 92)),
    "p_makaze": (9, R(48, 58, 80, 92)), "p_lupa": (10, R(48, 58, 80, 92)), "p_niz": (11, R(48, 58, 80, 92)),
    "p_kap": (12, R(48, 58, 80, 92)), "p_oko": (13, R(48, 58, 80, 92)), "p_paleta": (15, R(48, 58, 80, 92)),
    "p_osoba1": (16, R(48, 58, 80, 92)), "p_osoba2": (17, R(48, 58, 80, 92)),
    # male ikone uz oznake VEŽBA / SAD TI
    "m_sijalica": (4, R(141.5, 300.8, 165.5, 322.8)),
}

def rgb(c): return None if c is None else [round(v, 4) for v in c[:3]]

def izvuci(doc, strana, clip, pad=0.0):
    p = doc[strana - 1]; out = []
    for dr in p.get_drawings():
        r = dr["rect"]
        if not (clip.contains(r) or (r & clip).get_area() >= 0.98 * max(r.get_area(), 1e-6)): continue
        # bela pozadina (puna belina iza oznake) se preskače
        if dr.get("fill") == (1.0, 1.0, 1.0) and dr.get("color") is None and r.get_area() > 0.6 * clip.get_area(): continue
        items = []
        for it in dr["items"]:
            k = it[0]
            if k == "l": items.append(["l", it[1].x, it[1].y, it[2].x, it[2].y])
            elif k == "c": items.append(["c"] + [v for q in it[1:5] for v in (q.x, q.y)])
            elif k == "re": items.append(["re", it[1].x0, it[1].y0, it[1].x1, it[1].y1])
            elif k == "qu":
                q = it[1]; items.append(["poly", q.ul.x, q.ul.y, q.ur.x, q.ur.y, q.lr.x, q.lr.y, q.ll.x, q.ll.y])
        out.append({"items": items, "fill": rgb(dr.get("fill")), "stroke": rgb(dr.get("color")),
                    "w": dr.get("width") or 0, "close": bool(dr.get("closePath")), "eo": bool(dr.get("even_odd")),
                    "dash": dr.get("dashes"), "cap": dr.get("lineCap", [0])[0] if dr.get("lineCap") else 0,
                    "join": dr.get("lineJoin", 0), "fo": dr.get("fill_opacity", 1), "so": dr.get("stroke_opacity", 1)})
    return {"w": clip.width, "h": clip.height, "x0": clip.x0, "y0": clip.y0, "paths": out}

if __name__ == "__main__":
    doc = pymupdf.open(sys.argv[1]); res = {}
    for ime, (strana, clip) in STAVKE.items():
        res[ime] = izvuci(doc, strana, clip)
        print(f"{ime:12} strana {strana:2}  putanja {len(res[ime]['paths'])}")
        if not res[ime]["paths"]: raise SystemExit("prazno: " + ime)
    json.dump(res, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "brend.json"), "w"))
