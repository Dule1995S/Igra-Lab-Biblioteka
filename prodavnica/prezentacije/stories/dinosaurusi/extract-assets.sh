#!/usr/bin/env bash
# Izvlači ilustracije iz PDF-a „Dinosaurusi“. Upotreba: ./extract-assets.sh /putanja/do/Dinosaurusi.pdf
set -euo pipefail
PDF="${1:?putanja do PDF-a}"
HERE="$(cd "$(dirname "$0")" && pwd)"; TOOLS="$HERE/../../tools"; OUT="$HERE/assets"; T="$(mktemp -d)"
mkdir -p "$OUT"
seg() { "$TOOLS/segment.sh" "$PDF" "$1" "$T" "$2" >/dev/null; }   # strana, debljina spajanja
cut_() { "$TOOLS/cut.sh" "$PDF" "$1" "$T" "${@:2}"; mv "$T"/*.png "$OUT"/ 2>/dev/null || true; rm -f "$OUT"/seg-p*.png; }

seg 4 14;  cut_ 4  trex=9 triceratops=10 stegosaurus=16 brachiosaurus=17 parasaurolophus=18 ankylosaurus=14
seg 12 14; cut_ 12 velociraptor=6 spinosaurus=8
seg 18 14; cut_ 18 pteranodon=7 plesiosaur=11 ptica=6
seg 21 14; cut_ 21 amonit=3
seg 8 4;   cut_ 8  jaje=4
seg 3 14;  cut_ 3  gnezdo=10
rm -rf "$T"
