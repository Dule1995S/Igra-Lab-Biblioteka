#!/usr/bin/env python3
"""Provere gotovog PDF-a prema pravilima redizajna (strane, A4, fontovi, crtice, zabranjene reči, latinica, broj strane,
muški rod, zona 10 mm) + provere zadataka (jedan tačan odgovor, nizovi, putevi, sabiranje i oduzimanje, položaj odgovora).
Upotreba: python3 verify.py KNJIZICA.pdf     (izlaz 1 ako ima grešaka)"""
import sys, re, itertools
import pymupdf
from zadaci import ZADACI as Z

BR_STRANA = 20
A4 = (595.276, 841.89)
ZONA = 10 * 72 / 25.4
DOZVOLJENI_FONTOVI = ("Comfortaa", "Andika")
LATINICA_DOZVOLJENA = {"IGRA", "LAB", "@igralab"}
# lista zabranjenih reči je radna (nije dobijena od vlasnika): dopuniti prema stvarnom spisku
ZABRANJENO = ["бесплатно", "гаранциј", "најбољ", "дијагноз", "терапиј", "лечи", "поремећај", "хиперактив", "аутизам", "дислекси",
              "ocena", "iq", "ик ", "pro ", "premium"]
GRESKE, UPOZORENJA = [], []
def greska(m): GRESKE.append(m)
def info(m): print("  " + m)

def tekst_spanovi(p):
    for b in p.get_text("dict")["blocks"]:
        for l in b.get("lines", []):
            for s in l["spans"]:
                if s["text"].strip(): yield s

def main(pdf):
    d = pymupdf.open(pdf)
    print(f"Provera: {pdf}")
    # 1. strane i format
    if len(d) != BR_STRANA: greska(f"broj strana {len(d)} (treba {BR_STRANA})")
    for i, p in enumerate(d, 1):
        if abs(p.rect.width - A4[0]) > 0.6 or abs(p.rect.height - A4[1]) > 0.6: greska(f"strana {i}: format {p.rect.width:.1f}x{p.rect.height:.1f} nije A4")
    info(f"strana: {len(d)}, A4")
    # 2. fontovi
    fonts = set()
    for i, p in enumerate(d, 1):
        for f in p.get_fonts(full=True):
            ime = f[3]; fonts.add(ime)
            if not any(x in ime for x in DOZVOLJENI_FONTOVI): greska(f"strana {i}: font {ime} nije dozvoljen")
            if not d.extract_font(f[0])[3]: greska(f"strana {i}: font {ime} nije ugrađen")
    info("fontovi: " + ", ".join(sorted(f.split('+')[-1] for f in fonts)))
    # 3. tekst: crtice, zabranjene reči, latinica, muški rod
    mnozina = re.compile(r"\b[а-яА-ЯјЈљЉњЊћЋџЏђЂ]{3,}(?:ао|ио|ео)\b")
    for i, p in enumerate(d, 1):
        txt = p.get_text()
        for m in re.finditer(r"[–—‒―−]|(?<=\S) - (?=\S)|(?<=[а-яА-Я])-(?=[а-яА-Я])", txt): greska(f"strana {i}: crtica u tekstu: …{txt[max(0, m.start()-15):m.end()+15]!r}")
        low = txt.lower()
        for z in ZABRANJENO:
            if z in low: greska(f"strana {i}: zabranjena reč „{z}“")
        for w in re.findall(r"[A-Za-z@][A-Za-z@]*", txt):
            if w not in LATINICA_DOZVOLJENA: greska(f"strana {i}: latinica u tekstu: {w}")
        for w in mnozina.findall(txt): greska(f"strana {i}: muški rod (glagolski pridev na -ао/-ио/-ео): {w}")
    info("crtice, zabranjene reči, latinica, muški rod: provereno")
    # 4. broj strane
    for i, p in enumerate(d, 1):
        nadjen = [s for s in tekst_spanovi(p) if s["text"].strip() == str(i) and s["bbox"][1] > 780 and abs((s["bbox"][0] + s["bbox"][2]) / 2 - A4[0] / 2) < 6]
        if i == 1:
            if nadjen: greska("naslovna ima broj strane")
        elif not nadjen: greska(f"strana {i}: nema broja strane u krugu")
        if i > 1 and not any(abs(dr["rect"].width - 19.9) < 0.3 and dr["rect"].y0 > 780 for dr in p.get_drawings()): greska(f"strana {i}: nema kruga oko broja")
    info("broj strane u krugu na svakoj strani osim naslovne")
    # 5. zona 10 mm (mastilo: pismo, crteži i slike; pozadine preko cele strane su dozvoljene)
    for i, p in enumerate(d, 1):
        def van(x0, y0, x1, y1, sta):
            if x0 < ZONA - 0.5 or y0 < ZONA - 0.5 or x1 > A4[0] - ZONA + 0.5 or y1 > A4[1] - ZONA + 0.5: greska(f"strana {i}: {sta} u zoni 10 mm ({x0:.0f},{y0:.0f},{x1:.0f},{y1:.0f})")
        for s in tekst_spanovi(p):
            x0, y0, x1, y1 = s["bbox"]; sz = s["size"]
            van(x0, y0 + sz * 0.28, x1, y1 - sz * 0.2, f"tekst „{s['text'][:20]}“")
        for dr in p.get_drawings():
            r = dr["rect"]
            if r.width * r.height > 0.9 * A4[0] * A4[1]: continue
            van(r.x0, r.y0, r.x1, r.y1, "crtež")
        for im in p.get_image_info():
            b = im["bbox"]; van(b[0], b[1], b[2], b[3], "slika")
    info("zona 10 mm: provereno")
    # 6. raster: dpi, proporcije, ništa odsečeno van strane
    sl = 0
    for i, p in enumerate(d, 1):
        for im in p.get_image_info():
            sl += 1; b = im["bbox"]; w, h = b[2] - b[0], b[3] - b[1]
            dpi = im["width"] / (w / 72)
            if dpi > 150.6: greska(f"strana {i}: slika {dpi:.0f} dpi (max 150)")
            if abs((im["width"] / im["height"]) / (w / h) - 1) > 0.01: greska(f"strana {i}: slika razvučena ili isečena ({im['width']}x{im['height']} u {w:.0f}x{h:.0f})")
    info(f"rasterske slike: {sl}, najviše 150 dpi, bez razvlačenja")
    # 7. Lisko samo u logu i u okviru za roditelje
    for i, p in enumerate(d, 1):
        for dr in p.get_drawings():
            f = dr.get("fill")
            if f and abs(f[0] - 0.894) < 0.01 and abs(f[1] - 0.392) < 0.01 and abs(f[2] - 0.169) < 0.01 and dr["rect"].width * dr["rect"].height > 200:
                r = dr["rect"]; ok = (r.y0 > 735 and r.x0 > 500) or (i in (1, 20) and r.x1 - r.x0 < 45 and r.width * r.height < 2000)
                if not ok: greska(f"strana {i}: Lisko (narandžasta glava) van loga i okvira za roditelja: {tuple(round(v) for v in r)}")
        if 4 <= i <= 17 and not any(dr.get("fill") and abs(dr["fill"][0] - 0.894) < 0.01 and dr["rect"].y0 > 735 for dr in p.get_drawings()): greska(f"strana {i}: nema Liska u okviru za roditelja")
    info("Lisko samo u logu i u okviru za roditelja")
    # 8. struktura sadržajnih strana: naslov 25 pt Comfortaa, okvir za roditelja, zaglavlje
    for i in range(4, 18):
        p = d[i - 1]; sp = list(tekst_spanovi(p))
        if not any("Comfortaa" in s["font"] and abs(s["size"] - 25) < 0.2 for s in sp): greska(f"strana {i}: nema naslova (Comfortaa 25)")
        if not any(abs(s["size"] - 9.8) < 0.1 and s["bbox"][1] > 740 for s in sp): greska(f"strana {i}: nema teksta u okviru za roditelja")
        if not any(s["text"].startswith("МАЛА ИСТРАЖИВАЧКА") for s in sp): greska(f"strana {i}: nema zaglavlja")
    info("strukture strana 4 do 17: naslov, zaglavlje, okvir za roditelja")
    # 9. pečati: prečnik pečata staje u unutrašnji krug sa table
    unutra = [dr["rect"].width for dr in d[2].get_drawings() if dr.get("dashes") and "1.6" in str(dr.get("dashes")) and abs(dr["rect"].width - dr["rect"].height) < 0.1]
    pecati = [dr["rect"].width + dr.get("width", 0) for dr in d[17].get_drawings() if dr.get("width") and abs(dr.get("width") - 2.2) < 0.05 and abs(dr["rect"].width - dr["rect"].height) < 0.1 and 50 < dr["rect"].width < 70]
    if len(unutra) != 5 or len(pecati) != 5: greska(f"pečati: {len(unutra)} krugova na tabli, {len(pecati)} pečata na listu (treba 5 i 5)")
    else:
        for a, b in zip(unutra, pecati):
            if not (b <= a - 0.9 <= b + 3.5): greska(f"pečat {b:.1f} ne staje tačno u krug {a:.1f}")
        info(f"pečati: 5 krugova {unutra[0]:.1f} pt, 5 pečata {pecati[0]:.1f} pt, staju")
    # 10. zadaci
    def slike_na(i): return len(d[i - 1].get_image_info())
    for k, z in Z.items():
        v = z["vrsta"]
        if v in ("izbor", "brojanje", "sabiranje", "oduzimanje"):
            o = z["opcije"]
            if len(set(o)) != len(o) or len(o) < 2: greska(f"strana {k}: opcije nisu različite")
            if not (0 <= z["tacno"] < len(o)): greska(f"strana {k}: tačan odgovor van opcija")
        if v == "brojanje":
            if z["opcije"][z["tacno"]] != z["n"]: greska(f"strana {k}: tačan odgovor nije broj predmeta")
            if slike_na(k) != z["n"]: greska(f"strana {k}: nacrtano {slike_na(k)} slika, a treba {z['n']}")
        if v == "sabiranje":
            if z["a"] + z["b"] != z["opcije"][z["tacno"]]: greska(f"strana {k}: zbir ne odgovara tačnom odgovoru")
            if slike_na(k) != z["a"] + z["b"]: greska(f"strana {k}: nacrtano {slike_na(k)} slika, treba {z['a'] + z['b']}")
        if v == "oduzimanje":
            if z["a"] - z["b"] != z["opcije"][z["tacno"]]: greska(f"strana {k}: razlika ne odgovara tačnom odgovoru")
            if slike_na(k) != z["a"]: greska(f"strana {k}: nacrtano {slike_na(k)} slika, treba {z['a']}")
        if v == "niz":
            for r in z["redovi"]:
                jed, niz = r["jedinica"], r["niz"]; pokaz = [x for x in niz if x]
                if niz[-1] is not None: greska(f"strana {k}: poslednje polje mora biti prazno")
                if len(pokaz) < 2 * len(jed): greska(f"strana {k}: niz se ne ponavlja dvaput pre praznog polja")
                if any(x != jed[j % len(jed)] for j, x in enumerate(pokaz)): greska(f"strana {k}: niz ne prati pravilo")
                sledece = jed[len(pokaz) % len(jed)]; tacni = [j for j, o in enumerate(r["opcije"]) if o == sledece]
                if tacni != [r["tacno"]]: greska(f"strana {k}: nema tačno jednog tačnog odgovora u nizu {niz}")
                if len(set(r["opcije"])) != len(r["opcije"]): greska(f"strana {k}: opcije niza nisu različite")
        if v == "put":
            blok = set(map(tuple, z["blokirana"])); st, ci = tuple(z["start"]), tuple(z["cilj"]); n = 0
            def dfs(c, vid):
                global_n = 0
                if c == ci: return 1
                t = 0
                for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    q = (c[0] + dr, c[1] + dc)
                    if 0 <= q[0] < 3 and 0 <= q[1] < 3 and q not in blok and q not in vid: t += dfs(q, vid | {q})
                return t
            n = dfs(st, {st})
            if n != 1: greska(f"strana {k}: u mreži ima {n} puteva (treba tačno 1)")
            else: info(f"strana {k}: u mreži postoji tačno 1 put")
        if v == "plan":
            r, c = z["start"]
            for sm, br in z["koraci"]:
                for _ in range(br): r, c = (r, c + 1) if sm == "d" else (r - 1, c) if sm == "g" else (r, c)
            if z["mreza"][(r, c)] != z["cilj_slika"]: greska(f"strana {k}: plan ne vodi do ({z['cilj_slika']})")
            if len(set(z["mreza"].values())) != 9: greska(f"strana {k}: predmeti u mreži nisu svi različiti")
        if v == "redosled":
            if sorted(z["redni_brojevi"]) != [1, 2, 3]: greska(f"strana {k}: redosled nije permutacija")
            if z["redni_brojevi"] == [1, 2, 3]: greska(f"strana {k}: slike nisu izmešane")
        if v == "razvrstavanje":
            from collections import Counter
            if Counter(g for _, g in z["stavke"]) != Counter({g: 3 for g in z["grupe"]}): greska(f"strana {k}: grupe nisu uravnotežene")
        if v == "kopiranje":
            for dl in z["delovi"]:
                if len(set(dl["slike"])) != len(dl["slike"]) or len(dl["slike"]) != dl["kolone"] * dl["redovi"]: greska(f"strana {k}: raspored za kopiranje nije jednoznačan")
    # položaj tačnog odgovora: nikad tri zaredom isti, ne sve u sredini
    poz = []
    for k in sorted(Z):
        z = Z[k]
        if "tacno" in z: poz.append(z["tacno"])
        if z["vrsta"] == "niz": poz += [r["tacno"] for r in z["redovi"]]
    info("položaji tačnih odgovora: " + str(poz))
    for a, b, c in zip(poz, poz[1:], poz[2:]):
        if a == b == c: greska("tri tačna odgovora zaredom na istom mestu")
    if poz and all(p == 1 for p in poz): greska("svi tačni odgovori su u sredini")
    print()
    if GRESKE:
        print(f"GREŠKE ({len(GRESKE)}):"); [print(" - " + g) for g in GRESKE]; return 1
    print("SVE PROVERE PROŠLE"); return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
