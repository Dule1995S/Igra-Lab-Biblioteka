#!/usr/bin/env python3
"""Aseti naslova: izvlači rasterske slike iz starog PDF-a, beli okvir pretvara u providan (samo spoljna bela,
unutrašnja ostaje) i seče na ivicu predmeta. Proverava da nijedan predmet nije odsečen (dodiruje ivicu izvorne slike).
Upotreba: python3 aseti.py STARI.pdf IZLAZ_FOLDER"""
import sys, os, collections
import numpy as np
import pymupdf
from PIL import Image, ImageFilter

# xref u starom PDF-u -> ime asseta (jedan izvor slika po naslovu)
IMENA = {26: "lupa", 27: "sveska", 28: "boca", 29: "list", 30: "lopta", 31: "knjiga", 40: "kamen", 43: "cvet",
         44: "olovka", 49: "kocka", 58: "zmaj1", 59: "zmaj2", 60: "zmaj3", 19: "porodica"}
CELA_SLIKA = {"zmaj1", "zmaj2", "zmaj3"}       # scene sa zaobljenim okvirom, okvir je deo slike
THR = 236                                       # "bela" pozadina (JPEG šum)

def providno(im):
    a = np.asarray(im.convert("RGB")).astype(np.int16)
    white = (a.min(axis=2) >= THR)
    h, w = white.shape
    out = np.zeros_like(white)                  # bela povezana sa ivicom slike
    stack = [(y, x) for y in range(h) for x in (0, w - 1)] + [(y, x) for x in range(w) for y in (0, h - 1)]
    while stack:
        y, x = stack.pop()
        if 0 <= y < h and 0 <= x < w and white[y, x] and not out[y, x]:
            out[y, x] = True
            stack += [(y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)]
    m = Image.fromarray((out * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.9))
    alpha = 255 - np.asarray(m).astype(np.int16)
    # ivični pikseli: odvoji belu primesu (prozirnost umesto beline)
    rgba = np.dstack([a.clip(0, 255).astype(np.uint8), np.clip(alpha, 0, 255).astype(np.uint8)])
    return Image.fromarray(rgba, "RGBA"), out

def main(pdf, outdir):
    os.makedirs(outdir, exist_ok=True)
    d = pymupdf.open(pdf); done = set()
    for p in d:
        for im in p.get_images(full=True):
            x = im[0]
            if x in done or x not in IMENA: continue
            done.add(x); ime = IMENA[x]
            pix = pymupdf.Pixmap(d, x)
            if pix.n >= 4: pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
            src = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
            rgba, bg = providno(src)
            bb = rgba.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
            H, W = bg.shape
            if ime not in CELA_SLIKA and ime != "porodica":
                m = 2
                if bb[0] < m or bb[1] < m or bb[2] > W - m or bb[3] > H - m:
                    raise SystemExit(f"ODSECENO: {ime} dodiruje ivicu izvorne slike {bb} u {W}x{H}")
            pad = 3
            bb = (max(0, bb[0] - pad), max(0, bb[1] - pad), min(W, bb[2] + pad), min(H, bb[3] + pad))
            rgba.crop(bb).save(os.path.join(outdir, ime + ".png"), optimize=True)
            print(f"{ime:9} xref {x:3}  {src.size} -> {bb[2]-bb[0]}x{bb[3]-bb[1]}")
    miss = set(IMENA) - done
    if miss: raise SystemExit(f"nedostaju slike: {sorted(miss)}")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
