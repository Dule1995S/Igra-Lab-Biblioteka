#!/usr/bin/env bash
# Izvlači ilustracije iz PDF-a „Životinje sveta“. Upotreba: ./extract-assets.sh /putanja/do/Zivotinje_sveta.pdf
set -euo pipefail
PDF="${1:?putanja do PDF-a}"
HERE="$(cd "$(dirname "$0")" && pwd)"; TOOLS="$HERE/../../tools"; OUT="$HERE/assets"; T="$(mktemp -d)"
mkdir -p "$OUT"
seg() { "$TOOLS/segment.sh" "$PDF" "$1" "$T" "$2" >/dev/null; }
cut_() { "$TOOLS/cut.sh" "$PDF" "$1" "$T" "${@:2}"; mv "$T"/*.png "$OUT"/ 2>/dev/null || true; rm -f "$OUT"/seg-p*.png; }

seg 6 14;  cut_ 6  kokoska=15 petao=9 patka=11 macka=5 krava=17 koza=13 ovca=18 pas=10 mis=12 konj=16
seg 8 14;  cut_ 8  veverica=8 srna=5 lastavica=10 sova=3 slepimis=4 jez=9
seg 12 14; cut_ 12 riba=13 kornjaca=15 zaba=8 zvezda=11 kit=19 delfin=21 riba2=12 foka=14 hobotnica=6
seg 18 14; cut_ 18 lav=5 krokodil=10 tigar=3 lama=8 papagaj=4
seg 24 14; cut_ 24 slon=17 polarni=18 pingvin=6 mis2=15
seg 3 14;  cut_ 3  kitsiv=10
seg 23 14; cut_ 23 bubamara=3
rm -rf "$T"
