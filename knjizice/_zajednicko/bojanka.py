"""Generator bojanke po uzoru na "Boje oko mene 3+": naslovna, za roditelja, tabla, 14 strana za bojenje, nalepnice, diploma, klub.
Podaci knjige dolaze iz knjiga.py (rečnik K). Koordinate su od GORE."""
import os, json, math
import brend
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from stil import *
import stil
import okvir as okvir_mod
from okvir import *
from blokovi import blok, isprekidan, bedz, tackasta
from ikone import ikona

D_PECAT = 58.0
R_IN = D_PECAT / 2 + 2.3                     # unutrašnji krug table: pečat (sa ivicom) staje tačno u njega
BOJE_CELINA = [CRVENA, ZUTA, PLAVA, ZELENA]

def zvezda(P, cx, cy, r, boja, ri=None):
    ri = ri or r * 0.42; pts = []
    for i in range(10):
        a = math.radians(-90 + i * 36); rr = r if i % 2 == 0 else ri
        pts.append(("M" if i == 0 else "L", cx + rr * math.cos(a), cy + rr * math.sin(a)))
    P.path(pts, "#2A2320", 1.4, fill=boja, close=True)

def srce(P, cx, cy, r, boja):
    P.path([("M", cx, cy + r * 0.9), ("C", cx - r * 1.5, cy - r * 0.1, cx - r * 0.8, cy - r * 1.25, cx, cy - r * 0.45),
            ("C", cx + r * 0.8, cy - r * 1.25, cx + r * 1.5, cy - r * 0.1, cx, cy + r * 0.9)], "#2A2320", 1.4, fill=boja, close=True)

def krug_za_pecat(P, cx, cy):
    P.circle(cx, cy, R_IN + 6, "#FFFFFF", "#2A2320", 1.6)
    P.circle(cx, cy, R_IN, None, "#B8B8B8", 0.9, dash=[1.6, 1.8])

def lisko(P, poza, cx, dno, h):
    bw, bh = brend.dimenzije(poza); w = bw * h / bh
    P.brend(poza, cx - w / 2, dno - h, h=h)
    return w

def kompozicija(P, elementi, okv):
    """Slike i Lisko u okviru (x, y, w, h); greška ako nešto izlazi iz okvira ili se dve slike preklapaju više od 12%."""
    fx, fy, fw, fh = okv; kutije = []
    for ime, cx, dno, h in elementi:
        if ime.startswith("lisko_"): w = lisko(P, ime, cx, dno, h)
        else: w = P.slika_vis(ime, cx, dno - h, h)
        b = (cx - w / 2, dno - h, cx + w / 2, dno)
        if b[0] < fx - 0.5 or b[1] < fy - 0.5 or b[2] > fx + fw + 0.5 or b[3] > fy + fh + 0.5: raise Greska(f"{ime} izlazi iz okvira")
        for k in kutije:
            ov = max(0, min(b[2], k[2]) - max(b[0], k[0]))
            if ov > 0.12 * min(b[2] - b[0], k[2] - k[0]): raise Greska(f"{ime} se previše preklapa sa susednom slikom")
        kutije.append(b)

# ------------------------------------------------------------------ 1
def naslovna(P, K):
    P.rect(0, 0, W, H, fill=KREM)
    P.rrect(34, 34, W - 68, H - 68, 22, "#FFFFFF", NARANDZASTA, 2.2)
    P.brend("logo", (W - 160.5) / 2, 62.2, w=160.5)
    P.ctext(W / 2, 140, K["naslov1"], "Comfortaa", 31, TEKST)
    if P.sw(K["naslov1"], "Comfortaa", 31) > 440: raise Greska("naslov1 predug")
    sl = K["naslov2"]; boje = [CRVENA, ZUTA, PLAVA, ZELENA, LJUBICASTA, OKER]
    size = 62
    while sum(P.sw(s, "Comfortaa", size) for s in sl) + 4 * (len(sl) - 1) > 430: size -= 1
    ws = [P.sw(s, "Comfortaa", size) for s in sl]; x = (W - (sum(ws) + 4 * (len(ws) - 1))) / 2; bi = 0
    for s, w in zip(sl, ws):
        if s != " ": P.text(x, 160 + size * 0.92, s, "Comfortaa", size, boje[bi % 6]); bi += 1
        x += w + 4
    P.ctext(W / 2, 258, K["podnaslov1"], "Andika", 13, "#4D4D4D")
    P.ctext(W / 2, 277, K["podnaslov2"], "Andika", 13, "#4D4D4D")
    fx, fy, fw, fh = 76.5, 320.3, 442.2, 283.5
    P.rrect(fx, fy, fw, fh, 14, KREM, "#F3B9A0", 1.3)
    kompozicija(P, [(ime, fx + fw * cxf, fy + fh * dnof, h) for ime, cxf, dnof, h in K["naslovna_slike"]], (fx, fy, fw, fh))
    for i, t in enumerate(K["tacke"]):
        P.circle(106, 630 + i * 20 - 4, 2.6, NARANDZASTA); P.text(118, 630 + i * 20, t, "Andika", 11.4, "#4D4D4D")
    P.rrect(76.5, 734.2, 442.2, 39.7, 19.85, None, NARANDZASTA, 1.2)
    P.ctext(76.5 + 56, 734.2 + 19.85, "Ова књижица је од:", "Andika", 11, "#4D4D4D")
    P.line(76.5 + 118, 760, 76.5 + 442.2 - 22, 760, "#B8B8B8", 0.8, dash=[1.2, 2.6])

# ------------------------------------------------------------------ 2
def za_roditelja(P, K):
    zaglavlje(P)
    P.text(L, 87.5, "ЗА РОДИТЕЉА", "Comfortaa", 25, CRNA)
    y = 120
    for t in K["pismo"]: y = P.para(L, y, CW, t, "Andika", 11.6, "#404040", lead=15.3) + 7.5
    if y > 362: raise Greska("pismo roditelju je predugačko")
    visak = 781 - (y + 118 + 124.7 + 127.5 + 14 + 22 + 16); dod = max(0, visak) / 3
    y0 = y + 14 + dod
    kor = [("ПОНУДИТЕ БОЈИЦЕ", "Прочитајте наслов и кратку поруку на страни.", CRVENA),
           ("САЧЕКАЈТЕ", "Дете само бира боје и место где почиње.", ZUTA),
           ("ПРИХВАТИТЕ", "Необичне боје и идеје су добродошле.", PLAVA),
           ("ПРАТИТЕ РИТАМ", "Једна страна дневно, пауза је увек у реду.", ZELENA)]
    cw, gap = 119.1, 11.3; h = 118
    for i, (h1, t, b) in enumerate(kor):
        x = L + i * (cw + gap); bg, rub = TON[b]
        P.rrect(x, y0, cw, h, 9, bg, rub, 1.1)
        P.circle(x + 20, y0 + 22, 9, b); P.ctext(x + 20, y0 + 22, str(i + 1), "Comfortaa", 10.5, "#FFFFFF")
        P.text(x + 12, y0 + 52, h1, "Andika-Bold", 9.4, CRNA)
        P.para(x + 12, y0 + 61, cw - 22, t, "Andika", 9.8, "#575757", lead=12.3, maxlines=4)
    # проба штампе
    y1 = y0 + h + 22 + dod; P.rrect(L, y1, CW, 124.7, 10, None, SIVA_ZAGLAVLJE, 1.1)
    P.text(L + 22, y1 + 28, "ПРОБА ШТАМПЕ", "Comfortaa", 11, CRNA)
    P.para(L + 22, y1 + 40, 196, "Одштампајте прво ову страну. Линије треба да буду јасне и црне, а боје живе. Ако су бледе, проверите подешавање штампача.", "Andika", 9.8, "#666666", lead=12.3, maxlines=5)
    sw = 36; x0 = R - 22 - 6 * sw - 5 * 6
    for i, (b, n) in enumerate(zip([CRVENA, ZUTA, PLAVA, ZELENA, LJUBICASTA, OKER], ["ЦРВЕНА", "ЖУТА", "ПЛАВА", "ЗЕЛЕНА", "ЉУБИЧАСТА", "ОКЕР"])):
        x = x0 + i * (sw + 6); P.rrect(x, y1 + 24, sw, sw, 6, b, "#2A2320", 1.4)
        P.ctext(x + sw / 2, y1 + 24 + sw + 12, n, "Andika-Bold", 5.8, SIVA_TEXT)
    for k, lw in enumerate((0.6, 1.2, 2.4)):
        P.line(x0, y1 + 98 + k * 7, R - 22, y1 + 98 + k * 7, "#000000", lw, cap=0)
    # шта вам треба
    y2 = y1 + 124.7 + 16 + dod; P.rrect(L, y2, CW, 127.5, 10, None, SIVA_ZAGLAVLJE, 1.1)
    if y2 + 127.5 > 781: raise Greska("strana za roditelja prelazi")
    P.text(L + 22, y2 + 28, "ШТА ВАМ ТРЕБА", "Comfortaa", 11, CRNA)
    for i, t in enumerate(K["treba"]):
        yy = y2 + 50 + i * 15
        P.circle(L + 28, yy - 3.2, 2.2, NARANDZASTA); P.text(L + 38, yy, t, "Andika", 10.2, "#5C5C5C")
    for k, ime in enumerate(K["treba_slike"]): P.slika(ime + "_boja", R - 160 + k * 78, y2 + 14, 70, 100)
    broj_strane(P)

# ------------------------------------------------------------------ 3
def _labela(P, cx, y, i, cel, ws):
    P.ctext(cx, y, cel["naziv"], "Andika-Bold", 9.2, CRNA)
    P.ctext(cx, y + 13, f"стране {ws[0]} до {ws[-1]}", "Andika", 8.8, SIVA_TEXT)

def tabla(P, K, celine):
    zaglavlje(P)
    P.rrect(L, 53.9, 42.5, 42.5, 10, None, "#000000", 1.9); ikona(P, "zvezda", L + 21.25, 75.15)
    P.text(102, 85.2, K["tabla_naslov"], "Comfortaa", 25, CRNA)
    P.para(102, 101, R - 102, "Кад обојите целину, залепите печат на њен круг.", "Andika", 11.6, "#4D4D4D", lead=14, maxlines=2)
    oblik = K["tabla"]; cx = W / 2
    if oblik == "masina":
        P.rrect(150, 176, 54, 34, 6, "#F8F0E2", "#2A2320", 1.9)                       # левак
        for k, (x, y, r) in enumerate(((214, 160, 7), (236, 146, 9), (262, 136, 6))): P.circle(x, y, r, "#FFFFFF", "#2A2320", 1.4)
        P.line(430, 210, 430, 178, "#2A2320", 1.9); P.circle(430, 170, 10, ZUTA, "#2A2320", 1.6)   # антена са лампицом
        P.rrect(100, 210, 395, 352, 22, "#F8F0E2", "#2A2320", 1.9)
        mesta = [(205, 292), (390, 292), (205, 438), (390, 438)]
        for x, y in ((170, 610), (297.6, 610), (425, 610)):
            P.circle(x, y, 34, "#FFFFFF", "#2A2320", 1.9); P.circle(x, y, 10, "#E3C590", "#2A2320", 1.4)
        P.rrect(256, 530, 84, 22, 11, "#FFFFFF", "#2A2320", 1.4); P.ctext(297.6, 541, "СТАРТ", "Andika-Bold", 8, "#4D4D4D")
        for i, ((x, y), cel) in enumerate(zip(mesta, celine)):
            krug_za_pecat(P, x, y); bedz(P, x - 30, y - 30, i + 1, BOJE_CELINA[i], 9)
            _labela(P, x, y + 54, i, cel, cel["strane"])
    elif oblik == "sapa":
        P.path([("M", cx, 610), ("C", cx - 175, 616, cx - 186, 470, cx - 120, 420), ("C", cx - 70, 382, cx + 70, 382, cx + 120, 420),
                ("C", cx + 186, 470, cx + 175, 616, cx, 610)], "#2A2320", 1.9, fill="#F8F0E2", close=True)
        mesta = [(cx - 150, 330), (cx - 58, 250), (cx + 58, 250), (cx + 150, 330)]
        for i, ((x, y), cel) in enumerate(zip(mesta, celine)):
            P.circle(x, y, R_IN + 14, "#F8F0E2", "#2A2320", 1.9); krug_za_pecat(P, x, y); bedz(P, x, y - R_IN - 14, i + 1, BOJE_CELINA[i], 9)
        for i, cel in enumerate(celine):
            yy = 452 + i * 34; bedz(P, cx - 110, yy, i + 1, BOJE_CELINA[i], 9)
            P.text(cx - 92, yy + 3.2, cel["naziv"], "Andika-Bold", 9.6, CRNA)
            P.text(cx + 52, yy + 3.2, f"стране {cel['strane'][0]} до {cel['strane'][-1]}", "Andika", 9, SIVA_TEXT)
    elif oblik == "kuca":
        P.rect(268, 128, 34, 60, "#F8F0E2", "#2A2320", 1.9)                            # димњак
        P.path([("M", 88, 296), ("L", cx, 150), ("L", W - 88, 296)], "#2A2320", 1.9, fill="#FCEBEB", close=True)
        P.rect(118, 296, W - 236, 316, "#F8F0E2", "#2A2320", 1.9)
        P.rrect(cx - 30, 532, 60, 80, 8, "#FFFFFF", "#2A2320", 1.6); P.circle(cx + 18, 574, 2.6, "#2A2320")
        mesta = [(200, 360), (395, 360), (200, 492), (395, 492)]
        for i, ((x, y), cel) in enumerate(zip(mesta, celine)):
            krug_za_pecat(P, x, y)
            bedz(P, x - 30, y - 30, i + 1, BOJE_CELINA[i], 9)
            _labela(P, x, y + 52, i, cel, cel["strane"])
    else: raise Greska("nepoznat oblik table: " + oblik)
    for x0, t, tx in ((L, "САД ТИ", "Овде нема тачног ни погрешног. Дете бира боје и додаје своју идеју."),
                      (306.1, "ТАЧКИЦЕ", "Тачкице у углу показују колико поља има слика: једна мање, три више.")):
        P.rrect(x0, 688.8, 246.7, 85.1, 10, None, SIVA_ZAGLAVLJE, 1.1)
        P.text(x0 + 20, 713, t, "Comfortaa", 11.5, CRNA)
        P.para(x0 + 20, 724, 206, tx, "Andika", 9.8, "#666666", lead=12, maxlines=3)
    broj_strane(P)

# ------------------------------------------------------------------ 4..17
def strana_bojenja(P, K, s):
    zaglavlje(P, s["celina"], s["tacke"])
    naslov(P, "olovka", s["naslov"], s["podnaslov"])
    okvir(P, 152, 718, "САД ТИ", "m_sijalica")
    P.slika(s["crtez"], L + 22, 176, CW - 44, 524)                                      # линијски цртеж остаје на белом
    roditelj(P, s["roditelj"]); broj_strane(P)

# ------------------------------------------------------------------ prazan list (3 i 18)
def prazna_strana(P, K, q):
    zaglavlje(P, "СЛОБОДНО ЦРТАЊЕ")
    naslov(P, "olovka", q["naslov"], q["podnaslov"])
    okvir(P, 152, 718, "САД ТИ", "m_sijalica")
    roditelj(P, q["roditelj"]); broj_strane(P)

# ------------------------------------------------------------------ 18
def nalepnice(P, K, celine):
    zaglavlje(P, "КРАЈ"); naslov(P, "zvezda", "НАЛЕПНИЦЕ", "Исеци печат кад обојиш целину и залепи га на њен круг.")
    d = D_PECAT; rc = d / 2 + 8; pitch = CW / 4
    P.ctext(W / 2, 152, "ПЕЧАТИ ЗА МОЈЕ ЦЕЛИНЕ", "Andika-Bold", 9.6, SIVA_TEXT)
    for i, cel in enumerate(celine):
        cx = L + pitch * (i + 0.5); cy = 206; b = BOJE_CELINA[i]
        P.circle(cx, cy, rc, None, "#B8B8B8", 0.8, dash=[1.8, 1.8])
        P.circle(cx, cy, d / 2, TON[b][0], b, 2.2)
        ikona(P, cel["ikona"], cx, cy, 1.1, "#2A2320")
        P.ctext(cx, cy + rc + 13, cel["naziv"], "Andika-Bold", 7.6, "#4D4D4D")
    P.ctext(W / 2, 288, "НАГРАДЕ, ЛЕПИ ИХ ГДЕ ХОЋЕШ", "Andika-Bold", 9.6, SIVA_TEXT)
    pr = 30; rr = pr + 4; pitch2 = CW / 6; pal = [CRVENA, ZUTA, PLAVA, ZELENA, LJUBICASTA, OKER]
    for r in range(3):
        for k in range(6):
            cx = L + pitch2 * (k + 0.5); cy = 352 + r * 150
            P.circle(cx, cy, rr + 4, None, "#B8B8B8", 0.8, dash=[1.8, 1.8])
            if r == 0: P.circle(cx, cy, pr, "#FFFFFF", pal[k], 2.0); zvezda(P, cx, cy + 1, 20, pal[k])
            elif r == 1: P.circle(cx, cy, pr, "#FFFFFF", pal[k], 2.0); P.slika(K["nalepnice_slike"][k] + "_boja", cx - 22, cy - 22, 44, 44)
            else: P.circle(cx, cy, pr, "#FFFFFF", pal[k], 2.0); srce(P, cx, cy + 1, 15.5, pal[k])
    P.ctext(W / 2, 774, "исеци по испрекиданој линији", "Andika", 9, SIVA_TEXT)
    broj_strane(P)

# ------------------------------------------------------------------ 19
def diploma(P, K):
    zaglavlje(P, "КРАЈ")
    P.rrect(L, 73.7, CW, 700.2, 20, None, NARANDZASTA, 2.2)
    for i, b in enumerate([CRVENA, ZUTA, PLAVA, ZELENA]): P.rrect(W / 2 - 112 + i * 57, 98, 54, 8, 4, b)
    P.ctext(W / 2, 148, "ДИПЛОМА", "Comfortaa", 34, CRNA)
    P.ctext(W / 2, 185, K["naziv_veliko"], "Andika-Bold", 13, NARANDZASTA)
    P.cpara(W / 2, 216, 360, K["diploma_tekst"], "Andika", 11, "#4D4D4D", maxlines=2)
    kompozicija(P, K["diploma_slike"], (L + 20, 236, CW - 40, 180))
    for i, t in enumerate(("Име", "Датум", "Бојили смо заједно", "Моја омиљена страна")):
        yy = 446 + i * 40
        P.text(88, yy, t, "Andika-Bold", 11, CRNA)
        P.line(88 + P.sw(t, "Andika-Bold", 11) + 12, yy + 2, R - 46, yy + 2, "#B8B8B8", 0.9)
    P.ctext(W / 2, 622, "ОВДЕ НАЦРТАЈ СВОЈУ НАЈЛЕПШУ ИДЕЈУ", "Andika-Bold", 10, SIVA_TEXT)
    P.rrect(127.6, 636, 340.1, 110, 8, None, "#B8B8B8", 1.2, dash=[1.2, 2.6])
    broj_strane(P)

# ------------------------------------------------------------------ 20
def klub(P, K):
    zaglavlje(P, "КРАЈ")
    P.ctext(W / 2, 117, "IGRA LAB КЛУБ", "Comfortaa", 26, NARANDZASTA)
    P.line(W / 2 - 60, 140, W / 2 + 60, 140, "#B8B8B8", 1.0, cap=0)
    P.cpara(W / 2, 189, 410, K["klub_tekst"], "Andika", 12.2, "#4D4D4D", lead=16, maxlines=3)
    P.rrect(93.5, 283.5, 408.2, 96.3, 14, KREM, NARANDZASTA, 1.8)
    P.ctext(W / 2, 313, K["kod"], "Comfortaa", 22, NARANDZASTA)
    P.ctext(W / 2, 349, "20% на следећу књижицу", "Andika", 11.4, "#6B6B75")
    P.ctext(W / 2, 415, "ЗА ИСТИ УЗРАСТ", "Andika-Bold", 12, CRNA)
    for i, t in enumerate(K["isti_uzrast"]):
        yy = 447.9 + i * 36.85
        P.rrect(155.9, yy, 283.5, 31.2, 15.6, None, "#B8B8B8", 1.2); P.ctext(W / 2, yy + 15.6, t, "Andika-Bold", 11, "#57575C")
    P.brend("logo", (W - 119) / 2, 664, w=119)
    P.ctext(W / 2, 752, "@igralab", "Andika-Bold", 12, NARANDZASTA)
    broj_strane(P)

# ------------------------------------------------------------------ gradnja
def pripremi_strane(K, polja):
    """Dodeli strane 4..17, celine i tačkice težine (po broju polja: trećine unutar knjige)."""
    st = K["strane"]
    if len(st) != 14: raise Greska(f"treba tačno 14 strana za bojenje, ima {len(st)}")
    vr = sorted(polja[s["crtez"]] for s in st)
    g1, g2 = vr[len(vr) // 3], vr[2 * len(vr) // 3]
    celine = []
    for i, s in enumerate(st):
        s["broj"] = 4 + i; p = polja[s["crtez"]]; s["polja"] = p
        s["tacke"] = 1 if p < g1 else (2 if p < g2 else 3)
        if not celine or celine[-1]["naziv"] != s["celina"]:
            celine.append({"naziv": s["celina"], "strane": [], "ikona": K["ikone_celina"][len(celine)]})
        celine[-1]["strane"].append(s["broj"])
    if len(celine) != 4: raise Greska(f"treba 4 celine, ima {len(celine)}")
    return celine

def gradi(K, izlaz, brojevi=None):
    stil.postavi_ilustracije(K["ilustracije"]); okvir_mod.postavi_naslov(K["naziv_veliko"])
    polja = json.load(open(os.path.join(K["ilustracije"], "polja.json")))
    celine = pripremi_strane(K, polja)
    c = canvas.Canvas(izlaz, pagesize=A4, pageCompression=1, initialFontName="Andika", initialFontSize=10)
    c.setTitle(K["naziv"] + " 4+ (IGRA LAB)"); c.setAuthor("IGRA LAB"); c.setSubject("Бојанка за штампу код куће")
    prazne = K.get("prazne")
    plan = [(1, lambda P: naslovna(P, K)), (2, lambda P: za_roditelja(P, K)),
            (3, (lambda P: prazna_strana(P, K, prazne[0])) if prazne else (lambda P: tabla(P, K, celine)))]
    for s in K["strane"]: plan.append((s["broj"], (lambda s: lambda P: strana_bojenja(P, K, s))(s)))
    plan += [(18, (lambda P: prazna_strana(P, K, prazne[1])) if prazne else (lambda P: nalepnice(P, K, celine))),
             (19, lambda P: diploma(P, K)), (20, lambda P: klub(P, K))]
    for n, fn in plan:
        if brojevi and n not in brojevi: continue
        P = Str(c, n); fn(P); P.proveri(); c.showPage()
    c.save()
    return celine
