/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <img src="/lisko.png" alt="" className="mx-auto h-24 w-auto" />
      <h1 className="mt-4 text-[40px] font-extrabold">Ove stranice nema</h1>
      <p className="mt-2 text-[20px]">Lisko je tražio svuda, ali je nije našao.</p>
      <Link href="/" className="btn mt-6">Nazad na početnu</Link>
    </main>
  );
}
