"""Provere gotove bojanke prema pravilima redizajna (strane, A4, fontovi, crtice, zabranjene reči, latinica, broj strane,
muški rod, zona 10 mm, raster do 150 dpi, linijski crteži na belom, Lisko samo gde sme, tačkice težine, pečati u krugovima)
i pisanje kataloga."""
import re, json, os
import pymupdf

A4 = (595.276, 841.89); ZONA = 10 * 72 / 25.4
LATINICA_DOZVOLJENA = {"IGRA", "LAB", "@igralab"}
# radna lista (nije dobijena od vlasnika): dopuniti prema stvarnom spisku
ZABRANJENO = ["бесплатно", "гаранциј", "најбољ", "дијагноз", "терапиј", "лечи", "поремећај", "хиперактив", "аутизам", "дислекси"]

def _spanovi(p):
    for b in p.get_text("dict")["blocks"]:
        for l in b.get("lines", []):
            for s in l["spans"]:
                if s["text"].strip(): yield s

def _narandzasta(f): return f and abs(f[0] - 0.894) < 0.01 and abs(f[1] - 0.392) < 0.01 and abs(f[2] - 0.169) < 0.01

def proveri(pdf, K):
    G = []; g = G.append
    d = pymupdf.open(pdf); print(f"Provera: {os.path.basename(pdf)}")
    if len(d) != 20: g(f"broj strana {len(d)} (treba 20)")
    for i, p in enumerate(d, 1):
        if abs(p.rect.width - A4[0]) > 0.6 or abs(p.rect.height - A4[1]) > 0.6: g(f"strana {i}: nije A4")
        for f in p.get_fonts(full=True):
            if not any(x in f[3] for x in ("Comfortaa", "Andika")): g(f"strana {i}: font {f[3]} nije dozvoljen")
            elif not d.extract_font(f[0])[3]: g(f"strana {i}: font {f[3]} nije ugrađen")
        txt = p.get_text()
        for m in re.finditer(r"[–—‒―−]|(?<=\S) - (?=\S)|(?<=[а-яА-Я])-(?=[а-яА-Я])", txt): g(f"strana {i}: crtica: {txt[max(0, m.start()-15):m.end()+15]!r}")
        for z in ZABRANJENO:
            if z in txt.lower(): g(f"strana {i}: zabranjena reč {z}")
        for w in re.findall(r"[A-Za-z@][A-Za-z@]*", txt):
            if w not in LATINICA_DOZVOLJENA: g(f"strana {i}: latinica: {w}")
        for w in re.findall(r"\b[а-яА-ЯјЈљЉњЊћЋџЏђЂ]{3,}(?:ао|ио|ео)\b", txt): g(f"strana {i}: muški rod: {w}")
        if "4+" in txt and i == 1: g("naslovna ima značku uzrasta 4+")
        sp = list(_spanovi(p))
        num = [s for s in sp if s["text"].strip() == str(i) and s["bbox"][1] > 780]
        if (i == 1) == bool(num): g(f"strana {i}: broj strane {'postoji na naslovnoj' if i == 1 else 'nedostaje'}")
        for s in sp:
            x0, y0, x1, y1 = s["bbox"]; sz = s["size"]
            if x0 < ZONA - .5 or y0 + sz * .28 < ZONA - .5 or x1 > A4[0] - ZONA + .5 or y1 - sz * .2 > A4[1] - ZONA + .5: g(f"strana {i}: tekst u zoni 10 mm: {s['text'][:20]}")
        for dr in p.get_drawings():
            r = dr["rect"]
            if r.width * r.height > 0.9 * A4[0] * A4[1]: continue
            if r.x0 < ZONA - .5 or r.y0 < ZONA - .5 or r.x1 > A4[0] - ZONA + .5 or r.y1 > A4[1] - ZONA + .5: g(f"strana {i}: crtež u zoni 10 mm {tuple(round(v) for v in r)}")
        for im in p.get_image_info():
            b = im["bbox"]; w, h = b[2] - b[0], b[3] - b[1]
            if im["width"] / (w / 72) > 150.6: g(f"strana {i}: slika preko 150 dpi")
            if abs((im["width"] / im["height"]) / (w / h) - 1) > 0.01: g(f"strana {i}: slika razvučena ili isečena")
            if b[0] < ZONA - .5 or b[1] < ZONA - .5 or b[2] > A4[0] - ZONA + .5 or b[3] > A4[1] - ZONA + .5: g(f"strana {i}: slika u zoni 10 mm")
        # Lisko: logo (1, 20), okvir za roditelja, i stranice koje knjiga dozvoljava
        for dr in p.get_drawings():
            if _narandzasta(dr.get("fill")) and dr["rect"].width * dr["rect"].height > 200:
                r = dr["rect"]; ok = (r.y0 > 735 and r.x0 > 500) or (i in (1, 20) and r.width < 45 and r.width * r.height < 2000) or i in K["lisko_strane"]
                if not ok: g(f"strana {i}: Lisko van dozvoljenih mesta")
        if 4 <= i <= 17:
            if not any("Comfortaa" in s["font"] and abs(s["size"] - 25) < .2 for s in sp): g(f"strana {i}: nema naslova")
            if not any(abs(s["size"] - 9.8) < .1 and s["bbox"][1] > 740 for s in sp): g(f"strana {i}: nema okvira za roditelja")
            if not any(_narandzasta(dr.get("fill")) and dr["rect"].y0 > 735 for dr in p.get_drawings()): g(f"strana {i}: nema Liska u okviru za roditelja")
            imgs = p.get_image_info(xrefs=True)
            if len(imgs) != 1: g(f"strana {i}: treba tačno jedan linijski crtež, ima {len(imgs)}")
            for im in imgs:
                if im.get("colorspace", 1) != 1: g(f"strana {i}: linijski crtež nije na belom (crno-beli)")
            tk = [dr for dr in p.get_drawings() if dr["rect"].y1 < 40 and dr["rect"].x0 > 380 and dr["rect"].width < 5]
            if len(tk) != 3: g(f"strana {i}: nema tri tačkice težine")
    # pečati staju u krugove sa table
    unutra = [dr["rect"].width for dr in d[2].get_drawings() if dr.get("dashes") and "1.6" in str(dr.get("dashes")) and abs(dr["rect"].width - dr["rect"].height) < .1]
    pecati = [dr["rect"].width + dr.get("width", 0) for dr in d[17].get_drawings() if dr.get("width") and abs(dr["width"] - 2.2) < .05 and abs(dr["rect"].width - dr["rect"].height) < .1 and 50 < dr["rect"].width < 70]
    if len(unutra) != 4 or len(pecati) != 4: g(f"pečati: {len(unutra)} krugova na tabli, {len(pecati)} pečata (treba 4 i 4)")
    elif not all(b <= a - 0.9 <= b + 3.5 for a, b in zip(unutra, pecati)): g("pečat ne staje tačno u krug")
    print(f"  strana {len(d)}, provereno: A4, fontovi, crtice, zabranjene reči, latinica, broj strane, muški rod, zona 10 mm, dpi, Lisko, tačkice, pečati")
    if G:
        print(f"GREŠKE ({len(G)}):"); [print(" - " + x) for x in G]; return 1
    print("SVE PROVERE PROŠLE"); return 0

def katalog(K, put):
    polja = json.load(open(os.path.join(K["ilustracije"], "polja.json")))
    import bojanka; bojanka.pripremi_strane(K, polja)
    out = [f"# Katalog: {K['naziv']} 4+ (redizajn)\n", "| Strana | Naslov | Celina | Težina (polja) | Dodaj svoju ideju | Stara strana |", "|---|---|---|---|---|---|",
           "| 1 | Naslovna | | | | 1 |", "| 2 | Za roditelja | | | | 2 |", "| 3 | " + K["tabla_naslov"].capitalize() + " (tabla) | | | | novo |"]
    for s in K["strane"]:
        out.append(f"| {s['broj']} | {s['naslov']} | {s['celina']} | {'●' * s['tacke']}{'○' * (3 - s['tacke'])} ({s['polja']}) | {s['zadatak']} | {s['stara']} |")
    out += ["| 18 | Nalepnice | | | | novo |", "| 19 | Diploma | | | | 20 |", "| 20 | Klub | | | | 20 (kupon) |", "",
            "Izostavljene stare strane (da bi knjiga ostala na 20 strana sa tablom, nalepnicama i klubom):", ""]
    out += [f"- strana {n}: {t}" for n, t in K["izostavljeno"]]
    open(put, "w").write("\n".join(out) + "\n")
