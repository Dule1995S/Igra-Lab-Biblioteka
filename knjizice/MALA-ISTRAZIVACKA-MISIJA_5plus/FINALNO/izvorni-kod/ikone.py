"""Piktogrami uz naslove. Uzorni (p_*) dolaze iz brenda; ostali se crtaju kodom istim stilom (linija 1.5, crno, zaobljeno)."""
from stil import *

def _deb(s): return 1.5 * s

def ranac(P, cx, cy, s, b):
    d = _deb(s)
    P.path([("M", cx - 6 * s, cy - 7 * s), ("C", cx - 6 * s, cy - 12 * s, cx + 6 * s, cy - 12 * s, cx + 6 * s, cy - 7 * s)], b, d)          # rucka
    P.rrect(cx - 9 * s, cy - 8 * s, 18 * s, 19 * s, 6 * s, None, b, d)
    P.rrect(cx - 5.5 * s, cy + 1 * s, 11 * s, 7 * s, 2 * s, None, b, d)
    P.line(cx - 9 * s, cy - 1 * s, cx + 9 * s, cy - 1 * s, b, d)

def grupe(P, cx, cy, s, b):
    d = _deb(s)
    P.rrect(cx - 12 * s, cy - 8 * s, 10 * s, 16 * s, 3 * s, None, b, d); P.rrect(cx + 2 * s, cy - 8 * s, 10 * s, 16 * s, 3 * s, None, b, d)
    P.circle(cx - 7 * s, cy, 2.2 * s, None, b, d)
    P.rect(cx + 4.6 * s, cy - 2.4 * s, 4.8 * s, 4.8 * s, None, b, d)

def brojevi(P, cx, cy, s, b):
    P.ctext(cx, cy, "123", "Comfortaa", 11.5 * s, b)

def spoji(P, cx, cy, s, b):             # plus u krugu
    d = _deb(s); P.circle(cx, cy, 10 * s, None, b, d)
    P.line(cx - 5 * s, cy, cx + 5 * s, cy, b, d); P.line(cx, cy - 5 * s, cx, cy + 5 * s, b, d)

def oduzmi(P, cx, cy, s, b):            # minus u krugu
    d = _deb(s); P.circle(cx, cy, 10 * s, None, b, d); P.line(cx - 5 * s, cy, cx + 5 * s, cy, b, d)

def put(P, cx, cy, s, b):
    d = _deb(s)
    P.circle(cx - 8 * s, cy + 8 * s, 3 * s, None, b, d)
    P.path([("M", cx - 8 * s, cy + 5 * s), ("L", cx - 8 * s, cy - 7 * s), ("L", cx + 6 * s, cy - 7 * s)], b, d)
    P.path([("M", cx + 2 * s, cy - 12 * s), ("L", cx + 8 * s, cy - 7 * s), ("L", cx + 2 * s, cy - 2 * s)], b, d)
    P.rrect(cx - 1.5 * s, cy + 1 * s, 9 * s, 9 * s, 2 * s, None, b, d)

def plan(P, cx, cy, s, b):
    d = _deb(s)
    P.path([("M", cx - 11 * s, cy + 6 * s), ("L", cx + 1 * s, cy + 6 * s), ("L", cx + 1 * s, cy - 8 * s)], b, d)
    P.path([("M", cx - 3 * s, cy - 4 * s), ("L", cx + 1 * s, cy - 9 * s), ("L", cx + 5 * s, cy - 4 * s)], b, d)
    P.path([("M", cx - 3 * s, cy + 2 * s), ("L", cx + 2 * s, cy + 6 * s), ("L", cx - 3 * s, cy + 10 * s)], b, d)

def kopija(P, cx, cy, s, b):
    d = _deb(s)
    P.rrect(cx - 11 * s, cy - 9 * s, 12 * s, 12 * s, 2.5 * s, None, b, d); P.rrect(cx - 1 * s, cy - 3 * s, 12 * s, 12 * s, 2.5 * s, None, b, d)

def kocka(P, cx, cy, s, b):
    d = _deb(s); a = 10 * s
    P.path([("M", cx, cy - a), ("L", cx + a * 0.87, cy - a * 0.5), ("L", cx + a * 0.87, cy + a * 0.5), ("L", cx, cy + a), ("L", cx - a * 0.87, cy + a * 0.5), ("L", cx - a * 0.87, cy - a * 0.5)], b, d, close=True)
    P.path([("M", cx - a * 0.87, cy - a * 0.5), ("L", cx, cy), ("L", cx + a * 0.87, cy - a * 0.5)], b, d)
    P.line(cx, cy, cx, cy + a, b, d)

def prica(P, cx, cy, s, b):
    d = _deb(s)
    P.rrect(cx - 11 * s, cy - 9 * s, 22 * s, 15 * s, 5 * s, None, b, d)
    P.path([("M", cx - 4 * s, cy + 6 * s), ("L", cx - 7 * s, cy + 11 * s), ("L", cx + 1 * s, cy + 6 * s)], b, d)
    for k in (-5, 0, 5): P.circle(cx + k * s, cy - 1.5 * s, 1.1 * s, b, None)

def drvo(P, cx, cy, s, b):              # piktogram "priroda" (bez boje koja odaje odgovor)
    d = _deb(s)
    P.circle(cx, cy - 4 * s, 7 * s, None, b, d); P.line(cx, cy + 3 * s, cx, cy + 11 * s, b, d)
    P.line(cx, cy + 6 * s, cx + 4 * s, cy + 2 * s, b, d)

def cekic(P, cx, cy, s, b):             # piktogram "ljudi prave"
    d = _deb(s)
    P.rrect(cx - 8 * s, cy - 9 * s, 14 * s, 6 * s, 1.5 * s, None, b, d)
    P.line(cx - 1 * s, cy - 3 * s, cx - 1 * s, cy + 10 * s, b, d)

CUSTOM = dict(ranac=ranac, grupe=grupe, brojevi=brojevi, spoji=spoji, oduzmi=oduzmi, put=put, plan=plan, kopija=kopija,
              kocka=kocka, prica=prica, drvo=drvo, cekic=cekic)

def ikona(P, ime, cx, cy, s=1.0, boja=CRNA):
    """Crta piktogram sa centrom (cx, cy); s=1 je veličina u naslovu (oko 24 pt)."""
    if ime in CUSTOM: CUSTOM[ime](P, cx, cy, s, boja)
    else: P.brend("p_" + ime if not ime.startswith(("p_", "m_")) else ime, cx - 16 * s, cy - 17 * s, w=32 * s, boja=boja if boja != CRNA else None, deb=None)
    P.nacrtano.add("ikona:" + ime)
