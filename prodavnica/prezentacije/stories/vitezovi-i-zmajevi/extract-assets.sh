#!/usr/bin/env bash
# Izvlači ilustracije iz PDF-a knjižice u assets/ (providni PNG, belo van crteža uklonjeno).
# Upotreba: ./extract-assets.sh /putanja/do/Vitezovi_i_zmajevi.pdf [/putanja/do/Dinosaurusi.pdf]
# Drugi PDF (sledeća knjižica) daje naslovnu ilustraciju za karticu „Sledeća avantura“.
# Koordinate su date za sliku strane širine 827 px (x y w h); skripta ih skalira na 300 dpi.
set -euo pipefail
PDF="${1:?putanja do PDF-a}"
OUT="$(cd "$(dirname "$0")" && pwd)/assets"
TMP="$(mktemp -d)"
mkdir -p "$OUT"
for p in 4 10; do pdftoppm -r 300 -png -f $p -l $p "$PDF" "$TMP/p$p"; done
pdftoppm -r 220 -png -f 1 -l 1 "$PDF" "$TMP/p1"
S=3.0   # 300 dpi / 827 px

icon() { # ime strana x y w h
  local f; f=$(ls "$TMP"/p$2-*.png | head -1)
  local x=$(awk "BEGIN{printf \"%d\",$3*$S}") y=$(awk "BEGIN{printf \"%d\",$4*$S}")
  local w=$(awk "BEGIN{printf \"%d\",$5*$S}") h=$(awk "BEGIN{printf \"%d\",$6*$S}")
  convert "$f" -crop ${w}x${h}+${x}+${y} +repage -bordercolor white -border 3 \
    -fuzz 14% -fill none -draw 'color 0,0 floodfill' -trim +repage \
    -resize 'x300>' -define png:compression-level=9 "$OUT/$1.png"
}

# strana 4 (Šta tu ne pripada)
icon kula 4 290 300 100 147
icon zastava 4 405 315 100 120
icon buktinja 4 528 300 85 147
icon semafor 4 638 300 97 147
icon skrinja 4 288 590 100 105
icon svecja 4 415 555 75 147
icon kljuc 4 520 605 100 55
icon frizider 4 638 565 95 130
icon zamak 4 288 840 105 95
icon konj 4 403 845 100 80
icon sator 4 515 850 100 70
icon automobil 4 636 855 105 60
# strana 10 (Nađi istu)
icon kaciga 10 385 308 98 115
icon kruna 10 258 340 98 56
icon stit 10 508 306 96 118
icon truba 10 634 340 98 50
icon mac 10 518 542 52 156

# naslovna ilustracija (u boji, bez providnosti)
convert "$TMP"/p1-*.png -crop $(awk "BEGIN{printf \"%dx%d+%d+%d\",355*2.2,446*2.2,236*2.2,460*2.2}") +repage \
  -resize '720x>' -quality 82 "$OUT/naslovna.jpg"
if [ -n "${2:-}" ]; then
  pdftoppm -r 220 -png -f 1 -l 1 "$2" "$TMP/d1"
  convert "$TMP"/d1-*.png -crop 1048x906+386+1008 +repage -resize '640x>' -quality 82 "$OUT/sledeca.jpg"
fi
rm -rf "$TMP"
