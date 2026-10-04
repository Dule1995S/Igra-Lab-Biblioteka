#!/usr/bin/env bash
# Izvlači ilustracije iz PDF-a „Mali detektiv: Ko je ko? 1“. Upotreba: ./extract-assets.sh /putanja/do/Mali_detektiv_Ko_je_ko_1.pdf
set -euo pipefail
PDF="${1:?putanja do PDF-a}"
HERE="$(cd "$(dirname "$0")" && pwd)"; TOOLS="$HERE/../../tools"; OUT="$HERE/assets"; T="$(mktemp -d)"
mkdir -p "$OUT"
seg() { "$TOOLS/segment.sh" "$PDF" "$1" "$T" "$2" >/dev/null; }
cut_() { "$TOOLS/cut.sh" "$PDF" "$1" "$T" "${@:2}"; mv "$T"/*.png "$OUT"/ 2>/dev/null || true; rm -f "$OUT"/seg-p*.png; }

seg 4 10;  cut_ 4  macka1=5 macka2=3 macka3=4
seg 5 10;  cut_ 5  dete1=5 dete2=3 dete3=2
seg 8 10;  cut_ 8  puz1=5 puz2=8 puz3=6
seg 9 2;   cut_ 9  kuca1=2 kuca2=3 kuca3=4
seg 11 10; cut_ 11 pas1=6 pas2=2 pas3=3 pas4=5
seg 7 10;  cut_ 7  torta1=2 torta2=4 torta3=3
rm -rf "$T"
