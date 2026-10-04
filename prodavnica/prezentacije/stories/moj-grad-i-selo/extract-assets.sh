#!/usr/bin/env bash
# Izvlači ilustracije iz PDF-a „Moj grad i selo“. Upotreba: ./extract-assets.sh /putanja/do/Moj_grad_i_selo.pdf
set -euo pipefail
PDF="${1:?putanja do PDF-a}"
HERE="$(cd "$(dirname "$0")" && pwd)"; TOOLS="$HERE/../../tools"; OUT="$HERE/assets"; T="$(mktemp -d)"
mkdir -p "$OUT"
seg() { "$TOOLS/segment.sh" "$PDF" "$1" "$T" "$2" >/dev/null; }
cut_() { "$TOOLS/cut.sh" "$PDF" "$1" "$T" "${@:2}"; mv "$T"/*.png "$OUT"/ 2>/dev/null || true; rm -f "$OUT"/seg-p*.png; }

seg 6 14;  cut_ 6  semafor=3 klupa=12 lampa=17 krevet=14 automobil=15 autobus=13 bicikl=16 kuca=7 skola=8 prodavnica=4 ambulanta=5 most=18
seg 8 14;  cut_ 8  vatrogasna=2 traktor=6 camac=5 jedrilica=10 auto2=7 bus2=4
seg 12 14; cut_ 12 pekara=3 posta=6 mleko=9 hleb=8 knjiga=10 pismo=7
seg 20 2;  cut_ 20 klas=1 seme=10 hleb2=4 klica=5
seg 23 14; cut_ 23 saksija=3
seg 3 14;  cut_ 3  manastir=11
seg 24 14; cut_ 24 most2=18 skola2=5 kanta=16 traktor2=6 bicikl2=15 planina=17 kuca2=4
rm -rf "$T"
