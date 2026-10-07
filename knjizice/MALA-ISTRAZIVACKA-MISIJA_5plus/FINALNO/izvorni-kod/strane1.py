"""Strane 1 do 3: naslovna, za roditelja, moja misija (tabla napretka)."""
from stil import *
from okvir import *

STANICE = [("ПОСМАТРАЊЕ", "стране 4 до 6", CRVENA), ("КОЛИЧИНА", "стране 7 до 9", ZUTA), ("ПРОСТОР И НИЗ", "стране 10 до 13", PLAVA),
           ("ПРИЧА И САРАДЊА", "стране 14 до 15", ZELENA), ("КРЕЋЕМО СЕ", "стране 16 до 17", LJUBICASTA)]
STANICA_IKONE = ["oko", "brojevi", "put", "prica", "osoba1"]
D_PECAT = 58.0                      # prečnik pečata (i unutrašnjeg kruga na tabli)

def naslovna(P):
    c = P.c
    P.rect(0, 0, W, H, fill=KREM)
    P.rrect(34, 34, W - 68, H - 68, 22, "#FFFFFF", NARANDZASTA, 2.2)
    P.brend("logo", (W - 160.5) / 2, 62.2, w=160.5)
    P.ctext(W / 2, 140, "МАЛА ИСТРАЖИВАЧКА", "Comfortaa", 31, TEKST)
    boje = [CRVENA, ZUTA, PLAVA, ZELENA, LJUBICASTA, OKER]; slova = "МИСИЈА"
    ws = [P.sw(s, "Comfortaa", 62) for s in slova]; gap = 5
    x = (W - (sum(ws) + gap * (len(ws) - 1))) / 2
    for s, w, b in zip(slova, ws, boje):
        P.text(x, 217, s, "Comfortaa", 62, b); x += w + gap
    P.ctext(W / 2, 258, "посматрај, преброј, испричај и истражи заједно", "Andika", 13, "#4D4D4D")
    P.ctext(W / 2, 277, "игре истраживања за узраст од 5 година", "Andika", 13, "#4D4D4D")
    P.rrect(76.5, 320.3, 442.2, 283.5, 14, KREM, "#F3B9A0", 1.3)
    P.slika("porodica", 84.5, 328.3, 426.2, 267.5)
    for i, t in enumerate(["четири станице и бонус, дванаест игара на папиру", "крупно, једна игра на страни, за заједничко истраживање", "штампа се код куће, у боји"]):
        P.circle(106, 630 + i * 20 - 4, 2.6, NARANDZASTA)
        P.text(118, 630 + i * 20, t, "Andika", 11.4, "#4D4D4D")
    P.rrect(76.5, 734.2, 442.2, 39.7, 19.85, None, NARANDZASTA, 1.2)
    P.ctext(76.5 + 56, 734.2 + 19.85, "Ова књижица је од:", "Andika", 11, "#4D4D4D")
    P.line(76.5 + 118, 760, 76.5 + 442.2 - 22, 760, "#B8B8B8", 0.8, dash=[1.2, 2.6])

def za_roditelja(P):
    zaglavlje(P)
    P.text(L, 87.5, "ЗА РОДИТЕЉА", "Comfortaa", 25, CRNA)
    pas = ["Ова књижица не тражи од детета да зна одговоре напамет. Учи га да погледа пажљиво, да броји, да прати правило и да исприча шта је видело.",
           "Мисија има четири станице: посматрање, количину, простор и низ, причу и сарадњу, и бонус за кретање. Редослед можете да мењате, а мисија може да траје више дана.",
           "Играјте се заједно, по четири корака испод. Поделите улоге: један посматра, други броји, трећи прича, па се мењајте. Улоге нису по способностима, пробати може свако.",
           "На свакој страни је мали оквир за вас. У њему пише шта да кажете и како да игру учините лакшом. Нема трке и нема бодова.",
           "Ово није тест ни процена. Дете од пет година тек учи да броји у мислима и да прати кораке, па свако иде својим темпом."]
    y = 120
    for t in pas: y = P.para(L, y, CW, t, "Andika", 11.6, "#404040", lead=15.3) + 7.5
    # четири корака
    kor = [("ПРИПРЕМИТЕ", "Мирно место, оловка и велике познате играчке.", CRVENA), ("ИЗАБЕРИТЕ", "Дете бира станицу која га занима.", ZUTA),
           ("ИСТРАЖИТЕ", "Дете показује, исприча или нацрта.", PLAVA), ("ЗАСТАНИТЕ", "Кад треба, направите паузу.", ZELENA)]
    cw, gap = 119.1, 11.3; y0 = 372; h = 118
    for i, (h1, t, b) in enumerate(kor):
        x = L + i * (cw + gap); bg, rub = TON[b]
        P.rrect(x, y0, cw, h, 9, bg, rub, 1.1)
        P.circle(x + 20, y0 + 22, 9, b); P.ctext(x + 20, y0 + 22, str(i + 1), "Comfortaa", 10.5, "#FFFFFF")
        P.text(x + 12, y0 + 52, h1, "Andika-Bold", 9.4, CRNA)
        P.para(x + 12, y0 + 61, cw - 22, t, "Andika", 9.8, "#575757", lead=12.3, maxlines=5)
    P.ctext(W / 2, y0 + h + 17, "Мисија може да траје више дана.", "Andika-Bold", 10.2, "#57575C")
    # правила мисије
    y1 = 545; P.rrect(L, y1, CW, 124, 10, None, SIVA_ZAGLAVLJE, 1.1)
    P.text(L + 22, y1 + 28, "ПРАВИЛА МИСИЈЕ", "Comfortaa", 11, CRNA)
    prav = ["Користимо папирне слике и велике познате играчке.", "Не пробамо непознате предмете, биљке и течности.", "Лупу не усмеравамо ка сунцу или очима.", "Ситне предмете не користимо, ни камење из природе."]
    for i, t in enumerate(prav):
        yy = y1 + 52 + i * 18.5
        P.circle(L + 28, yy - 3.2, 2.4, NARANDZASTA); P.text(L + 38, yy, t, "Andika", 10.2, "#5C5C5C")
    # шта вам треба
    y2 = 686; P.rrect(L, y2, CW, 94, 10, None, SIVA_ZAGLAVLJE, 1.1)
    P.text(L + 22, y2 + 26, "ШТА ВАМ ТРЕБА", "Comfortaa", 11, CRNA)
    for i, t in enumerate(["папир и оловка за дете", "велике познате играчке или коцке", "маказе, за одраслог (страна са печатима)", "штампач у боји и обичан папир"]):
        yy = y2 + 46 + i * 12.8
        P.circle(L + 28, yy - 3.2, 2.2, NARANDZASTA); P.text(L + 38, yy, t, "Andika", 10.2, "#5C5C5C")
    P.slika("lupa", R - 150, y2 + 14, 62, 64); P.slika("kocka", R - 82, y2 + 18, 60, 58)
    broj_strane(P)

def _list_putanja(cx, top, bot, hw):
    """List: oštar vrh gore, zaobljeno dno. Vraća liniju ivice (desna i leva polovina) kao putanju."""
    h = bot - top
    return [("M", cx, top), ("C", cx + hw * 0.55, top + h * 0.12, cx + hw * 1.02, top + h * 0.42, cx + hw * 0.92, top + h * 0.66),
            ("C", cx + hw * 0.84, top + h * 0.88, cx + hw * 0.4, bot, cx, bot),
            ("C", cx - hw * 0.4, bot, cx - hw * 0.84, top + h * 0.88, cx - hw * 0.92, top + h * 0.66),
            ("C", cx - hw * 1.02, top + h * 0.42, cx - hw * 0.55, top + h * 0.12, cx, top)]

def moja_misija(P):
    zaglavlje(P)
    P.rrect(L, 53.9, 42.5, 42.5, 10, None, "#000000", 1.9); ikona(P, "zvezda", L + 21.25, 75.15)
    P.text(102, 85.2, "МОЈА МИСИЈА", "Comfortaa", 25, CRNA)
    P.para(102, 101, R - 102, "Кад завршите станицу, залепите печат на њен круг на листу.", "Andika", 11.6, "#4D4D4D", lead=14, maxlines=2)
    cx = 205.0; top, bot = 140, 655; hw = 138
    P.path(_list_putanja(cx, top, bot, hw), "#2A2320", 1.9, fill="#EAF6EE", close=True)
    P.path([("M", cx, top + 6), ("L", cx, bot + 22)], "#2A2320", 1.9)           # rebro i drška
    ys = [595, 515, 435, 355, 275]
    for yy in ys:                                                               # bočna rebra
        P.path([("M", cx, yy + 22), ("L", cx + 92, yy - 14)], "#A1D6B3", 1.4); P.path([("M", cx, yy + 22), ("L", cx - 92, yy - 14)], "#A1D6B3", 1.4)
    r_in = D_PECAT / 2 + 2.3                                                    # unutrašnji krug: pečat staje tačno u njega
    for i, (y, (nm, st, b)) in enumerate(zip(ys, STANICE)):
        P.circle(cx, y, r_in + 6, "#FFFFFF", "#2A2320", 1.6)
        P.circle(cx, y, r_in, None, "#B8B8B8", 0.9, dash=[1.6, 1.8])
        P.line(cx + r_in + 12, y, 372, y, "#B8B8B8", 1.0, dash=[1.2, 3.0])
        P.circle(386, y, 10, b); P.ctext(386, y, str(i + 1), "Comfortaa", 10.5, "#FFFFFF")
        P.text(404, y - 1.5, nm, "Andika-Bold", 9.8, CRNA)
        P.text(404, y + 12, st, "Andika", 9.2, SIVA_TEXT)
    # ВЕЖБА / САД ТИ
    for x0, t, tx in ((L, "ВЕЖБА", "Овде постоји тачан одговор. Покажите пример, па пустите дете да покуша."),
                      (306.1, "САД ТИ", "Овде нема тачног ни погрешног. Дете бира, прича, црта, прави своје.")):
        P.rrect(x0, 688.8, 246.7, 85.1, 10, None, SIVA_ZAGLAVLJE, 1.1)
        P.text(x0 + 20, 713, t, "Comfortaa", 11.5, CRNA)
        P.para(x0 + 20, 724, 206, tx, "Andika", 9.8, "#666666", lead=12, maxlines=3)
    broj_strane(P)
