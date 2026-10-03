#!/usr/bin/env bash
# Izvlači ilustracije iz PDF-a „Čuvam prirodu“. Upotreba: ./extract-assets.sh /putanja/do/Cuvam_prirodu.pdf
set -euo pipefail
PDF="${1:?putanja do PDF-a}"
HERE="$(cd "$(dirname "$0")" && pwd)"; TOOLS="$HERE/../../tools"; OUT="$HERE/assets"; T="$(mktemp -d)"
mkdir -p "$OUT"
seg() { "$TOOLS/segment.sh" "$PDF" "$1" "$T" "$2" >/dev/null; }
cut_() { "$TOOLS/cut.sh" "$PDF" "$1" "$T" "${@:2}"; mv "$T"/*.png "$OUT"/ 2>/dev/null || true; rm -f "$OUT"/seg-p*.png; }

seg 4 14;  cut_ 4  tegla4=7 limenka=4 kora=8 casa=3 knjiga=18 cvet=6
seg 8 14;  cut_ 8  novine=6 kutija=3 pismo=4 flasa=11 kesa=5 tegla=7
seg 12 14; cut_ 12 kap=15 kanta=12
seg 16 14; cut_ 16 olovka=9 robot=3
seg 20 14; cut_ 20 klica=5:14 gomila=7:14 cvetak=3:14
seg 26 14; cut_ 26 pcela=13 bubamara=4 leptir=15 zaba=10 zalud=17 list=19
seg 25 14; cut_ 25 drvo=@270,276,139,388~flop
rm -f "$OUT/tegla4.png"
rm -rf "$T"
