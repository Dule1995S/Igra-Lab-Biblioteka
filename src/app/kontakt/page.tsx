import type { Metadata } from "next";
import { SAJT } from "@/lib/sajt";

export const metadata: Metadata = { title: "Kontakt" };

export default function Kontakt() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-[34px] font-extrabold md:text-[48px]">Kontakt</h1>
      <p className="mt-3 text-[20px]">Pitanja o biblioteci, nalogu ili pretplati?</p>
      <ul className="mt-6 flex flex-col gap-3 text-[20px]">
        <li>Instagram: <a href={SAJT.instagram.url} target="_blank" rel="noopener noreferrer">{SAJT.instagram.rucka}</a></li>
        {SAJT.email && <li>Email: <a href={`mailto:${SAJT.email}`}>{SAJT.email}</a></li>}
      </ul>
      {SAJT.firma.naziv && (
        <p className="mt-8 text-[16px] opacity-80">
          {SAJT.firma.naziv}{SAJT.firma.adresa ? `, ${SAJT.firma.adresa}` : ""}{SAJT.firma.pib ? `, PIB ${SAJT.firma.pib}` : ""}{SAJT.firma.mb ? `, MB ${SAJT.firma.mb}` : ""}
        </p>
      )}
    </main>
  );
}
