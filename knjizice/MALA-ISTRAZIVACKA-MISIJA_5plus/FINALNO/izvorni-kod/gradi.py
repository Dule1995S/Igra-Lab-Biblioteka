#!/usr/bin/env python3
"""Gradi PDF. Upotreba: python3 gradi.py [IZLAZ.pdf] [brojevi_strana...]  (bez brojeva: cela knjižica)"""
import sys, os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from stil import *
import strane1

STRANE = {1: ("naslovna", strane1.naslovna), 2: ("za roditelja", strane1.za_roditelja), 3: ("moja misija", strane1.moja_misija)}
try:
    import strane2; STRANE.update(strane2.STRANE)
except ImportError: pass
try:
    import strane3; STRANE.update(strane3.STRANE)
except ImportError: pass

def gradi(izlaz, brojevi=None):
    c = canvas.Canvas(izlaz, pagesize=A4, pageCompression=1, initialFontName="Andika", initialFontSize=10)
    c.setTitle("Мала истраживачка мисија 5+ (IGRA LAB)"); c.setAuthor("IGRA LAB"); c.setSubject("Радни лист за штампу код куће, у боји")
    svi = []
    for n in sorted(STRANE):
        if brojevi and n not in brojevi: continue
        ime, fn = STRANE[n]
        P = Str(c, n); fn(P); P.proveri(); svi.append(P)
        c.showPage()
    c.save(); return svi

if __name__ == "__main__":
    a = sys.argv[1:]; izlaz = a[0] if a and a[0].endswith(".pdf") else "probni.pdf"
    br = [int(x) for x in a if x.isdigit()] or None
    gradi(izlaz, br); print("gotovo:", izlaz)
