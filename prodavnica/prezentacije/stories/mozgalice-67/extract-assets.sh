#!/usr/bin/env bash
# Izvlači slike iz PDF-a „Mozgalice 6–7“. Upotreba: ./extract-assets.sh /putanja/do/Mozgalice_6-7_godina.pdf
set -euo pipefail
PDF="${1:?putanja do PDF-a}"
HERE="$(cd "$(dirname "$0")" && pwd)"; TOOLS="$HERE/../../tools"; OUT="$HERE/assets"; mkdir -p "$OUT"
# razlike (strane 5 i 7): okvir x y w h u koordinatama slike od 827 px; ispis razlika ide u story.mjs
for p in 5 7; do "$TOOLS/diffs.py" "$PDF" $p "$OUT" razlike$p 83 235 665 449 > /dev/null; done
rm -f "$OUT"/*_check.png
# ukrštenica (strana 37): brojevi su iz segment.sh
"$TOOLS/segment.sh" "$PDF" 37 "$OUT" > /dev/null
"$TOOLS/cut.sh" "$PDF" 37 "$OUT" mrav=@108,821,88,60 koala=@246,818,70,62 roda=@378,818,72,64 pile=@510,820,70,62 tigar=11
rm -f "$OUT"/seg-p*.png "$OUT"/seg-p*.txt
