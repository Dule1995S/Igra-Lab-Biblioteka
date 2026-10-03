#!/usr/bin/env bash
# Iseca ilustraciju sa naslovne strane. Upotreba: ./cover.sh knjizica.pdf izlaz.jpg x y w h   (koordinate iz segment.sh za stranu 1)
set -euo pipefail
PDF="$1"; OUT="$2"; X="$3"; Y="$4"; W="$5"; H="$6"; T="$(mktemp -d)"
pdftoppm -r 220 -png -f 1 -l 1 "$PDF" "$T/p"
convert "$T"/p-*.png -crop "$(awk "BEGIN{printf \"%dx%d+%d+%d\",($W-8)*2.2,($H-8)*2.2,($X+4)*2.2,($Y+4)*2.2}")" +repage -resize '640x>' -quality 82 "$OUT"
rm -rf "$T"
