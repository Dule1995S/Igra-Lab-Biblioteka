#!/usr/bin/env bash
# Izvlači ilustracije iz PDF-a „Mali detektiv: Ko je ko? 2“. Upotreba: ./extract-assets.sh /putanja/do/Mali_detektiv_Ko_je_ko_2.pdf
set -euo pipefail
PDF="${1:?putanja do PDF-a}"
HERE="$(cd "$(dirname "$0")" && pwd)"; TOOLS="$HERE/../../tools"; OUT="$HERE/assets"; T="$(mktemp -d)"
mkdir -p "$OUT"
seg() { "$TOOLS/segment.sh" "$PDF" "$1" "$T" "$2" >/dev/null; }
cut_() { "$TOOLS/cut.sh" "$PDF" "$1" "$T" "${@:2}"; mv "$T"/*.png "$OUT"/ 2>/dev/null || true; rm -f "$OUT"/seg-p*.png; }

seg 10 6;  cut_ 10 macka=12 pas=6 riba=13 ranac1=4 ranac2=7 ranac3=5
seg 11 6;  cut_ 11 jabuka=13 banana=15 grozdje=4 kapa1=5 kapa2=11 kapa3=6
seg 8 6;   cut_ 8  lopta=3 knjiga=11 bicikl=4 zmaj=5
rm -rf "$T"
