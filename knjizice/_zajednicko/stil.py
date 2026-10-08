"""Zajednički stil i pomoćne funkcije rasporeda (koordinate su od GORE, u pt; A4 = 595.276 x 841.89)."""
import os, math
from PIL import Image
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, Color
import brend
_cache, _mali = {}, {}

HERE = os.path.dirname(os.path.abspath(__file__))
ILU = None                               # folder sa asetima naslova: postavi_ilustracije()
def postavi_ilustracije(put):
    global ILU; ILU = put; _cache.clear(); _mali.clear()
W, H = 595.2756, 841.8898
L, R = 42.5, 552.8                       # leva / desna margina sadržaja
CW = R - L
ZONA = 10 * 72 / 25.4                    # 10 mm bezbedna zona

pdfmetrics.registerFont(TTFont("Comfortaa", os.path.join(HERE, "fontovi", "Comfortaa-Bold.ttf")))
pdfmetrics.registerFont(TTFont("Andika", os.path.join(HERE, "fontovi", "Andika-Regular.ttf")))
pdfmetrics.registerFont(TTFont("Andika-Bold", os.path.join(HERE, "fontovi", "Andika-Bold.ttf")))
from fontTools.ttLib import TTFont as _FT
CAP = {}
for _n, _f in (("Comfortaa", "Comfortaa-Bold.ttf"), ("Andika", "Andika-Regular.ttf"), ("Andika-Bold", "Andika-Bold.ttf")):
    _t = _FT(os.path.join(HERE, "fontovi", _f)); CAP[_n] = _t["OS/2"].sCapHeight / _t["head"].unitsPerEm

# boje (paleta iz pravila + brend)
CRVENA, ZUTA, PLAVA, ZELENA, LJUBICASTA, OKER = "#E53935", "#F6C21C", "#2279DB", "#2FA356", "#7E57C2", "#C98B2E"
NARANDZASTA, KREM, TEKST, CRNA = "#E4642B", "#FFF8EC", "#2A2320", "#0F0F14"
SIVA_LINIJA, SIVA_OKVIR, SIVA_TEXT, SIVA_ZAGLAVLJE = "#DBDBDB", "#B2B2B2", "#8C8C8C", "#B8B8B8"
# svetla podloga / ivica po boji (kao u uzoru)
TON = {CRVENA: ("#FCEBEB", "#F3A6A4"), ZUTA: ("#FEF9E8", "#FBE499"), PLAVA: ("#E9F2FB", "#9CC3ef"),
       ZELENA: ("#EAF6EE", "#A1D6B3"), LJUBICASTA: ("#F0EBF9", "#C5B5E8"), OKER: ("#F8F0E2", "#E3C590")}
NEUTRALNA = ("#F6F4F1", "#D8D3CC")      # podloga koja ne odaje odgovor

def hc(c): return c if isinstance(c, Color) else HexColor(c)

class Greska(Exception): pass

class Str:
    """Jedna strana. Svi pozivi koriste y od gore."""
    def __init__(self, c, broj, zahteva=()):
        self.c, self.broj = c, broj
        self.zahteva = set(zahteva); self.nacrtano = set()
        self.slike = []                  # (ime, x, y, w, h, dpi)
        self.tekstovi = []               # za proveru bloka
    # ---- osnovno
    def Y(self, y): return H - y
    def rrect(self, x, y, w, h, r=8, fill=None, stroke=None, lw=1.0, dash=None):
        c = self.c; c.saveState()
        if fill: c.setFillColor(hc(fill))
        if stroke: c.setStrokeColor(hc(stroke)); c.setLineWidth(lw)
        if dash: c.setDash(dash)
        c.roundRect(x, self.Y(y + h), w, h, min(r, w / 2, h / 2), fill=1 if fill else 0, stroke=1 if stroke else 0)
        c.restoreState()
    def rect(self, x, y, w, h, fill=None, stroke=None, lw=1.0, dash=None): self.rrect(x, y, w, h, 0, fill, stroke, lw, dash)
    def circle(self, cx, cy, r, fill=None, stroke=None, lw=1.0, dash=None):
        c = self.c; c.saveState()
        if fill: c.setFillColor(hc(fill))
        if stroke: c.setStrokeColor(hc(stroke)); c.setLineWidth(lw)
        if dash: c.setDash(dash)
        c.circle(cx, self.Y(cy), r, fill=1 if fill else 0, stroke=1 if stroke else 0); c.restoreState()
    def line(self, x1, y1, x2, y2, color=CRNA, lw=1.0, dash=None, cap=1):
        c = self.c; c.saveState(); c.setStrokeColor(hc(color)); c.setLineWidth(lw); c.setLineCap(cap)
        if dash: c.setDash(dash)
        c.line(x1, self.Y(y1), x2, self.Y(y2)); c.restoreState()
    def path(self, pts, color=CRNA, lw=1.5, fill=None, close=False, dash=None, cap=1, join=1):
        """pts: lista ('M',x,y) / ('L',x,y) / ('C',x1,y1,x2,y2,x3,y3)"""
        c = self.c; c.saveState(); p = c.beginPath()
        for q in pts:
            if q[0] == "M": p.moveTo(q[1], self.Y(q[2]))
            elif q[0] == "L": p.lineTo(q[1], self.Y(q[2]))
            else: p.curveTo(q[1], self.Y(q[2]), q[3], self.Y(q[4]), q[5], self.Y(q[6]))
        if close: p.close()
        if fill: c.setFillColor(hc(fill))
        if color: c.setStrokeColor(hc(color)); c.setLineWidth(lw); c.setLineCap(cap); c.setLineJoin(join)
        if dash: c.setDash(dash)
        c.drawPath(p, stroke=1 if color else 0, fill=1 if fill else 0); c.restoreState()
    # ---- tekst
    def sw(self, s, font, size): return pdfmetrics.stringWidth(s, font, size)
    def text(self, x, yb, s, font="Andika", size=10, color=TEKST, align="l"):
        c = self.c; c.setFillColor(hc(color)); c.setFont(font, size)
        w = self.sw(s, font, size)
        x0 = x if align == "l" else (x - w / 2 if align == "c" else x - w)
        c.drawString(x0, self.Y(yb), s)
        self.tekstovi.append((x0, yb - size * 0.8, x0 + w, yb + size * 0.2, s))
    def ctext(self, cx, cy, s, font="Andika-Bold", size=10, color=TEKST):
        """Tekst centriran i po širini i po visini (po visini velikih slova)."""
        self.text(cx, cy + CAP[font] * size / 2, s, font, size, color, "c")
    def wrap(self, s, font, size, w):
        lines, cur = [], ""
        for word in s.split(" "):
            t = (cur + " " + word).strip()
            if self.sw(t, font, size) <= w or not cur: cur = t
            else: lines.append(cur); cur = word
        if cur: lines.append(cur)
        return lines
    def para(self, x, y, w, s, font="Andika", size=10, color=TEKST, lead=None, align="l", maxlines=None):
        """Piše pasus počev od vrha y; vraća y ispod poslednjeg reda. Greška ako prelazi maxlines."""
        lead = lead or size * 1.3; lines = self.wrap(s, font, size, w)
        if maxlines and len(lines) > maxlines: raise Greska(f"pasus ima {len(lines)} redova (max {maxlines}): {s[:40]}")
        for i, ln in enumerate(lines):
            yb = y + size * 0.95 + i * lead
            self.text(x if align == "l" else x + w / 2, yb, ln, font, size, color, align)
        return y + len(lines) * lead
    def cpara(self, cx, cy, w, s, font="Andika", size=10, color=TEKST, lead=None, maxlines=None):
        """Pasus centriran u tački (cx, cy) i po širini i po visini."""
        lead = lead or size * 1.3; lines = self.wrap(s, font, size, w)
        if maxlines and len(lines) > maxlines: raise Greska(f"pasus ima {len(lines)} redova: {s[:40]}")
        h = (len(lines) - 1) * lead + CAP[font] * size
        y0 = cy - h / 2 + CAP[font] * size
        for i, ln in enumerate(lines): self.text(cx, y0 + i * lead, ln, font, size, color, "c")
        return len(lines)
    # ---- slike
    def slika(self, ime, x, y, w, h, pad=0, dno=False):
        """Stavlja sliku u okvir (x,y,w,h) bez ikakvog sečenja, centriranu; vraća (x,y,w,h) stvarnog položaja.
        dno=True: poravna uz donju ivicu okvira (za grupu slika različitih visina)."""
        im = _slika(ime); iw, ih = im.size
        bw, bh = w - 2 * pad, h - 2 * pad
        s = min(bw / iw, bh / ih); dw, dh = iw * s, ih * s
        dx = x + (w - dw) / 2; dy = y + (h - dh) if dno else y + (h - dh) / 2
        if dx < x - 0.01 or dy < y - 0.01 or dx + dw > x + w + 0.01 or dy + dh > y + h + 0.01: raise Greska("slika izlazi iz okvira: " + ime)
        dpi = iw / (dw / 72)
        c = _smanji(ime, dw)                      # raster ne raste preko 150 dpi
        self.c.drawImage(c, dx, self.Y(dy + dh), dw, dh, mask="auto")
        self.slike.append((ime, dx, dy, dw, dh, min(dpi, 150))); self.nacrtano.add("slika:" + ime)
        return dx, dy, dw, dh
    def slika_vis(self, ime, cx, y, h):
        """Slika zadate visine, centrirana po x oko cx, gornja ivica y; vraća širinu."""
        iw, ih = _slika(ime).size; w = iw * h / ih
        self.slika(ime, cx - w / 2, y, w, h); return w
    # ---- brend / ikone
    def brend(self, ime, x, y, w=None, h=None, boja=None, deb=None):
        bw, bh = brend.dimenzije(ime); hh = bh * (w / bw) if w else h
        brend.crtaj(self.c, ime, x, self.Y(y + hh), sirina=w, visina=h, boja=hc(boja) if boja else None, debljina=deb)
        self.nacrtano.add("brend:" + ime)
    def proveri(self):
        nema = self.zahteva - self.nacrtano
        if nema: raise Greska(f"strana {self.broj}: nije nacrtano {sorted(nema)}")

def _slika(ime):
    if ime not in _cache:
        im = Image.open(os.path.join(ILU, ime + ".png"))
        _cache[ime] = im if im.mode == "L" else im.convert("RGBA")          # linijski crtež ostaje crno-beli, na belom
    return _cache[ime]
def _smanji(ime, w_pt):
    from reportlab.lib.utils import ImageReader
    im = _slika(ime); need = int(math.floor(w_pt / 72 * 150))
    if im.size[0] <= need: key = (ime, im.size[0])
    else: key = (ime, need)
    if key not in _mali:
        _mali[key] = ImageReader(im if im.size[0] <= need else im.resize((need, max(1, round(im.size[1] * need / im.size[0]))), Image.LANCZOS))
    return _mali[key]
