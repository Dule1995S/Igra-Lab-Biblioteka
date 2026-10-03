# Interaktivne priče uz knjižice (za prodavnicu igralab.rs)

Svaka knjižica dobija jednu **samostalnu HTML datoteku**: šest kratkih igara (po jedna iz svake celine) sa Liskom, pa ekran „Za roditelja“ sa pregledom šta je dete vežbalo i kodom za sledeću knjižicu. Sve (slike, font, kod) je u jednom fajlu, bez spoljnih zahteva, pa radi na bilo kom hostingu, u iframe-u i na telefonu.

Gotovo: `dist/vitezovi-i-zmajevi.html` (oko 480 KB).

## Ubacivanje na sajt

Najjednostavnije: otpremite `dist/<naziv>.html` na bilo koji statički hosting (ili u `public/` ove aplikacije) i ubacite ga na stranicu proizvoda kroz iframe:

```html
<div style="position:relative;aspect-ratio:16/9;width:100%;max-width:960px">
  <iframe src="https://VAŠA-ADRESA/vitezovi-i-zmajevi.html" title="Витезови и змајеви"
          allow="fullscreen" allowfullscreen loading="lazy"
          style="position:absolute;inset:0;width:100%;height:100%;border:0;border-radius:12px"></iframe>
</div>
```

- `allow="fullscreen"` uključuje dugme za ceo ekran. Bez njega priča radi, samo bez tog dugmeta.
- Ako vaša platforma ne dozvoljava iframe, ubacite link koji otvara fajl u novom prozoru.
- Na telefonu je najbolje voditi dete na ceo ekran i vodoravno (priča to predlaže).

## Izgradnja

```bash
cd prodavnica/prezentacije
node build.mjs                       # sve priče
node build.mjs vitezovi-i-zmajevi    # jedna priča
```

Potreban je samo Node 18+. Izlaz je u `dist/`.

## Podešavanje (stories/<naziv>/story.mjs)

- `next.url`: adresa prodavnice za dugme „Pogledaj u prodavnici“ (podrazumevano `https://igralab.rs`; stavite tačnu stranicu sledeće knjižice).
- `next.code` / `next.codeText`: kod za popust, preuzet sa poslednje strane knjižice (`ВИТЕЗ20`).
- Tekstovi, činjenice i uputstva u oblačiću Liska su u istom fajlu. Činjenice su iz same knjižice, a uz svaku celinu je navedena strana (`page`).

## Nova priča (sledeće knjižice)

1. Napraviti `stories/<naziv>/` sa `story.mjs` (kopirati Vitezove) i `assets/`.
2. Slike izvući iz PDF-a: videti `stories/vitezovi-i-zmajevi/extract-assets.sh` (potrebni su `poppler-utils` i `imagemagick`; PDF-ovi nisu u repozitorijumu). Skripta iseca ikone iz radnog lista i briše belu pozadinu.
3. Za svaku celinu izabrati vrstu igre i popuniti podatke.

Vrste igara u `engine/engine.js` (`GAMES`):

| `type` | Šta dete radi | Primer |
|---|---|---|
| `odd` | Dodirne ono što ne pripada | Замак |
| `bigger` | Dodirne šta je u stvarnosti veće | Витез |
| `shadow` | Vuče izvor svetla, vidi kako se menja senka | Ноћ у замку |
| `trace` | Prstom prati liniju od starta do cilja | Змај |
| `grid` | Dopunjuje mrežu (ista stvar jednom u redu i koloni) | Благо |
| `shield` | Slaže svoj znak: boja i tačno pet znakova | Турнир |

Nova vrsta igre je jedna funkcija u `GAMES` koja dobija `(root, podaci, ctx, indeks)`. `ctx.say`, `ctx.next`, `ctx.finish` i `ctx.burst` upravljaju oblačićem, dugmetom „Даље“, završetkom koraka i konfetama.

## Sadržaj foldera

- `engine/`: pokretač (`engine.js`, `engine.css`, `template.html`), font Nunito (ćirilica + latinica) i Lisko/logo.
- `stories/`: sadržaj po knjižici.
- `build.mjs`: spaja sve u jedan HTML.
- `dist/`: gotove datoteke za sajt.
