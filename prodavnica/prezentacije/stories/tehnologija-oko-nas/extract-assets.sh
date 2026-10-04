#!/usr/bin/env bash
# Izvlači ilustracije iz PDF-a „Tehnologija oko nas“. Upotreba: ./extract-assets.sh /putanja/do/Tehnologija_oko_nas.pdf
set -euo pipefail
PDF="${1:?putanja do PDF-a}"
HERE="$(cd "$(dirname "$0")" && pwd)"; TOOLS="$HERE/../../tools"; OUT="$HERE/assets"; T="$(mktemp -d)"
mkdir -p "$OUT"
seg() { "$TOOLS/segment.sh" "$PDF" "$1" "$T" "$2" >/dev/null; }
cut_() { "$TOOLS/cut.sh" "$PDF" "$1" "$T" "${@:2}"; mv "$T"/*.png "$OUT"/ 2>/dev/null || true; rm -f "$OUT"/seg-p*.png; }

seg 6 14;  cut_ 6  frizider=10 mikser=8 laptop=9 daljinski=11 bicikl=6 odvijac=13
seg 8 14;  cut_ 8  sporet=3 vesmasina=7 lampa=10 sat=9
seg 12 14; cut_ 12 tablet=10 tv=12 laptop2=15 telefon2=4
seg 18 14; cut_ 18 auto=14 bicikl2=4 autobus=9
seg 20 14; cut_ 20 cekic=6 odvijac2=12 klesta=5 metar=9
seg 23 14; cut_ 23 robot=3
seg 24 14; cut_ 24 metla=10 pisaca=4 pesak=3 usisivac=8 tastatura=11 sat2=9 telefon=5 pismo=6
rm -rf "$T"
