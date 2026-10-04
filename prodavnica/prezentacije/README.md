# Interaktivne priče uz knjižice (za prodavnicu igralab.rs)

Svaka knjižica dobija jednu **samostalnu HTML datoteku**: šest kratkih igara (po jedna iz svake celine) sa Liskom, pa ekran „Za roditelja“ sa pregledom šta je dete vežbalo, stranicama knjižice i kodom za sledeću knjižicu. Sve (slike, font, kod) je u jednom fajlu, bez spoljnih zahteva, pa radi na bilo kom hostingu, u iframe-u i na telefonu. Roditelj čita naglas šta Lisko kaže u oblačiću.

| Priča (`dist/`) | Knjižica | Šest igara | Sledeća knjižica | Kod |
|---|---|---|---|---|
| `vitezovi-i-zmajevi.html` | Витезови и змајеви | šta ne pripada, šta je veće, senka, zmajev trag, mreža blaga, štit | Динозауруси | `ВИТЕЗ20` |
| `dinosaurusi.html` | Диносауруси | čija je senka, jaja po veličini, biljke ili meso, nebo/voda/kopno, iskopaj fosil, let do gnezda | Животиње света | `ДИНО20` |
| `zivotinje-sveta.html` | Животиње света | šta ne pripada, danju ili noću, nađi istu, izdaleka ili izbliza, bubamara, šta je veće | Чувам природу | `ЗВЕРКЕ20` |
| `cuvam-prirodu.html` | Чувам природу | šta nije otpad, tri kante, gde stane više vode, šta od čega može, od kore do cveta, drvo | Србија | `ПРИРОДА20` |
| `srbija.html` | Србија | koje parče fali (mapa), reka teče, planine po veličini, šta je veće, gde šta raste, moja nošnja | Витезови и змајеви | `СРБИЈА20` |
| `nauka-kod-kuce.html` | Наука код куће | pluta ili tone, šta fali u drugom redu, senka od lampe, magnet drži ili ne, ради супротно, moja vaga | Технологија око нас | `НАУКА20` |
| `moj-grad-i-selo.html` | Мој град и село | šta ne pripada (ulica), po putu ili po vodi, šta se gde dobija, traktori po veličini, moja saksija, šta je veće | Под морем | `МЕСТО20` |
| `pod-morem.html` | Под морем | rakovi po veličini, šta fali u drugom redu, do školjke na dnu, moj greben, šta je veće, pluta ili tone | Технологија око нас | `МОРЕ20` |
| `tehnologija-oko-nas.html` | Технологија око нас | gde šta stoji (4 korpe), na struju ili na bateriju, ugasi svaki treći ekran, mreža vozila, moj robot, šta je šta zamenilo | Наука код куће | `ТЕХНО20` |
| `ko-je-to.html` | Мали детектив: Ко је то? | trag po trag (precrtaj), čija je senka, čiji je otisak, ko je iza žbuna, izgubljen ključ, šta je nestalo sa stola | Обој по траговима | `ТРАГ20` |
| `oboj-po-tragovima.html` | Мали детектив: Обој по траговима | bojenje po tragovima: dvorište, balončići, kocke, ulica, prozori, ribe | Ко је ко? 1 | `БОЈА20` |
| `ko-je-ko-1.html` | Мали детектив: Ко је ко? 1 | dodeli imena slikama po tragovima: mačke, deca u redu, trka puževa, mala ulica, psi, rođendani | Ко је ко? 2 | `ИМЕНА20` |
| `ko-je-ko-2.html` | Мали детектив: Ко је ко? 2 | tabela sa Х i kvačicom (jedna i dve tabele): ljubimci, užina, pokloni, trka, ranci, izlet | Тајна зачараног ормана | `ТАБЕЛА20` |
| `tajna-ormana.html` | Мали детектив: Тајна зачараног ормана | igra bekstva: svaki zadatak daje slovo (ili broj → slovo iz azbuke), a ЗВЕЗДА otvara orman | Ко је ко? 2 | `ЛУПА20` |

Priče čine krugove „sledeće avanture“, pa se svaka završava preporukom druge knjižice. Svaka igra se naslanja na stranicu iz knjižice (navedena u ekranu za roditelje), ali nije njena kopija. Činjenice u Liskovim rečenicama su iz same knjižice.

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
node build.mjs srbija                # jedna priča
```

Potreban je samo Node 18+. Izlaz je u `dist/`.

## Podešavanje (stories/<naziv>/story.mjs)

- `next.url`: adresa prodavnice za dugme „Pogledaj u prodavnici“ (podrazumevano `https://igralab.rs`, zajedničko u `stories/_shared.mjs`; stavite tačnu stranicu sledeće knjižice).
- `next.code` / `next.codeText`: kod za popust, preuzet sa poslednje strane knjižice.
- Tekstovi, činjenice i uputstva u oblačiću Liska su u istom fajlu.

## Nova priča (sledeće knjižice)

1. Napraviti `stories/<naziv>/` sa `story.mjs` (kopirati neku postojeću) i `assets/`.
2. Slike izvući iz PDF-a. Potrebni su `poppler-utils` i `imagemagick`; PDF-ovi nisu u repozitorijumu.
   - `tools/segment.sh knjizica.pdf <strana> <folder>` pronađe pojedinačne crteže na strani i numeriše ih na slici `seg-p<strana>.png`.
   - `tools/cut.sh knjizica.pdf <strana> <folder> ime=broj ...` iseče izabrane crteže u providni PNG (može i `ime=broj:uvlačenje`, ručni okvir `ime=@x,y,w,h` i `~flop` da se polovina spoji sa ogledalom).
   - `tools/cover.sh` iseče ilustraciju sa naslovne strane.
   - Primeri celih postupaka su `stories/*/extract-assets.sh`.
3. Za svaku celinu izabrati vrstu igre i popuniti podatke.
4. `node tools/verify.mjs <naziv>` proveri da svaki slučaj sa tragovima (imena, tabela, bojenje, precrtavanje) ima TAČNO jedno rešenje, da nijedan trag nije suvišan i da slova nagrade čine čarobnu reč.
5. `node build.mjs <naziv>`, pa proba: `node tools/playthrough.mjs <naziv>` odigra celu priču u pregledaču (Chromium + Playwright), snimi ekrane u `shots/<naziv>` i prijavi greške i spoljne zahteve.

Vrste igara u `engine/engine.js` (`GAMES`):

| `type` | Šta dete radi |
|---|---|
| `odd` | Dodirne ono što ne pripada redu |
| `bigger` | Dodirne šta je u stvarnosti veće |
| `choose` | Bira odgovor uz model (običan ili silueta, npr. „čija je ovo senka“, „nađi istu“) |
| `sort` | Razvrstava stvar po stvar u 2 do 4 korpe |
| `order` | Dodiruje redom (od najmanjeg do najvećeg, od prvog do poslednjeg) |
| `grid` | Dopunjuje mrežu (ista stvar jednom u redu i koloni) |
| `trace` | Prstom prati liniju od starta do cilja |
| `dig` | Prstom skida zemlju i otkriva šta je ispod |
| `shadow` | Vuče izvor svetla (buktinja, lampa) i gleda kako se menja senka |
| `missing` | Upoređuje dva reda i bira šta fali u donjem |
| `nth` | Dodiruje svaku treću (n-tu) sliku u redu |
| `assign` | Dodeljuje imena slikama po redu (sleva nadesno) prema tragovima |
| `table` | Popunjava tabelu: Х gde ne može, kvačica gde mora (jedna ili dve tabele) |
| `paint` | Boji predmete bojicama po tragovima |
| `eliminate` | Precrtava one koje trag ne dozvoljava; ostaje rešenje |
| `numq` | Rešava račun sa slikama ili zid od cigli; bira broj koji fali |
| `stickers` | Slaže svoj znak: boja (neobavezno) i tačno toliko znakova koliko ima mesta (štit, drvo, nošnja, bubamara) |

Nova vrsta igre je jedna funkcija u `GAMES` koja dobija `(root, podaci, ctx, indeks)`. `ctx.say`, `ctx.next`, `ctx.finish` i `ctx.burst` upravljaju oblačićem, dugmetom „Даље“, završetkom koraka i konfetama.

## Sadržaj foldera

- `engine/`: pokretač (`engine.js`, `engine.css`, `template.html`), font Nunito (ćirilica + latinica) i Lisko/logo.
- `stories/`: sadržaj po knjižici (`_shared.mjs` je zajedničko).
- `covers/`: naslovne ilustracije svih knjižica (za karticu „Sledeća avantura“).
- `tools/`: alati za izvlačenje slika iz PDF-a i automatska proba.
- `build.mjs`: spaja sve u jedan HTML.
- `dist/`: gotove datoteke za sajt.
