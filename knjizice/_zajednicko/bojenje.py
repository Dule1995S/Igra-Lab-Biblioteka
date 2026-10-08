#!/usr/bin/env python3
"""Aseti za bojanke: linijski crtež iz starog PDF-a ostaje na belom (samo se seče na ivicu crteža), proverava se da crtež
nije odsečen, broje se polja za bojenje (za tačkice težine) i pravi se obojena verzija sa providnom pozadinom
(za naslovnu, nalepnice i diplomu), da sve slike budu iz asetâ tog naslova.
Upotreba iz koda: pripremi(stari_pdf, {strana: ime}, izlaz_folder)"""
import os, json, random
import numpy as np
import pymupdf
from PIL import Image, ImageFilter
from scipy import ndimage

PALETA = ["#E53935", "#F6C21C", "#2279DB", "#2FA356", "#7E57C2", "#C98B2E", "#E4642B"]

def _hex(h, svetlije=0.3):
    c = [int(h[i:i + 2], 16) for i in (1, 3, 5)]
    return [round(v + (255 - v) * svetlije) for v in c]

def polja(gray):
    a = np.asarray(gray)
    lab, n = ndimage.label(a >= 128)
    ivica = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    pov = ndimage.sum(np.ones_like(a), lab, index=np.arange(1, n + 1))
    return lab, ivica, pov

def broj_polja(gray):
    lab, ivica, pov = polja(gray); a = np.asarray(gray)
    return int(sum(1 for i, p in enumerate(pov, 1) if i not in ivica and p > 0.0005 * a.size))

def oboji(gray, seme=1):
    """Obojena verzija linijskog crteža: velika polja dobijaju boje iz palete, linije ostaju, pozadina je providna."""
    a = np.asarray(gray).astype(float)
    lab, ivica, pov = polja(gray)
    rng = random.Random(seme); boje = {}; posl = None
    for i in sorted((i for i in range(1, len(pov) + 1) if i not in ivica and pov[i - 1] > 0.0012 * a.size), key=lambda i: -pov[i - 1]):
        izbor = [b for b in PALETA if b != posl]; b = rng.choice(izbor); posl = b
        boje[i] = _hex(b, 0.28)
    idx = ndimage.distance_transform_edt(lab == 0, return_distances=False, return_indices=True)
    bliz = lab[idx[0], idx[1]]
    sloj = np.full(a.shape + (3,), 255.0)
    for i, b in boje.items(): sloj[bliz == i] = b
    rgb = (sloj * (a / 255.0)[..., None]).clip(0, 255).astype(np.uint8)
    poz = np.isin(bliz, list(ivica)) & (a > 200)
    alfa = Image.fromarray(np.where(poz, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
    return Image.fromarray(np.dstack([rgb, np.asarray(alfa)]), "RGBA")

def pripremi(stari_pdf, mapa, izlaz, kvadrat_min=0):
    """mapa: {broj_strane: ime}. Vraća {ime: broj_polja}."""
    os.makedirs(izlaz, exist_ok=True)
    d = pymupdf.open(stari_pdf); tez = {}
    for strana, ime in mapa.items():
        p = d[strana - 1]; slike = sorted(p.get_images(full=True), key=lambda im: -im[2] * im[3])
        pix = pymupdf.Pixmap(d, slike[0][0])
        if pix.alpha or pix.n > 3: pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
        im = Image.frombytes("RGB", (pix.width, pix.height), pix.samples).convert("L")
        a = np.asarray(im); tamno = np.argwhere(a < 200)
        y0, x0 = tamno.min(0); y1, x1 = tamno.max(0); H, W = a.shape; m = 3
        if x0 < m or y0 < m or x1 > W - 1 - m or y1 > H - 1 - m:
            raise SystemExit(f"ODSEČENO: {ime} (strana {strana}) dodiruje ivicu izvorne slike")
        pad = 14
        im = im.crop((max(0, x0 - pad), max(0, y0 - pad), min(W, x1 + pad + 1), min(H, y1 + pad + 1)))
        im = im.point(lambda v: 255 if v > 246 else v)           # čista bela pozadina
        im.save(os.path.join(izlaz, ime + ".png"), optimize=True)
        oboji(im, seme=strana).save(os.path.join(izlaz, ime + "_boja.png"), optimize=True)
        tez[ime] = broj_polja(im)
        print(f"  {ime:22} strana {strana:2}  {im.size[0]}x{im.size[1]}  polja {tez[ime]}")
    json.dump(tez, open(os.path.join(izlaz, "polja.json"), "w"), ensure_ascii=False, indent=1)
    return tez
