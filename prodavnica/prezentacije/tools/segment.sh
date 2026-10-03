#!/usr/bin/env bash
# Pomoćni alat: pronađe pojedinačne crteže na strani PDF-a i numeriše ih na slici.
# Upotreba: ./segment.sh knjizica.pdf strana [izlazni_folder] [dilate_px]
# Izlaz: seg-p<strana>.png (označeni okviri, širina 827 px) i seg-p<strana>.txt (broj x y w h u koordinatama te slike).
# Zatim: ./cut.sh knjizica.pdf strana izlazni_folder ime=broj ime=broj ...
set -euo pipefail
PDF="$1"; P="$2"; OUT="${3:-.}"; D="${4:-14}"
mkdir -p "$OUT"; T="$(mktemp -d)"
pdftoppm -r 300 -png -f "$P" -l "$P" "$PDF" "$T/p"
F=$(ls "$T"/p-*.png | head -1)
S=3.0
# slika crno-bela, zatim proširena da se delovi jednog crteža spoje u jednu komponentu
convert "$F" -colorspace Gray -threshold 85% -negate -morphology Dilate "Disk:$D" "$T/m.png"
convert "$T/m.png" -define connected-components:verbose=true -define connected-components:area-threshold=2500 -connected-components 8 null: 2>/dev/null \
 | awk 'NR>1 && $2!="" {split($2,a,/[x+]/); if ($5!="gray(0)" && $5!="srgb(0,0,0)" && $5!="gray(0%)") print a[1],a[2],a[3],a[4]}' > "$T/boxes.txt"
n=0; : > "$OUT/seg-p$P.txt"
cp "$F" "$T/view.png"
convert "$F" -resize 827x "$T/view.png"
args=()
while read -r w h x y; do
  n=$((n+1))
  vx=$(awk "BEGIN{printf \"%d\",$x/$S}"); vy=$(awk "BEGIN{printf \"%d\",$y/$S}"); vw=$(awk "BEGIN{printf \"%d\",$w/$S}"); vh=$(awk "BEGIN{printf \"%d\",$h/$S}")
  echo "$n $vx $vy $vw $vh" >> "$OUT/seg-p$P.txt"
  args+=(-fill none -stroke '#e0245e' -strokewidth 1 -draw "rectangle $vx,$vy $((vx+vw)),$((vy+vh))" -fill '#e0245e' -stroke none -pointsize 13 -draw "text $((vx+2)),$((vy+13)) '$n'")
done < "$T/boxes.txt"
convert "$T/view.png" "${args[@]}" "$OUT/seg-p$P.png"
rm -rf "$T"
echo "$n okvira u $OUT/seg-p$P.png"
