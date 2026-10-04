#!/usr/bin/env bash
# Izvlači ilustracije iz PDF-a „Novogodišnje mozgalice“. Upotreba: ./extract-assets.sh /putanja/do/Novogodisnje_mozgalice.pdf
set -euo pipefail
PDF="${1:?putanja do PDF-a}"
HERE="$(cd "$(dirname "$0")" && pwd)"; TOOLS="$HERE/../../tools"; OUT="$HERE/assets"; T="$(mktemp -d)"
mkdir -p "$OUT"
seg() { "$TOOLS/segment.sh" "$PDF" "$1" "$T" "$2" >/dev/null; }
cut_() { "$TOOLS/cut.sh" "$PDF" "$1" "$T" "${@:2}"; mv "$T"/*.png "$OUT"/ 2>/dev/null || true; rm -f "$OUT"/seg-p*.png; }

seg 4 8;  cut_ 4  poklon=4 jelka=9 kugla=12
seg 5 8;  cut_ 5  rukavica=15 klizaljka=5 kapa=7
seg 19 8; cut_ 19 pahulja=6 zvezda=18 sanke=20
seg 34 8; cut_ 34 zvono=13 kugla2=7 zvezda2=16
seg 29 8; cut_ 29 sneg1=@145,270,92,160 sneg2=@363,268,102,162 sneg3=@581,270,102,160 sneg4=@145,475,102,160 sneg5=@363,473,92,162 sneg6=@581,475,102,160
rm -rf "$T"
