// Podaci o sajtu na jednom mestu. Prazna polja (null) popuniti pre objave.
export const SAJT = {
  naziv: "Igra Lab Biblioteka",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  instagram: { rucka: "@igralab", url: "https://www.instagram.com/igralab" },
  email: null as string | null,        // npr. "kontakt@..."
  cena: null as string | null,         // npr. "X din / godišnje"; dok je null, prikazuje se poziv na kontakt
  firma: { naziv: null as string | null, adresa: null as string | null, pib: null as string | null, mb: null as string | null },
};
