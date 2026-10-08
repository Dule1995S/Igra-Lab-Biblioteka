#!/usr/bin/env python3
"""Zajednički pokretač za bojanke. Iz foldera izvorni-kod jedne knjige:
  python3 gradi.py aseti STARI.pdf      izvuče i pripremi asete u ../../ILUSTRACIJE
  python3 gradi.py pdf [IZLAZ.pdf]       izgradi PDF (podrazumevano u ../ sa imenom iz knjiga.py) i pokrene proveru
  python3 gradi.py katalog               napiše ../katalog.md"""
import sys, os, importlib

def main(knjiga_mod, argv):
    K = knjiga_mod.K
    import bojanka, bojenje, provera
    if argv and argv[0] == "aseti":
        bojenje.pripremi(argv[1], {s["stara"]: s["crtez"] for s in K["strane"]}, K["ilustracije"]); return 0
    if argv and argv[0] == "katalog":
        provera.katalog(K, os.path.join(K["finalno"], "katalog.md")); return 0
    izlaz = argv[1] if len(argv) > 1 else os.path.join(K["finalno"], K["pdf_ime"])
    bojanka.gradi(K, izlaz)
    print("PDF:", izlaz)
    return provera.proveri(izlaz, K)
