#!/usr/bin/env bash
# Iseca crteže u providni PNG (belo van crteža se briše). Upotreba:
#   ./cut.sh knjizica.pdf strana izlazni_folder ime=broj ime=broj:uvlacenje ime=@x,y,w,h ime=@x,y,w,h~flop ...
#   broj        = redni broj okvira iz segment.sh (seg-p<strana>.txt)
#   broj:N      = isti okvir, ali sužen za N piksela sa svake strane (npr. crtež unutar kartice)
#   @x,y,w,h    = ručno zadat okvir (koordinate slike širine 827 px)
#   ~flop       = na kraju: spoji okvir sa njegovim ogledalom (od polovine napravi celinu)
set -euo pipefail
PDF="$1"; P="$2"; OUT="$3"; shift 3
SEG="$OUT/seg-p$P.txt"; T="$(mktemp -d)"; S=3.0; M=6
pdftoppm -r 300 -png -f "$P" -l "$P" "$PDF" "$T/p"; F=$(ls "$T"/p-*.png | head -1)
for kv in "$@"; do
  name="${kv%%=*}"; spec="${kv#*=}"; flop=0
  [[ "$spec" == *"~flop" ]] && { flop=1; spec="${spec%~flop}"; }
  if [[ "$spec" == @* ]]; then IFS=, read -r x y w h <<< "${spec#@}"; inset=0; m=0
  else
    num="${spec%%:*}"; inset=0; [[ "$spec" == *:* ]] && inset="${spec##*:}"
    read -r _ x y w h < <(awk -v n="$num" '$1==n' "$SEG"); m=$M
    x=$((x+inset)); y=$((y+inset)); w=$((w-2*inset)); h=$((h-2*inset))
  fi
  x=$(awk "BEGIN{printf \"%d\",$x*$S-$m}"); y=$(awk "BEGIN{printf \"%d\",$y*$S-$m}"); w=$(awk "BEGIN{printf \"%d\",$w*$S+2*$m}"); h=$(awk "BEGIN{printf \"%d\",$h*$S+2*$m}")
  convert "$F" -crop ${w}x${h}+${x}+${y} +repage "$T/c.png"
  [[ $flop == 1 ]] && convert "$T/c.png" \( +clone -flop \) +append "$T/c.png"
  convert "$T/c.png" -bordercolor white -border 3 -fuzz 14% -fill none -draw 'color 0,0 floodfill' -trim +repage \
    -resize 'x300>' -define png:compression-level=9 "$OUT/$name.png"
done
rm -rf "$T"
