import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AGES, ageLabel } from "@/lib/uzrasti";

const COLORS: Record<string, string> = { "3": "#7ba84f", "4": "#2f6aa8", "5": "#f2a03d", "6": "#8a5ea8" };

async function odjava() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export default async function Biblioteka() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/prijava");

  const { data: access } = await supabase.rpc("has_access", { uid: user.id });
  const { data: booklets } = access ? await supabase.from("booklets").select("age_group") : { data: null };
  const count = (a: string) => booklets?.filter((b) => b.age_group === a).length ?? 0;

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[34px] md:text-[44px] font-extrabold">Moja biblioteka</h1>
        <form action={odjava}><button className="underline">Odjava</button></form>
      </div>
      <p className="mt-2">Izaberite uzrast dece.</p>

      {!access && (
        <p className="mt-6 rounded-xl bg-brand-warm/30 p-4">
          Vaš nalog još nema aktivnu pretplatu. Pristup se otvara nakon plaćanja.
        </p>
      )}

      <ul className="mt-8 grid gap-6 sm:grid-cols-2">
        {AGES.map((a) => (
          <li key={a}>
            <Link href={access ? `/biblioteka/uzrast/${a}` : "#"} aria-disabled={!access}
              className={`block rounded-2xl bg-white p-8 no-underline shadow-sm ${access ? "" : "opacity-50 pointer-events-none"}`}
              style={{ borderTop: `10px solid ${COLORS[a]}`, color: "inherit" }}>
              <p className="text-[56px] font-extrabold leading-none" style={{ fontFamily: "var(--font-baloo)" }}>{a}</p>
              <p className="text-[24px] font-bold">{ageLabel(a)}</p>
              {access && <p className="mt-2 text-[17px]">Knjižica: {count(a)}</p>}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
