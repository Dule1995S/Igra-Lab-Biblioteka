import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-[34px] md:text-[56px] font-extrabold leading-tight">
        Igra Lab Biblioteka
      </h1>
      <p className="mt-4">
        Prezentacije i radni listovi za vaspitačice, uz svaku Igra Lab knjižicu.
        Prijavite se i otvorite svoju biblioteku.
      </p>
      <div className="mt-8 flex flex-wrap gap-4 items-center">
        <Link href="/prijava" className="btn">Prijava</Link>
        <Link href="/registracija">Nemam nalog</Link>
      </div>
    </main>
  );
}
