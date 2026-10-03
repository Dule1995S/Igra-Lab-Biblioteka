import type { Metadata } from "next";
import { SAJT } from "@/lib/sajt";

export const metadata: Metadata = { title: "Uslovi korišćenja" };

export default function Uslovi() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14">
      <p role="note" className="mb-6 rounded-xl bg-brand-warm/30 p-4 text-[17px]">
        Nacrt. Popunite podatke o firmi i proverite tekst sa pravnikom pre objave sajta.
      </p>
      <h1 className="text-[34px] font-extrabold md:text-[44px]">Uslovi korišćenja</h1>
      <div className="mt-6 flex flex-col gap-4 [&_h2]:mt-4 [&_h2]:text-[24px] [&_h2]:font-bold">
        <h2>1. Ko pruža uslugu</h2>
        <p>{SAJT.firma.naziv ?? "[naziv firme]"}, {SAJT.firma.adresa ?? "[adresa]"}, PIB {SAJT.firma.pib ?? "[PIB]"} (u daljem tekstu: Igra Lab).</p>
        <h2>2. Šta usluga obuhvata</h2>
        <p>Pretplata daje nalogu pristup biblioteci Igra Lab knjižica: interaktivnim prezentacijama i radnim listovima za uzraste 3, 4, 5 i 6 godina, dok pretplata traje.</p>
        <h2>3. Nalog</h2>
        <p>Pretplatu zaključuje vrtić (ustanova). Registracijom vrtić dobija administratorski nalog i sam otvara naloge vaspitačicama, do broja naloga koji je obuhvaćen pretplatom. Svaki nalog je lični i vezan za jednu vaspitačicu. Vrtić odgovara za svoje naloge i za čuvanje lozinki. Nalozi se ne dele sa osobama van vrtića.</p>
        <h2>4. Pretplata i plaćanje</h2>
        <p>Pretplata se plaća po fakturi (eFaktura), na osnovu broja naloga koji vrtić traži. Pristup se aktivira kad uplata bude evidentirana, za period naveden na fakturi. [Dopuniti: rok plaćanja, obnavljanje, otkazivanje, povraćaj novca.]</p>
        <h2>5. Autorska prava</h2>
        <p>Prezentacije, radni listovi, ilustracije i lik Lisko su autorsko delo Igra Lab. Korisnik sme da ih koristi za rad sa decom u svojoj grupi i da štampa radne listove za tu grupu. Umnožavanje, prodaja i objavljivanje van toga nisu dozvoljeni bez pisane saglasnosti.</p>
        <h2>6. Promene</h2>
        <p>Igra Lab može da dopunjuje sadržaj i menja ove uslove. O bitnim promenama korisnik se obaveštava unapred.</p>
        <h2>7. Kontakt</h2>
        <p>Pitanja: Instagram {SAJT.instagram.rucka}{SAJT.email ? `, ${SAJT.email}` : ""}.</p>
      </div>
    </main>
  );
}
