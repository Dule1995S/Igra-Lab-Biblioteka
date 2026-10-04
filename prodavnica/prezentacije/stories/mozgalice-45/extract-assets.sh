#!/usr/bin/env bash
# Izvlači slike za igru „šta je drugačije“ iz PDF-a „Mozgalice 4–5“. Upotreba: ./extract-assets.sh /putanja/do/Mozgalice_4-5_godina.pdf
set -euo pipefail
PDF="${1:?putanja do PDF-a}"
HERE="$(cd "$(dirname "$0")" && pwd)"; TOOLS="$HERE/../../tools"; OUT="$HERE/assets"; mkdir -p "$OUT"
# okvir sa strane: x y w h u koordinatama slike od 827 px; ispis razlika ide u story.mjs
for p in 4 6; do "$TOOLS/diffs.py" "$PDF" $p "$OUT" razlike$p 83 235 665 449 > /dev/null; done
rm -f "$OUT"/*_check.png
