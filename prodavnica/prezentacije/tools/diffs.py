#!/usr/bin/env python3
"""Izvlači dve slike za igru „razlike“ sa strane PDF-a i računa gde se razlikuju.
Upotreba: tools/diffs.py knjizica.pdf strana izlazni_folder ime [x y w h]
 - bez okvira: traži dva okvira (prva/druga) kao gornju i donju polovinu najveće grupe na strani
 - rezultat: <ime>_a.png, <ime>_b.png i ispis normalizovanih okvira razlika (x,y,w,h od 0 do 1) u odnosu na sliku b
Razlika = predmet koji u drugoj slici nedostaje, dodat je, ili je drugačije veličine/oblika."""
import subprocess, sys, os, re, tempfile, json, math

pdf, page, out, name = sys.argv[1], int(sys.argv[2]), sys.argv[3], sys.argv[4]
os.makedirs(out, exist_ok=True)
tmp = tempfile.mkdtemp()
subprocess.run(["pdftoppm", "-r", "300", "-png", "-f", str(page), "-l", str(page), pdf, tmp + "/p"], check=True)
png = [f for f in os.listdir(tmp) if f.startswith("p-")][0]; png = os.path.join(tmp, png)
S = 3.0  # 300 dpi / 827 px

def sh(*a): return subprocess.run(a, capture_output=True, text=True).stdout

def boxes(img, dil):
    sh("convert", img, "-colorspace", "Gray", "-threshold", "85%", "-negate", "-morphology", "Dilate", f"Disk:{dil}", tmp + "/m.png")
    o = sh("convert", tmp + "/m.png", "-define", "connected-components:verbose=true", "-define", "connected-components:area-threshold=300", "-connected-components", "8", "null:")
    res = []
    for ln in o.splitlines()[1:]:
        m = re.match(r"\s*\d+:\s+(\d+)x(\d+)\+(\d+)\+(\d+)\s+\S+\s+\d+\s+(\S+)", ln)
        if m and "gray(0)" not in m.group(5) and "srgb(0,0,0)" not in m.group(5) and "gray(0%)" not in m.group(5):
            w, h, x, y = map(int, m.groups()[:4]); res.append((x, y, w, h))
    return res

if len(sys.argv) >= 9:
    X, Y, W, H = [int(float(v) * S) for v in sys.argv[5:9]]
    fy = [(Y, H // 2 - 8), (Y + H // 2 + 8, H // 2 - 8)]
else:
    # najveća grupa unutar stranice (iznad "SAD TI"): gornja/donja polovina
    bs = [b for b in boxes(png, 14) if b[2] > 1500 and b[3] > 1000]
    bs.sort(key=lambda b: -b[2] * b[3]); X, Y, W, H = bs[0]
    fy = [(Y, H // 2 - 8), (Y + H // 2 + 8, H // 2 - 8)]
frames = []
for i, (y0, h0) in enumerate(fy):
    f = f"{out}/{name}_{'ab'[i]}.png"
    sh("convert", png, "-crop", f"{W}x{h0}+{X}+{y0}", "+repage", "-fuzz", "12%", "-fill", "none", "-draw", "color 0,0 floodfill", "-resize", "x420", "-define", "png:compression-level=9", f)
    sh("convert", png, "-crop", f"{W}x{h0}+{X}+{y0}", "+repage", tmp + f"/f{i}.png")
    frames.append((tmp + f"/f{i}.png", W, h0))

# predmeti u obe slike (bez okvira i natpisa: uzimamo samo srednje po veličini)
def items(i):
    img, w, h = frames[i]
    bs = [b for b in boxes(img, 7) if 70 < b[2] < w * 0.5 and 70 < b[3] < h * 0.9 and b[0] > 40 and b[1] > 60]
    return bs, w, h
A, wa, ha = items(0); B, wb, hb = items(1)

def crop_sig(i, b):
    img = frames[i][0]
    sh("convert", img, "-crop", f"{b[2]}x{b[3]}+{b[0]}+{b[1]}", "+repage", "-colorspace", "Gray", "-resize", "48x48!", "-threshold", "70%", tmp + "/c.png")
    return tmp + "/c.png"

def same(ba, bb):
    pa = tmp + "/ca.png"; sh("convert", frames[0][0], "-crop", f"{ba[2]}x{ba[3]}+{ba[0]}+{ba[1]}", "+repage", "-colorspace", "Gray", "-resize", "48x48!", "-threshold", "70%", pa)
    pb = tmp + "/cb.png"; sh("convert", frames[1][0], "-crop", f"{bb[2]}x{bb[3]}+{bb[0]}+{bb[1]}", "+repage", "-colorspace", "Gray", "-resize", "48x48!", "-threshold", "70%", pb)
    r = subprocess.run(["compare", "-metric", "AE", pa, pb, "null:"], capture_output=True, text=True).stderr.strip().split(" ")[0]
    try: return float(r) < 330
    except ValueError: return False

diffs = []; usedA = set()
cx = lambda b: (b[0] + b[2] / 2, b[1] + b[3] / 2)
for bb in B:
    best, bd = None, 1e9
    for i, ba in enumerate(A):
        d = math.hypot(cx(ba)[0] - cx(bb)[0], cx(ba)[1] - cx(bb)[1])
        if d < bd: best, bd = i, d
    if best is None or bd > 0.09 * wb: diffs.append(("dodato", bb)); continue
    ba = A[best]; usedA.add(best)
    ratio = (bb[2] * bb[3]) / max(1, ba[2] * ba[3])
    if ratio > 1.3 or ratio < 0.77 or not same(ba, bb): diffs.append(("promena", bb))
for i, ba in enumerate(A):
    if i not in usedA: diffs.append(("nedostaje", ba))
# izbaci okvire koji su cela unutar većeg (npr. oči mačke)
def inside(a, b): return a[0] >= b[0] - 4 and a[1] >= b[1] - 4 and a[0] + a[2] <= b[0] + b[2] + 4 and a[1] + a[3] <= b[1] + b[3] + 4 and a != b
diffs = [d for d in diffs if not any(inside(d[1], o[1]) for o in diffs)]
res = []
for kind, b in diffs:
    # normalizacija: slika b je rezana na x420 visinu
    sc = 420 / hb
    res.append({"vrsta": kind, "box": [round(b[0] / wb, 3), round(b[1] / hb, 3), round(b[2] / wb, 3), round(b[3] / hb, 3)]})
print(json.dumps({"a": f"{name}_a.png", "b": f"{name}_b.png", "stavki_a": len(A), "stavki_b": len(B), "razlike": res}, ensure_ascii=False))
# slika za proveru: b sa označenim okvirima
chk = f"{out}/{name}_check.png"
args = []
for k, r in enumerate(res):
    x, y, w, h = [v * (wb if i % 2 == 0 else hb) for i, v in enumerate(r["box"])]
    args += ["-fill", "none", "-stroke", "#e0245e", "-strokewidth", "6", "-draw", f"rectangle {x},{y} {x+w},{y+h}", "-fill", "#e0245e", "-stroke", "none", "-pointsize", "70", "-draw", f"text {x+6},{y+66} '{k}'"]
sh("convert", frames[1][0], *args, "-resize", "x420", chk)
