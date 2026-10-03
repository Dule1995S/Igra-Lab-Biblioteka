#!/usr/bin/env bash
# Izvlači ilustracije iz PDF-a „Srbija“. Upotreba: ./extract-assets.sh /putanja/do/Srbija.pdf
set -euo pipefail
PDF="${1:?putanja do PDF-a}"
HERE="$(cd "$(dirname "$0")" && pwd)"; TOOLS="$HERE/../../tools"; OUT="$HERE/assets"; T="$(mktemp -d)"
mkdir -p "$OUT"
seg() { "$TOOLS/segment.sh" "$PDF" "$1" "$T" "$2" >/dev/null; }
cut_() { "$TOOLS/cut.sh" "$PDF" "$1" "$T" "${@:2}"; mv "$T"/*.png "$OUT"/ 2>/dev/null || true; rm -f "$OUT"/seg-p*.png; }

seg 5 14;  cut_ 5  mapa=2 deo1=@107,863,116,110 deo2=@272,863,116,110 deo3=@438,863,116,110 deo4=@603,863,116,110
seg 3 14;  cut_ 3  mapasiva=11
seg 10 14; cut_ 10 camac=10 most=12
seg 12 14; cut_ 12 planina=@258,294,145,92
seg 17 14; cut_ 17 medved=13 detlic=3:42 jelen=11 rak=5 krava=12 malina=4
seg 22 14; cut_ 22 kukuruz=7 sljiva=10 paprika=11 jabuka=8 psenica=12
seg 24 14; cut_ 24 opanci=9 frula=12 krcag=5 vodenica=3
seg 27 14; cut_ 27 nosnja=1
rm -rf "$T"
