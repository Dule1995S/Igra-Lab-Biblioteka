#!/usr/bin/env python3
"""Piše katalog.md (spisak strana, zadataka i tačnih odgovora) iz zadaci.py. Upotreba: python3 katalog.py ../katalog.md"""
import sys
from zadaci import ZADACI as Z

STRANE = [  # strana, naslov, stanica, tačkice, šta, stara strana
 (1, "Naslovna", "", "", "logo, naslov, podnaslov sa uzrastom, ilustracija u okviru, „Ova knjižica je od“", "1"),
 (2, "Za roditelja", "", "", "pismo, četiri koraka igre, pravila misije, šta vam treba, podela uloga", "2, 3, 16 (spojeno)"),
 (3, "Moja misija", "", "", "tabla napretka u obliku lista, 5 krugova, VEŽBA i SAD TI", "3 (mapa)"),
 (4, "Šta nosimo u misiju?", "Posmatranje", 1, "SAD TI: izbor tri predmeta (otvoreno)", "4"),
 (5, "Posmatraj list", "Posmatranje", 1, "VEŽBA: u čemu se razlikuju + SAD TI: nacrtaj srednji list", "5"),
 (6, "Priroda ili napravljeno", "Posmatranje", 2, "VEŽBA: razvrstavanje 6 predmeta + SAD TI", "9"),
 (7, "Koliko listova vidiš?", "Količina", 1, "VEŽBA: brojanje + SAD TI", "6"),
 (8, "Spoji dva skupa", "Količina", 2, "VEŽBA: 4 i 3 zajedno + SAD TI", "7"),
 (9, "Dva kamena su sklonjena", "Količina", 3, "VEŽBA: 8 minus 2 (prvo precrtaj) + SAD TI", "8"),
 (10, "Nastavi niz", "Prostor i niz", 1, "VEŽBA: dva niza (AB i ABC) + SAD TI: svoj niz", "10"),
 (11, "Pronađi put u mreži", "Prostor i niz", 2, "VEŽBA: put kroz mrežu, tačno jedan put", "11"),
 (12, "Prati kratak plan", "Prostor i niz", 2, "VEŽBA: plan od dva dela + SAD TI: svoj plan", "12"),
 (13, "Napravi isti raspored", "Prostor i niz", 3, "VEŽBA: kopiranje rasporeda 2x2 i 2x3", "13"),
 (14, "Istraživač graditelj", "Priča i saradnja", 2, "VEŽBA: koliko kocki + SAD TI: moja građevina", "14"),
 (15, "Misija ima priču", "Priča i saradnja", 2, "VEŽBA: redosled slika + SAD TI: bezbedan plan", "15"),
 (16, "Putujemo polako", "Krećemo se", "", "IGRA POKRETA: tri mirna koraka i pauza", "17 (bonus)"),
 (17, "Nađi i ispričaj", "Krećemo se", "", "IGRA POKRETA: tri predmeta i priča", "18 (bonus)"),
 (18, "Nalepnice", "Kraj", "", "5 pečata (staju u krugove sa table) i 18 nagrada", "novo"),
 (19, "Diploma", "Kraj", "", "diploma, ime, datum, uspomena, moje novo pitanje", "19, 20"),
 (20, "Klub", "Kraj", "", "kod MISIJA20, naslovi za isti uzrast, bez adrese sajta", "novo"),
]
def odg(k):
    z = Z.get(k)
    if not z: return "otvoreno, nema tačnog odgovora" if k in (4,) else "bez ocene"
    v = z["vrsta"]
    if "opcije" in z: return f"{z['opcije'][z['tacno']]} (opcija {z['tacno'] + 1} od {len(z['opcije'])})"
    if v == "niz": return "; ".join(f"{r['opcije'][r['tacno']]} (opcija {r['tacno'] + 1})" for r in z["redovi"])
    if v == "put": return "gore, gore, desno, desno (jedini put)"
    if v == "plan": return "list (dva polja desno, dva gore)"
    if v == "redosled": return "redom odozgo: " + ", ".join(map(str, z["redni_brojevi"])) + " (početak, problem, kraj)"
    if v == "razvrstavanje": return "priroda: list, cvet, kamen; ljudi prave: sveska, olovka, boca"
    if v == "kopiranje": return "isti predmet na istom mestu"
    return ""
out = ["# Katalog: Mala istraživačka misija 5+ (redizajn)\n", "Jedan izvor istine za zadatke je `izvorni-kod/zadaci.py`. Ovaj fajl se piše skriptom `katalog.py`.\n",
       "| Strana | Naslov | Stanica | Težina | Šta je na strani | Tačan odgovor | Stara strana |", "|---|---|---|---|---|---|---|"]
for n, t, st, tk, sta, old in STRANE:
    out.append(f"| {n} | {t} | {st} | {'●' * tk + '○' * (3 - tk) if tk else ''} | {sta} | {odg(n) if 4 <= n <= 15 else ''} | {old} |")
open(sys.argv[1], "w").write("\n".join(out) + "\n")
