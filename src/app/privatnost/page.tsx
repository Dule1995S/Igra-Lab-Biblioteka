import type { Metadata } from "next";
import { SAJT } from "@/lib/sajt";

export const metadata: Metadata = { title: "Politika privatnosti" };

export default function Privatnost() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14">
      <p role="note" className="mb-6 rounded-xl bg-brand-warm/30 p-4 text-[17px]">
        Nacrt. Popunite podatke o firmi i proverite tekst sa pravnikom pre objave sajta (Zakon o zaštiti podataka o ličnosti).
      </p>
      <h1 className="text-[34px] font-extrabold md:text-[44px]">Politika privatnosti</h1>
      <div className="mt-6 flex flex-col gap-4 [&_h2]:mt-4 [&_h2]:text-[24px] [&_h2]:font-bold">
        <h2>Rukovalac podacima</h2>
        <p>{SAJT.firma.naziv ?? "[naziv firme]"}, {SAJT.firma.adresa ?? "[adresa]"}, PIB {SAJT.firma.pib ?? "[PIB]"}.</p>
        <h2>Koje podatke čuvamo</h2>
        <p>Pri registraciji vrtića: naziv vrtića, ime i prezime kontakt osobe, email i lozinka. Za svaku vaspitačicu koju vrtić doda: ime i prezime, email i lozinka (lozinka se čuva zaštićeno, ne u čitljivom obliku). Podatke o pretplati: da li je aktivna i do kada. O plaćanju: podatke koje nam prosledi procesor plaćanja, ne brojeve kartica.</p>
        <h2>Zašto ih koristimo</h2>
        <p>Da bismo otvorili nalog, omogućili prijavu, proverili da li pretplata daje pristup biblioteci i odgovorili na vaša pitanja. Ne prodajemo podatke.</p>
        <h2>Kolačići</h2>
        <p>Sajt koristi kolačić za prijavu, da biste ostali prijavljeni. Ne koristimo kolačiće za oglašavanje.</p>
        <h2>Ko obrađuje podatke za nas</h2>
        <p>Usluge skladištenja baze i prijave (Supabase) i hostinga sajta. [Dopuniti: procesor plaćanja i lokacije servera.]</p>
        <h2>Vaša prava</h2>
        <p>Možete da zatražite uvid, ispravku ili brisanje svojih podataka. Pišite nam na Instagram {SAJT.instagram.rucka}{SAJT.email ? ` ili ${SAJT.email}` : ""}.</p>
      </div>
    </main>
  );
}
