#!/usr/bin/env bash
# Izvlači ilustracije iz PDF-a „Nauka kod kuće“. Upotreba: ./extract-assets.sh /putanja/do/Nauka_kod_kuce.pdf
set -euo pipefail
PDF="${1:?putanja do PDF-a}"
HERE="$(cd "$(dirname "$0")" && pwd)"; TOOLS="$HERE/../../tools"; OUT="$HERE/assets"; T="$(mktemp -d)"
mkdir -p "$OUT"
seg() { "$TOOLS/segment.sh" "$PDF" "$1" "$T" "$2" >/dev/null; }
cut_() { "$TOOLS/cut.sh" "$PDF" "$1" "$T" "${@:2}"; mv "$T"/*.png "$OUT"/ 2>/dev/null || true; rm -f "$OUT"/seg-p*.png; }

seg 6 14;  cut_ 6  pero=7 list=8 flasa=11 kljuc=6 kamen=5 novcic=9
seg 12 14; cut_ 12 kasika=20 lupa=9 termometar=13 balon=15 kap=14 solja=10
seg 13 14; cut_ 13 lampa=6
seg 16 14; cut_ 16 ekser=34 spajalica=25
seg 20 14; cut_ 20 sunce=15 led=9 svecja=13 pahulja=4 snesko=7
seg 10 14; cut_ 10 balon2=10 zmaj=6 pero2=7 list2=5
seg 27 14; cut_ 27 vaga=2
seg 3 14;  cut_ 3  mikroskop=11
rm -rf "$T"
