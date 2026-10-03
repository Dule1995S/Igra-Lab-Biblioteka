import Link from "next/link";
import Deck from "@/components/prezentacija/Deck";
import { decks } from "@/content";

// Besplatan primer, namerno javan (poziv na registraciju na landing stranici).
export default function Demo() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col px-4 py-6">
      <Link href="/">← Početna</Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[34px] font-extrabold">Бројеви и количине до 20</h1>
        <a href="/besplatan-primer/brojevi-i-kolicine-do-20.pdf" className="btn">Преузми радни лист (PDF)</a>
      </div>
      <p className="mt-1">Besplatan primer: prezentacija i radni list uz knjižicu za uzrast 5 godina. <Link href="/registracija">Registrujte se</Link> za sve knjižice.</p>
      <div className="mt-4" style={{ height: "max(560px, calc(100vh - 220px))" }}>
        <Deck slides={decks["brojevi-i-kolicine-do-20"]} />
      </div>
    </main>
  );
}
