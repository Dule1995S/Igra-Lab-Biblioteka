"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-[36px] font-extrabold">Nešto nije u redu</h1>
      <p className="mt-2 text-[20px]">Došlo je do greške. Pokušajte ponovo, a ako se ponavlja, javite nam.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <button onClick={reset} className="btn">Pokušaj ponovo</button>
        <Link href="/">Početna</Link>
      </div>
    </main>
  );
}
