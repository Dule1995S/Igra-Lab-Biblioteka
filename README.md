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

- Prezentacija je skup slajdova u podacima: `src/content/<knjizica>.tsx`. Prikazivač je `src/components/prezentacija/Deck.tsx`, vrste slajdova su u `slides.tsx`.
- Probni primer: `/demo/brojevi-do-20` (privremeno javno, radni list za preuzimanje je u `sadrzaj/`). Pre objave prebaciti iza prijave.
- Slike su izdvojene iz PDF-a radnog lista u `public/sprites/` (isto važi za sledeće knjižice).
