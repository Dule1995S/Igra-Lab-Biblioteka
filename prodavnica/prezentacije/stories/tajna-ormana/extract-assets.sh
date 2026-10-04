#!/usr/bin/env bash
# Izvlači ilustracije iz PDF-a „Mali detektiv: Tajna začaranog ormana“. Upotreba: ./extract-assets.sh /putanja/do/Tajna_zacaranog_ormana.pdf
set -euo pipefail
PDF="${1:?putanja do PDF-a}"
HERE="$(cd "$(dirname "$0")" && pwd)"; TOOLS="$HERE/../../tools"; OUT="$HERE/assets"; T="$(mktemp -d)"
mkdir -p "$OUT"
seg() { "$TOOLS/segment.sh" "$PDF" "$1" "$T" "$2" >/dev/null; }
cut_() { "$TOOLS/cut.sh" "$PDF" "$1" "$T" "${@:2}"; mv "$T"/*.png "$OUT"/ 2>/dev/null || true; rm -f "$OUT"/seg-p*.png; }

seg 3 6;  cut_ 3  orman=1
seg 16 6; cut_ 16 orman_otvoren=1 dvoglet=7
seg 7 6;  cut_ 7  kljuc_c=12 katanac=5
seg 8 6;  cut_ 8  kk_krug=6 kk_deteline=3 kk_kvadrat=8 kk_bez=7
seg 15 6; cut_ 15 lupa=8 mapa=7 kljuc=10
rm -rf "$T"
