"""Blokovi za zadatke: ponuđeni odgovori, kartice, nizovi, mreže. Sve centrirano u svom bloku."""
from stil import *
from okvir import *
from ikone import ikona

def pocetak(P, sekcija, tacke, ik, naslov_t, podnaslov, zahteva=()):
    zaglavlje(P, sekcija, tacke); naslov(P, ik, naslov_t, podnaslov)

def kraj(P, linije):
    roditelj(P, linije); broj_strane(P)

def ponuda_reci(P, x, y, w, h, tekstovi, size=12, font="Andika-Bold", gap=14):
    """Red blokova sa rečju/brojem i krugom za odgovor (grupa tekst+krug centrirana u bloku)."""
    n = len(tekstovi); bw = (w - gap * (n - 1)) / n; xs = []
    for i, t in enumerate(tekstovi):
        bx = x + i * (bw + gap); blok(P, bx, y, bw, h)
        tw = P.sw(t, font, size); gr = tw + 14 + 19; gx = bx + (bw - gr) / 2
        P.text(gx, y + h / 2 + CAP[font] * size / 2, t, font, size, TEKST)
        krug_odgovor(P, gx + tw + 14 + 9.5, y + h / 2); xs.append(bx)
    return xs, bw

def ponuda_brojeva(P, x, y, w, h, brojevi):
    return ponuda_reci(P, x, y, w, h, [str(b) for b in brojevi], size=26, font="Comfortaa", gap=16)

def kartica(P, x, y, w, h, ime, natpis=None, odg=None, vis=None, dno=False):
    """Blok sa slikom (stalna visina `vis`), natpisom i krugom/krugovima za odgovor; sve centrirano kao grupa.
    odg: None | 1 (jedan krug) | lista imena piktograma (dva kruga sa piktogramima)."""
    blok(P, x, y, w, h)
    vis = vis or h * 0.5
    nat = 13 if natpis else 0
    kr = 0 if not odg else 26
    ukupno = vis + (7 + nat if natpis else 0) + (8 + kr if odg else 0)
    y0 = y + (h - ukupno) / 2
    P.slika(ime, x + 8, y0, w - 16, vis, dno=dno)
    yy = y0 + vis
    if natpis: P.ctext(x + w / 2, yy + 7 + nat / 2, natpis, "Andika", 9.8, "#6B6B75"); yy += 7 + nat
    if odg:
        cy = yy + 8 + kr / 2
        if odg == 1: krug_odgovor(P, x + w / 2, cy)
        else:
            for k, pik in enumerate(odg):
                cx = x + w / 2 + (k - (len(odg) - 1) / 2) * 38
                P.circle(cx, cy, 13.5, "#FFFFFF", "#8C8C8C", 1.3); ikona(P, pik, cx, cy, 0.72, "#4D4D4D")

def celija(P, x, y, s, ime=None, vis=None, prazna=False, upit=False, ton=None):
    if prazna:
        P.rrect(x, y, s, s, 7, "#FFFFFF", "#8C8C8C", 1.2, dash=[3, 3])
        if upit: P.ctext(x + s / 2, y + s / 2, "?", "Comfortaa", s * 0.4, "#8C8C8C")
    else:
        blok(P, x, y, s, s, r=7)
        if ime: P.slika(ime, x + 5, y + 5, s - 10, s - 10)

def tackasta(P, x, y, w, h, tekst=None, size=9.6):
    isprekidan(P, x, y, w, h)
    if tekst: P.ctext(x + w / 2, y + 15, tekst, "Andika-Bold", size, SIVA_TEXT)

def bedz(P, cx, cy, n, boja=CRNA, r=9.5):
    P.circle(cx, cy, r, boja); P.ctext(cx, cy, str(n), "Comfortaa", 10.4, "#FFFFFF")
