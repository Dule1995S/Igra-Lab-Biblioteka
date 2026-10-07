"""Strane 11 do 20: put i plan, raspored, priča, kretanje, nalepnice, diploma, klub."""
from blokovi import *
from strane1 import STANICE, D_PECAT
from zadaci import ZADACI as Z
import math

def mreza(P, x0, y0, s, g, sadrzaj, blokirana=()):
    """3x3 mreža; sadrzaj: dict (red, kolona) -> ime slike. Vraća funkciju centra polja."""
    for r in range(3):
        for k in range(3):
            x, y = x0 + k * (s + g), y0 + r * (s + g)
            blok(P, x, y, s, s, r=8)
            if (r, k) in sadrzaj: P.slika(sadrzaj[(r, k)], x + 8, y + 8, s - 16, s - 16)
    return lambda r, k: (x0 + k * (s + g) + s / 2, y0 + r * (s + g) + s / 2)

def p11(P):
    pocetak(P, "ПРОСТОР И НИЗ", 2, "put", "ПРОНАЂИ ПУТ У МРЕЖИ", "Од коцке стигни до листа. Повуци линију само горе, доле, лево или десно.")
    okvir(P, 146, 716, "ВЕЖБА", "put")
    s, g = 128, 8; x0 = L + (CW - (3 * s + 2 * g)) / 2
    mreza(P, x0, 178, s, g, Z[11]["slike"])
    # blok sa pravilima
    blok(P, L + 24, 612, CW - 48, 84, r=10)
    for k, (im, t) in enumerate((("kocka", "ПОЧЕТАК"), ("list", "ЦИЉ"), ("kamen", "ЗАТВОРЕНО ПОЉЕ"))):
        bw = (CW - 48) / 3; cx = L + 24 + bw * (k + 0.5)
        iw = 36; gr = iw + 8 + P.sw(t, "Andika-Bold", 9.4); gx = cx - gr / 2
        P.slika(im, gx, 612 + 42 - 18, iw, 36)
        P.text(gx + iw + 8, 612 + 42 + CAP["Andika-Bold"] * 9.4 / 2, t, "Andika-Bold", 9.4, "#4D4D4D")
    kraj(P, ["Не улазимо у поља са каменом. Један једини пут је два поља горе па два десно.", "Покажите прстом пре него што дете повуче линију."])

def strelica(P, x, y, dx, dy, boja="#4D4D4D", lw=3.2):
    """стрелица од (x,y) у правцу (dx,dy), дужине укључује врх"""
    l = math.hypot(dx, dy); ux, uy = dx / l, dy / l
    ex, ey = x + dx, y + dy
    P.line(x, y, ex - ux * 4, ey - uy * 4, boja, lw)
    nx, ny = -uy, ux
    P.path([("M", ex - ux * 9 + nx * 6, ey - uy * 9 + ny * 6), ("L", ex, ey), ("L", ex - ux * 9 - nx * 6, ey - uy * 9 - ny * 6)], boja, lw, join=1)

def p12(P):
    pocetak(P, "ПРОСТОР И НИЗ", 2, "plan", "ПРАТИ КРАТАК ПЛАН", "Од коцке иди по плану. Заокружи предмет на последњем пољу пута.")
    okvir(P, 146, 572, "ВЕЖБА", "plan")
    pw = (CW - 48 - 16) / 2
    for k, (n, t, smer) in enumerate(((1, "ДВА ПОЉА ДЕСНО", "d"), (2, "ДВА ПОЉА ГОРЕ", "g"))):
        bx = L + 24 + k * (pw + 16); blok(P, bx, 168, pw, 64, r=10)
        bedz(P, bx + 24, 200, n, "#4D4D4D", 11)
        P.text(bx + 44, 200 + CAP["Andika-Bold"] * 9 / 2, t, "Andika-Bold", 9, "#4D4D4D")
        for i in range(2):
            if smer == "d": strelica(P, bx + pw - 66 + i * 32, 200, 24, 0)
            else: strelica(P, bx + pw - 56 + i * 30, 213, 0, -26)
    s, g = 94, 8; x0 = L + (CW - (3 * s + 2 * g)) / 2
    sad = Z[12]["mreza"]
    mreza(P, x0, 254, s, g, sad)
    P.rrect(x0 + 4, 254 + 2 * (s + g) + 4, 36, 14, 7, "#FFFFFF", "#4D4D4D", 1.0); P.ctext(x0 + 22, 254 + 2 * (s + g) + 11, "СТАРТ", "Andika-Bold", 6.8, "#4D4D4D")
    okvir(P, 598, 718, "САД ТИ", "m_sijalica")
    P.ctext(W / 2, 630, "Смисли свој план од два корака и нацртај стрелице.", "Andika-Bold", 11, TEKST)
    for k in range(2): tackasta(P, L + 24 + k * (pw + 16), 646, pw, 56)
    kraj(P, ["Почетак је доле лево. Пут иде два поља десно, па два горе и стиже до листа у горњем десном углу.", "Покажите први корак прстом."])

def p13(P):
    pocetak(P, "ПРОСТОР И НИЗ", 3, "kopija", "НАПРАВИ ИСТИ РАСПОРЕД", "Погледај леву мрежу. У десној нацртај сваки предмет на исто место.")
    def par(y0, kolone, red, imena, s, naslov_l, naslov_d):
        gw = kolone * s + (kolone - 1) * 6; gap = 56
        xl = L + (CW - (2 * gw + gap)) / 2; xd = xl + gw + gap
        P.ctext(xl + gw / 2, y0 - 10, naslov_l, "Andika-Bold", 9.6, "#4D4D4D"); P.ctext(xd + gw / 2, y0 - 10, naslov_d, "Andika-Bold", 9.6, "#4D4D4D")
        for r in range(red):
            for k in range(kolone):
                x, y = xl + k * (s + 6), y0 + r * (s + 6); blok(P, x, y, s, s, r=8); P.slika(imena[r * kolone + k], x + 6, y + 6, s - 12, s - 12)
                x2 = xd + k * (s + 6); P.rrect(x2, y, s, s, 8, "#FFFFFF", "#8C8C8C", 1.2, dash=[3, 3])
        ys = y0 + (red * s + (red - 1) * 6) / 2
        strelica(P, xl + gw + 14, ys, gap - 28, 0, "#8C8C8C", 2.4)
    okvir(P, 146, 424, "ВЕЖБА", "kopija")
    par(200, 2, 2, Z[13]["delovi"][0]["slike"], 92, "МОДЕЛ", "МОЈ РАСПОРЕД")
    P.ctext(W / 2, 406, "Исти предмет, исто место. Не окрећемо мрежу.", "Andika-Bold", 10, "#4D4D4D")
    okvir(P, 444, 718, "ВЕЖБА", "kopija")
    par(496, 3, 2, Z[13]["delovi"][1]["slike"], 64, "МОДЕЛ", "МОЈ РАСПОРЕД")
    P.ctext(W / 2, 668, "Сад је мрежа већа. Исти предмет, исто место.", "Andika-Bold", 10, "#4D4D4D")
    kraj(P, ["Ово је копирање распореда, не огледање. Дете може усмено да наведе места или да нацрта симболе.", "Ако је тешко, покријте један ред модела и радите ред по ред."])

def p14(P):
    pocetak(P, "ПРИЧА И САРАДЊА", 2, "kocka", "ИСТРАЖИВАЧ ГРАДИТЕЉ", "Покажи колико коцки има модел. Смисли своју грађевину.")
    okvir(P, 146, 410, "ВЕЖБА", "kocka")
    blok(P, L + 24, 172, CW - 48, 118, r=10)
    ch = 84; cwid = ch * 245 / 252
    for i in range(3): P.slika("kocka", L + 24 + (CW - 48) / 2 + (i - 1) * (cwid + 26) - cwid / 2, 172 + 17, cwid, ch)
    P.ctext(W / 2, 306, "МОДЕЛ", "Andika-Bold", 9.6, "#4D4D4D")
    P.ctext(W / 2, 332, "Колико коцки има модел?", "Andika-Bold", 11.5, TEKST)
    ponuda_brojeva(P, L + 24, 346, CW - 48, 50, Z[14]["opcije"])
    okvir(P, 438, 718, "САД ТИ", "m_sijalica")
    P.ctext(W / 2, 470, "Направи грађевину од правих коцки, па је нацртај.", "Andika-Bold", 11, TEKST)
    tackasta(P, L + 24, 486, CW - 48, 216, "МОЈА ГРАЂЕВИНА")
    kraj(P, ["Модел има 3 коцке у једном реду. За градњу користите велике коцке на стабилној подлози.", "Дете може да гради и од папира, јастука или картонских кутија."])

def p15(P):
    pocetak(P, "ПРИЧА И САРАДЊА", 2, "prica", "МИСИЈА ИМА ПРИЧУ", "Слике су измешане. Упиши 1, 2 и 3 по реду приче: шта је било прво?")
    okvir(P, 146, 478, "ВЕЖБА", "prica")
    cw, gap = 152, 17; x0 = L + (CW - (3 * cw + 2 * gap)) / 2
    for i, im in enumerate(Z[15]["slike"]):
        bx = x0 + i * (cw + gap); blok(P, bx, 172, cw, 214, r=10)
        P.slika_vis(im, bx + cw / 2, 184, 134)
        P.circle(bx + cw / 2, 354, 14, "#FFFFFF", "#8C8C8C", 1.3)
    P.ctext(W / 2, 414, "Шта је прво, шта друго, а шта на крају?", "Andika-Bold", 11, TEKST)
    P.ctext(W / 2, 436, "Упиши број у круг испод сваке слике.", "Andika", 10, "#4D4D4D")
    okvir(P, 506, 718, "САД ТИ", "m_sijalica")
    P.ctext(W / 2, 538, "Који безбедан план помаже да змај полети? Нацртај или испричај.", "Andika-Bold", 10.5, TEKST)
    tackasta(P, L + 24, 556, CW - 48, 146)
    kraj(P, ["Дете жели да пусти змаја, нема ветра, а затим змај лети. Тачан ред је: почетак, проблем, крај.", "Питајте који безбедан план помаже."])

def stopalo(P, cx, cy, s=1.0, boja="#8C8C8C", ugao=0):
    P.c.saveState(); P.c.translate(cx, P.Y(cy)); P.c.rotate(ugao)
    P.c.setFillColor(hc(boja)); P.c.ellipse(-5 * s, -9 * s, 5 * s, 9 * s, stroke=0, fill=1)
    for k in range(4): P.c.circle((-3.6 + k * 2.4) * s, 12 * s - abs(k - 1.5) * 1.2 * s, 1.5 * s, stroke=0, fill=1)
    P.c.restoreState()

def p16(P):
    pocetak(P, "КРЕЋЕМО СЕ", None, "osoba1", "ПУТУЈЕМО ПОЛАКО", "Замисли да носиш лист. Направи три мирна корака, па стани.")
    okvir(P, 146, 718, "ИГРА ПОКРЕТА", "osoba1")
    blok(P, L + 24, 178, CW - 48, 292, ZELENA, r=12)
    # стаза и корaци
    P.path([("M", L + 92, 392), ("C", L + 170, 300, L + 250, 440, L + 330, 340), ("C", L + 380, 280, L + 400, 300, R - 70, 262)], "#A1D6B3", 22, cap=1)
    P.path([("M", L + 92, 392), ("C", L + 170, 300, L + 250, 440, L + 330, 340), ("C", L + 380, 280, L + 400, 300, R - 70, 262)], "#EAF6EE", 12, cap=1)
    pts = [(L + 150, 345, 20), (L + 250, 372, -10), (L + 330, 340, 25)]
    for i, (x, y, a) in enumerate(pts):
        stopalo(P, x, y, 1.7, "#4D4D4D", a); bedz(P, x, y - 34, i + 1, "#2FA356", 10)
    P.slika("list", L + 62, 200, 56, 76)
    P.ctext(L + 90, 296, "ЗАМИШЉЕНИ ЛИСТ", "Andika-Bold", 7.8, "#4D4D4D")
    cxp, cyp = R - 70, 262
    P.circle(cxp, cyp - 6, 24, "#FFFFFF", "#2A2320", 1.8); P.rect(cxp - 8, cyp - 18, 6, 24, "#2A2320"); P.rect(cxp + 2, cyp - 18, 6, 24, "#2A2320")
    P.ctext(cxp, cyp + 34, "ПАУЗА", "Andika-Bold", 9, "#4D4D4D")
    pw = (CW - 48 - 16) / 2
    for k, (n, t, b) in enumerate((("ТРИ МИРНА КОРАКА", "Носи замишљени лист. Иди полако и тихо.", ZELENA), ("ПАУЗА", "Стани. Желиш ли још један круг?", ZUTA))):
        bx = L + 24 + k * (pw + 16); blok(P, bx, 494, pw, 100, b)
        P.ctext(bx + pw / 2, 494 + 28, n, "Comfortaa", 11, TEKST)
        P.cpara(bx + pw / 2, 494 + 62, pw - 28, t, "Andika", 10.2, "#4D4D4D", maxlines=3)
    P.cpara(W / 2, 640, CW - 80, "Кад пређеш круг, можеш да почнеш изнова. Нема трке.", "Andika-Bold", 10.5, "#4D4D4D", maxlines=2)
    P.nacrtano.add("slika:list")
    kraj(P, ["Ослободите простор. Може и седећи: три покрета руку, па пауза. Без трке и такмичења.", "Дете води, а ви се прикључите."])

def p17(P):
    pocetak(P, "КРЕЋЕМО СЕ", None, "lupa", "НАЂИ И ИСПРИЧАЈ", "Заједно пронађите три безбедна предмета. Осмислите кратку причу.")
    okvir(P, 146, 718, "ИГРА ПОКРЕТА", "osoba1")
    P.ctext(W / 2, 184, "ПРИМЕР: ТРИ ПРЕДМЕТА", "Andika-Bold", 9.6, SIVA_TEXT)
    cw, gap = 148, 16; x0 = L + (CW - (3 * cw + 2 * gap)) / 2
    for i, im in enumerate(["lopta", "kocka", "knjiga"]): kartica(P, x0 + i * (cw + gap), 196, cw, 112, im, None, None, vis=82)
    P.line(L + 24, 328, R - 24, 328, SIVA_LINIJA, 0.8, cap=0)
    P.ctext(W / 2, 350, "МОЈА ТРИ ПРЕДМЕТА", "Andika-Bold", 9.6, SIVA_TEXT)
    for i in range(3): tackasta(P, x0 + i * (cw + gap), 362, cw, 96); bedz(P, x0 + i * (cw + gap) + 17, 379, i + 1, "#6B6B75")
    P.line(L + 24, 480, R - 24, 480, SIVA_LINIJA, 0.8, cap=0)
    P.ctext(W / 2, 502, "НАША ПРИЧА О ТРИ ПРЕДМЕТА", "Andika-Bold", 9.6, SIVA_TEXT)
    tackasta(P, L + 24, 514, CW - 48, 186)
    kraj(P, ["Одрасли унапред припрема велике познате играчке или папирне слике. Не тражимо скривене ситне предмете.", "Прича може да има почетак, проблем и крај, као на страни 15."])

# ---- налепнице, диплома, клуб
def srce(P, cx, cy, r, boja):
    P.path([("M", cx, cy + r * 0.9), ("C", cx - r * 1.5, cy - r * 0.1, cx - r * 0.8, cy - r * 1.25, cx, cy - r * 0.45),
            ("C", cx + r * 0.8, cy - r * 1.25, cx + r * 1.5, cy - r * 0.1, cx, cy + r * 0.9)], "#2A2320", 1.4, fill=boja, close=True)

def zvezda(P, cx, cy, r, boja, ri=None):
    ri = ri or r * 0.42; pts = []
    for i in range(10):
        a = math.radians(-90 + i * 36); rr = r if i % 2 == 0 else ri
        pts.append(("M" if i == 0 else "L", cx + rr * math.cos(a), cy + rr * math.sin(a)))
    P.path(pts, "#2A2320", 1.4, fill=boja, close=True)

def p18(P):
    zaglavlje(P, "КРАЈ"); naslov(P, "zvezda", "НАЛЕПНИЦЕ", "Исеци печат кад завршиш станицу и залепи га на њен круг на листу.")
    d = D_PECAT; rc = d / 2 + 8                       # пречник печата и круг сечења
    boje = [CRVENA, ZUTA, PLAVA, ZELENA, LJUBICASTA]; ik = ["oko", "brojevi", "put", "prica", "osoba1"]
    pitch = CW / 5
    P.ctext(W / 2, 152, "ПЕЧАТИ ЗА МОЈУ МИСИЈУ", "Andika-Bold", 9.6, SIVA_TEXT)
    for i, (b, (nm, st, _)) in enumerate(zip(boje, STANICE)):
        cx = L + pitch * (i + 0.5); cy = 206
        P.circle(cx, cy, rc, None, "#B8B8B8", 0.8, dash=[1.8, 1.8])
        P.circle(cx, cy, d / 2, TON[b][0], b, 2.2)
        ikona(P, ik[i], cx, cy, 1.1, "#2A2320")
        P.ctext(cx, cy + rc + 13, nm, "Andika-Bold", 7.6, "#4D4D4D")
    P.ctext(W / 2, 288, "НАГРАДЕ, ЛЕПИ ИХ ГДЕ ХОЋЕШ", "Andika-Bold", 9.6, SIVA_TEXT)
    pr = 30; rr = pr + 4; pitch2 = CW / 6
    sl = ["list", "lupa", "kocka", "cvet", "lopta", "knjiga"]; pal = [CRVENA, ZUTA, PLAVA, ZELENA, LJUBICASTA, OKER]
    for r in range(3):
        for k in range(6):
            cx = L + pitch2 * (k + 0.5); cy = 352 + r * 150
            P.circle(cx, cy, rr + 4, None, "#B8B8B8", 0.8, dash=[1.8, 1.8])
            if r == 0: P.circle(cx, cy, pr, "#FFFFFF", pal[k], 2.0); zvezda(P, cx, cy + 1, 20, pal[k])
            elif r == 1: P.circle(cx, cy, pr, TON[pal[k]][0], pal[k], 2.0); P.slika(sl[k], cx - 20, cy - 20, 40, 40)
            else: P.circle(cx, cy, pr, "#FFFFFF", pal[k], 2.0); srce(P, cx, cy + 1, 15.5, pal[k])
    P.ctext(W / 2, 774, "исеци по испрекиданој линији", "Andika", 9, SIVA_TEXT)
    broj_strane(P)

def p19(P):
    zaglavlje(P, "КРАЈ")
    P.rrect(L, 73.7, CW, 700.2, 20, None, NARANDZASTA, 2.2)
    for i, b in enumerate([CRVENA, ZUTA, PLAVA, ZELENA]): P.rrect(W / 2 - 112 + i * 57, 98, 54, 8, 4, b)
    P.ctext(W / 2, 148, "ДИПЛОМА", "Comfortaa", 34, CRNA)
    P.ctext(W / 2, 185, "МАЛА ИСТРАЖИВАЧКА МИСИЈА", "Andika-Bold", 13, NARANDZASTA)
    P.cpara(W / 2, 216, 330, "Успомена на нашу мисију: посматрање, бројање, пут и прича.", "Andika", 11, "#4D4D4D", maxlines=2)
    # композиција од асета: лупа, лист, цвет, коцка и звезде
    P.slika("lupa", W / 2 - 62, 262, 124, 128); P.slika("list", W / 2 - 150, 300, 70, 94); P.slika("cvet", W / 2 + 84, 294, 66, 92)
    P.slika("kocka", W / 2 - 112, 360, 54, 56); P.slika("lopta", W / 2 + 58, 366, 52, 52)
    zvezda(P, W / 2 - 86, 262, 11, ZUTA); zvezda(P, W / 2 + 96, 258, 8, CRVENA); zvezda(P, W / 2 + 6, 238, 7, PLAVA)
    for i, t in enumerate(("Име", "Датум", "Истраживали смо заједно", "Моје ново питање")):
        yy = 446 + i * 40
        P.text(88, yy, t, "Andika-Bold", 11, CRNA)
        P.line(88 + P.sw(t, "Andika-Bold", 11) + 12, yy + 2, R - 46, yy + 2, "#B8B8B8", 0.9)
    P.ctext(W / 2, 622, "ОВДЕ ОСТАВИ ТРАГ ОМИЉЕНИМ ОТКРИЋЕМ", "Andika-Bold", 10, SIVA_TEXT)
    P.rrect(127.6, 636, 340.1, 110, 8, None, "#B8B8B8", 1.2, dash=[1.2, 2.6])
    broj_strane(P)

def p20(P):
    zaglavlje(P, "КРАЈ")
    P.ctext(W / 2, 117, "IGRA LAB КЛУБ", "Comfortaa", 26, NARANDZASTA)
    P.line(W / 2 - 60, 140, W / 2 + 60, 140, "#B8B8B8", 1.0, cap=0)
    P.cpara(W / 2, 189, 410, "Станице су сад и ваше заједничке. Ако желите још игара за исти узраст, клуб код вам даје попуст на следећу књижицу.", "Andika", 12.2, "#4D4D4D", lead=16, maxlines=3)
    P.rrect(93.5, 283.5, 408.2, 96.3, 14, KREM, NARANDZASTA, 1.8)
    P.ctext(W / 2, 313, "МИСИЈА20", "Comfortaa", 22, NARANDZASTA)
    P.ctext(W / 2, 349, "20% на следећу књижицу", "Andika", 11.4, "#6B6B75")
    P.ctext(W / 2, 415, "ЗА ИСТИ УЗРАСТ", "Andika-Bold", 12, CRNA)
    for i, t in enumerate(("МОЗГАЛИЦЕ 4 И 5", "ВИТЕЗОВИ И ЗМАЈЕВИ", "ЖИВОТИЊЕ СВЕТА", "ЧУВАМ ПРИРОДУ")):
        yy = 447.9 + i * 36.85
        P.rrect(155.9, yy, 283.5, 31.2, 15.6, None, "#B8B8B8", 1.2); P.ctext(W / 2, yy + 15.6, t, "Andika-Bold", 11, "#57575C")
    P.brend("logo", (W - 119) / 2, 664, w=119)
    P.ctext(W / 2, 752, "@igralab", "Andika-Bold", 12, NARANDZASTA)
    broj_strane(P)

STRANE = {11: ("пут", p11), 12: ("план", p12), 13: ("распоред", p13), 14: ("градитељ", p14), 15: ("прича", p15), 16: ("путујемо", p16),
          17: ("нађи", p17), 18: ("налепнице", p18), 19: ("диплома", p19), 20: ("клуб", p20)}
