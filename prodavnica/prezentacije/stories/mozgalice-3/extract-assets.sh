#!/usr/bin/env bash
# Izvlači ilustracije iz PDF-a „Mozgalice 3“. Upotreba: ./extract-assets.sh /putanja/do/Mozgalice_3_godine.pdf
set -euo pipefail
PDF="${1:?putanja do PDF-a}"
HERE="$(cd "$(dirname "$0")" && pwd)"; TOOLS="$HERE/../../tools"; OUT="$HERE/assets"; T="$(mktemp -d)"
mkdir -p "$OUT"
seg() { "$TOOLS/segment.sh" "$PDF" "$1" "$T" "$2" >/dev/null; }
cut_() { "$TOOLS/cut.sh" "$PDF" "$1" "$T" "${@:2}"; mv "$T"/*.png "$OUT"/ 2>/dev/null || true; rm -f "$OUT"/seg-p*.png; }

seg 4 8; cut_ 4 macka=6 riba=8 leptir=3
# slike za igru „šta je drugačije“ (druga slika ima razlike); okvir sa strane: x y w h u koordinatama slike od 827 px
"$TOOLS/diffs.py" "$PDF" 54 "$OUT" razlike54 83 235 665 449 > /dev/null
"$TOOLS/diffs.py" "$PDF" 56 "$OUT" razlike56 83 235 665 449 > /dev/null
rm -f "$OUT"/*_check.png
rm -rf "$T"
