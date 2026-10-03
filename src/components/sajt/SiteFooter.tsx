/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { SAJT } from "@/lib/sajt";

export default function SiteFooter() {
  const col = "flex flex-col gap-1";
  return (
    <footer className="mt-auto border-t border-black/10 bg-white/50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <img src="/logo.png" alt="Igra Lab" className="h-10 w-auto" />
          <p className="mt-3 text-[16px]">Prezentacije i radni listovi za vaspitačice, uz Igra Lab knjižice.</p>
        </div>
        <nav className={col} aria-label="Sajt">
          <p className="font-bold">Sajt</p>
          <Link href="/#kako-radi">Kako radi</Link>
          <Link href="/cene">Cene</Link>
          <Link href="/demo/brojevi-do-20">Besplatan primer</Link>
        </nav>
        <nav className={col} aria-label="Nalog">
          <p className="font-bold">Nalog</p>
          <Link href="/prijava">Prijava</Link>
          <Link href="/registracija">Registracija</Link>
          <Link href="/kontakt">Kontakt</Link>
        </nav>
        <nav className={col} aria-label="Pravno">
          <p className="font-bold">Pravno</p>
          <Link href="/uslovi">Uslovi korišćenja</Link>
          <Link href="/privatnost">Politika privatnosti</Link>
          <a href={SAJT.instagram.url} target="_blank" rel="noopener noreferrer">Instagram {SAJT.instagram.rucka}</a>
        </nav>
      </div>
      <p className="border-t border-black/10 px-4 py-4 text-center text-[15px]">© {new Date().getFullYear()} Igra Lab</p>
    </footer>
  );
}
