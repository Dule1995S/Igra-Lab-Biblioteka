#!/usr/bin/env bash
# Izvlači ilustracije iz PDF-a „Pod morem“. Upotreba: ./extract-assets.sh /putanja/do/Pod_morem.pdf
set -euo pipefail
PDF="${1:?putanja do PDF-a}"
HERE="$(cd "$(dirname "$0")" && pwd)"; TOOLS="$HERE/../../tools"; OUT="$HERE/assets"; T="$(mktemp -d)"
mkdir -p "$OUT"
seg() { "$TOOLS/segment.sh" "$PDF" "$1" "$T" "$2" >/dev/null; }
cut_() { "$TOOLS/cut.sh" "$PDF" "$1" "$T" "${@:2}"; mv "$T"/*.png "$OUT"/ 2>/dev/null || true; rm -f "$OUT"/seg-p*.png; }

seg 10 14; cut_ 10 riba=6 delfin=9 ajkula=10 kornjaca=7
seg 12 14; cut_ 12 hobotnica=@492,302,95,105 meduza=@492,539,95,144
seg 16 14; cut_ 16 skoljka=4 koral=7 sidro=8 zvezda=9
seg 20 14; cut_ 20 kit=12 rak=4 konjic=8
seg 24 14; cut_ 24 led=9 camac=6 jedrilica=8 sidro2=11 kamen=7
rm -rf "$T"
