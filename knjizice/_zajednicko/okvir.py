"""Zajednički delovi svake strane: zaglavlje, naslov sa piktogramom, okvir sa oznakom (VEŽBA / SAD TI), okvir za roditelja, blokovi."""
from stil import *
from ikone import ikona

NASLOV = {"knjiga": ""}
def postavi_naslov(t): NASLOV["knjiga"] = t

def zaglavlje(P, sekcija=None, tacke=None):
    P.text(L, 36.6, NASLOV["knjiga"], "Andika-Bold", 7.6, SIVA_ZAGLAVLJE)
    if sekcija:
        w = P.sw(sekcija, "Andika-Bold", 7.6)
        P.text(R, 36.6, sekcija, "Andika-Bold", 7.6, SIVA_ZAGLAVLJE, "r")
        if tacke:
            x = R - w - 7 - 14.3
            for i in range(3):
                cx = x + 1.75 + i * 5.4
                if i < tacke: P.circle(cx, 36.6 - 3.0, 1.75, SIVA_ZAGLAVLJE)
                else: P.circle(cx, 36.6 - 3.0, 1.55, None, SIVA_ZAGLAVLJE, 0.5)
    P.line(L, 45.4, R, 45.4, SIVA_LINIJA, 0.6, cap=0)

def naslov(P, ikona_ime, tekst, podnaslov):
    P.rrect(L, 53.9, 42.5, 42.5, 10, None, "#000000", 1.9)
    ikona(P, ikona_ime, L + 21.25, 53.9 + 21.25)
    P.text(102, 85.2, tekst, "Comfortaa", 25, CRNA)
    if P.sw(tekst, "Comfortaa", 25) > R - 102: raise Greska("naslov predug: " + tekst)
    P.para(102, 101, R - 102, podnaslov, "Andika", 11.6, "#4D4D4D", lead=14, maxlines=2)

def oznaka(P, x, y, tekst, ikona_ime):
    """Pilula (VEŽBA / SAD TI / IGRA POKRETA) sa ikonom; gornja leva tačka (x, y) je ivica okvira na kome sedi."""
    w = P.sw(tekst, "Comfortaa", 10.4) + 26
    P.rect(x - 3, y - 11.3, w + 6 + 30, 22.6, fill="#FFFFFF")
    P.rrect(x, y - 11.3, w, 22.6, 11.3, "#FFFFFF", "#000000", 1.7)
    P.ctext(x + w / 2, y, tekst, "Comfortaa", 10.4, "#000000")
    ikona(P, ikona_ime, x + w + 14, y, 0.5)
    return w

def okvir(P, y0, y1, tekst, ikona_ime, x0=L, x1=R, boja=SIVA_OKVIR, podloga=None):
    P.rrect(x0, y0, x1 - x0, y1 - y0, 10, podloga, boja, 1.1)
    if tekst: oznaka(P, x0 + 22, y0, tekst, ikona_ime)

def roditelj(P, linije):
    """Okvir za roditelja: linija, knjiga, tekst (do 3 reda), Lisko u boji."""
    P.line(L, 737, R, 737, SIVA_LINIJA, 0.7, cap=0)
    P.brend("knjiga", L - 2.9, 743.8, w=29.6)
    ls = []
    for t in linije: ls += P.wrap(t, "Andika", 9.8, 408)
    if len(ls) > 3: raise Greska(f"okvir za roditelja ima {len(ls)} reda (max 3): {linije[0][:40]}")
    for i, t in enumerate(ls): P.text(79, 755.2 + i * 12.2, t, "Andika", 9.8, "#707070")
    P.brend("lisko_glava", 507.8, 742.2, w=38.9)

def broj_strane(P):
    P.circle(297.6, 799.65, 9.95, None, SIVA_ZAGLAVLJE, 0.7)
    P.ctext(297.6, 799.65, str(P.broj), "Andika-Bold", 8.2, SIVA_TEXT)

def unutra(P, x, y, w, h, tekst, font="Andika-Bold", size=10, boja=TEKST, pad=8, maxl=3, lead=None):
    """Tekst centriran u bloku (po širini i visini); greška ako ne staje."""
    n = P.cpara(x + w / 2, y + h / 2, w - 2 * pad, tekst, font, size, boja, lead=lead, maxlines=maxl)
    hh = (n - 1) * (lead or size * 1.3) + CAP[font] * size
    if hh > h - 2: raise Greska("tekst ne staje u blok: " + tekst)

def krug_odgovor(P, cx, cy, r=9.5):
    P.circle(cx, cy, r, "#FFFFFF", "#8C8C8C", 1.3)

def blok(P, x, y, w, h, boja=None, podloga=None, rub=None, r=9):
    t = TON.get(boja, NEUTRALNA) if boja else NEUTRALNA
    P.rrect(x, y, w, h, r, podloga or t[0], rub or t[1], 1.1)

def isprekidan(P, x, y, w, h, boja="#B8B8B8", r=8, lw=1.2):
    P.rrect(x, y, w, h, r, None, boja, lw, dash=[3.2, 3.2])

def grupa_u_bloku(P, x, y, w, h, slika, natpis=None, krug=False, vis_slike=None, natpis_size=9.5):
    """Slika + natpis + krug za odgovor kao jedna grupa centrirana u bloku (x,y,w,h)."""
    gl = []  # visine delova
    hs = vis_slike or (h * 0.55)
    nat = 14 if natpis else 0; kr = 24 if krug else 0; gap = 6
    ukupno = hs + (gap + nat if natpis else 0) + (gap + kr if krug else 0)
    y0 = y + (h - ukupno) / 2
    P.slika(slika, x + 6, y0, w - 12, hs)
    yy = y0 + hs
    if natpis:
        P.ctext(x + w / 2, yy + gap + nat / 2, natpis, "Andika", natpis_size, "#6B6B75"); yy += gap + nat
    if krug: krug_odgovor(P, x + w / 2, yy + gap + kr / 2 - 2); 
