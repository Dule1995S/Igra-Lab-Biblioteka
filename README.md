This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Igra Lab Biblioteka

B2B sajt za vaspitačice: prijava, pa biblioteka sa prezentacijom i radnim listovima za svaku knjižicu.

- Stack: Next.js (App Router) + Supabase (auth, Postgres, privatni storage).
- Šema baze i RLS: `supabase/schema.sql` (pokrenuti u Supabase SQL editoru).
- Env: kopirati `.env.example` u `.env.local` i popuniti.
- Pristup bazi daje red u `subscriptions` sa `status = 'active'`. Plaćanje još nije povezano.

### Interaktivne prezentacije

- Prezentaciju vodi vaspitačica (pitanja grupi, otkrivanje odgovora na klik); deca zadatke rade na radnom listu, pa prezentacija NE kopira list.
- Prezentacija je skup slajdova u podacima: `src/content/<knjizica>.tsx`. Prikazivač je `src/components/prezentacija/Deck.tsx`, vrste slajdova su u `slides.tsx`.
- Probni primer: `/demo/brojevi-do-20` (privremeno javno, radni list za preuzimanje je u `public/besplatan-primer/`). Pre objave prebaciti iza prijave.
- Slike su izdvojene iz PDF-a radnog lista u `public/sprites/` (isto važi za sledeće knjižice).

### Struktura biblioteke

`/biblioteka` (uzrasti 3, 4, 5, 6) → `/biblioteka/uzrast/<uzrast>` (knjižice) → `/biblioteka/<slug>` (interaktivna prezentacija + radni listovi).
Jedna aktivna pretplata otvara sve. Nova knjižica: red u `booklets` (kolona `deck` = ključ iz `src/content/index.ts`), PDF radnog lista u bucket `worksheets`.
Probna knjižica: `supabase/seed.sql`.

### B2B model (vrtić plaća, svaka vaspitačica ima svoj login)

- `organizations` = vrtić (`seats` = najviše naloga, podrazumevano 12). `profiles.org_id` i `role` (`admin` | `member`). `subscriptions.org_id`: pretplata pripada vrtiću, pristup imaju svi članovi.
- Registracija (`/registracija`) pravi vrtić i njegov administratorski nalog. Administrator u `/biblioteka/vrtic` otvara i uklanja naloge vaspitačica (server koristi `SUPABASE_SERVICE_ROLE_KEY`, nikad u pregledaču). Proverava se i broj naloga prema `seats`.
- Bezbednost: `org_id` se čita samo iz `app_metadata` (postavlja ga server). Iz `user_metadata` se ignoriše, inače bi se bilo ko mogao učlaniti u tuđi vrtić. Pravila pristupa (RLS) su proverena probom na Postgresu.
- Plaćanje je po fakturi (eFaktura), bez plaćanja na sajtu. Vrtić pri registraciji unosi PIB, adresu, JBKJS i broj vaspitačica. Administrator Igra Lab (`profiles.is_admin = true`, postavlja se ručno u bazi) na `/admin` aktivira pretplatu kad uplata stigne: broj naloga, datum isteka, broj fakture.
- Podaci za objavu (naziv firme, PIB, email, cena) idu u `src/lib/sajt.ts`. Pravne stranice su nacrt.

### Prijava, nalog i preuzimanja

- Lozinke: administrator vrtića postavlja novu lozinku vaspitačici u `/biblioteka/vrtic`; administrator Igra Lab postavlja lozinku administratoru vrtića u `/admin`; svako menja svoju u `/biblioteka/nalog`. (Zaboravljena lozinka preko emaila nije uključena, jer traži podešen email servis.)
- Preuzimanje radnog lista ide kroz `/biblioteka/preuzmi/<id>`: provera pristupa, evidencija u tabeli `downloads` i link koji važi minut. Broj preuzimanja po vrtiću se vidi u `/admin`.
- Baza koja je već napravljena dobija novu tabelu pokretanjem `supabase/migrations/002_preuzimanja.sql`. Nova podešavanja koriste `supabase/setup.sql`.
