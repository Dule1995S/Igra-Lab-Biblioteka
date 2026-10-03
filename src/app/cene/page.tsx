import type { Metadata } from "next";
import Link from "next/link";
import { SAJT } from "@/lib/sajt";

export const metadata: Metadata = { title: "Cene i pretplata" };

export default function Cene() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-[34px] font-extrabold md:text-[48px]">Pretplata za vrtić</h1>
      <p className="mt-3 text-[20px]">Vrtić plaća jednu pretplatu, a svaka vaspitačica dobija svoj login. Pretplata otvara sve knjižice za uzraste 3, 4, 5 i 6 godina.</p>
      <p className="mt-6 text-[32px] font-extrabold">{SAJT.cena ?? "Cenu objavljujemo uskoro"}</p>
      <h2 className="mt-8 text-[26px] font-bold">Šta je uključeno</h2>
      <ul className="mt-3 list-disc pl-6">
        <li>Interaktivna prezentacija uz svaku knjižicu, sa pitanjima za decu</li>
        <li>Radni list za štampu uz svaku knjižicu</li>
        <li>Nove knjižice kako se objavljuju</li>
        <li>Poseban login za svaku vaspitačicu, na primer 12 naloga za šest grupa sa po dve vaspitačice</li>
        <li>Administrator vrtića sam otvara i uklanja naloge</li>
        <li>Prijava emailom i lozinkom na računaru u vrtiću</li>
      </ul>
      <p className="mt-8">
        Pitanja o ceni i broju naloga za vaš vrtić pošaljite na <a href={SAJT.instagram.url} target="_blank" rel="noopener noreferrer">Instagram {SAJT.instagram.rucka}</a>{SAJT.email ? <> ili na {SAJT.email}</> : null}.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/registracija" className="btn">Registruj vrtić</Link>
        <Link href="/demo/brojevi-do-20">Prvo isprobaj besplatan primer</Link>
      </div>
    </main>
  );
}
