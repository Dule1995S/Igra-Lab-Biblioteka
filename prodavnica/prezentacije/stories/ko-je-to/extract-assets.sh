#!/usr/bin/env bash
# Izvlači ilustracije iz PDF-a „Mali detektiv: Ko je to?“. Upotreba: ./extract-assets.sh /putanja/do/Mali_detektiv_Ko_je_to.pdf
set -euo pipefail
PDF="${1:?putanja do PDF-a}"
HERE="$(cd "$(dirname "$0")" && pwd)"; TOOLS="$HERE/../../tools"; OUT="$HERE/assets"; T="$(mktemp -d)"
mkdir -p "$OUT"
seg() { "$TOOLS/segment.sh" "$PDF" "$1" "$T" "$2" >/dev/null; }
cut_() { "$TOOLS/cut.sh" "$PDF" "$1" "$T" "${@:2}"; mv "$T"/*.png "$OUT"/ 2>/dev/null || true; rm -f "$OUT"/seg-p*.png; }

seg 4 6;  cut_ 4  pas=3 riba=4 zec=2 patka=5
seg 5 6;  cut_ 5  lav=4 konj=2 zirafa=3 slon=5
seg 7 6;  cut_ 7  lane=2 kokoska=3 trag_pas=@145,336,128,128 trag_patka=@145,508,128,128 trag_kokoska=@145,679,128,128 trag_lane=@145,850,128,128
seg 9 6;  cut_ 9  macka=3 mis=5 busen=@96,340,635,462
seg 12 6; cut_ 12 veverica=5 jez=7
seg 10 6; cut_ 10 ograda=@96,336,635,458
seg 13 6; cut_ 13 kljuc=@367,379,82,203 kljuc_krug=@374,646,70,169 kljuc_kvadrat=@374,841,70,170 kljuc_bez=@156,644,69,171
seg 15 6; cut_ 15 lopta=5 jabuka=9 kapa=11 casa=2 knjiga=6
rm -rf "$T"
