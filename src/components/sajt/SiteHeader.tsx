/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { getUserSafe } from "@/lib/supabase/server";

export default async function SiteHeader() {
  const user = await getUserSafe();
  const link = "text-[17px] font-semibold no-underline hover:underline";
  return (
    <header className="border-b border-black/10 bg-background">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" aria-label="Igra Lab Biblioteka, početna"><img src="/logo.png" alt="Igra Lab" className="h-10 w-auto" /></Link>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-1" aria-label="Glavni meni">
          <Link href="/#kako-radi" className={`${link} hidden md:inline`} style={{ color: "inherit" }}>Kako radi</Link>
          <Link href="/#uzrasti" className={`${link} hidden md:inline`} style={{ color: "inherit" }}>Uzrasti</Link>
          <Link href="/cene" className={`${link} hidden md:inline`} style={{ color: "inherit" }}>Cene</Link>
          <Link href="/#pitanja" className={`${link} hidden md:inline`} style={{ color: "inherit" }}>Pitanja</Link>
          {user ? (
            <Link href="/biblioteka" className="btn !px-5 !py-2 !text-[17px]">Moja biblioteka</Link>
          ) : (
            <>
              <Link href="/prijava" className={link}>Prijava</Link>
              <Link href="/registracija" className="btn !px-5 !py-2 !text-[17px]">Registruj vrtić</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
