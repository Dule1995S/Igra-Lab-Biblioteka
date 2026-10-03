import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
  const { data: booklets } = access
    ? await supabase.from("booklets").select("slug,title,age_group,description").order("sort_order")
    : { data: null };

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[34px] md:text-[44px] font-extrabold">Moja biblioteka</h1>
        <form action={odjava}><button className="underline">Odjava</button></form>
      </div>

      {!access && (
        <p className="mt-8 rounded-xl bg-brand-warm/30 p-4">
          Vaš nalog još nema aktivan pristup biblioteci. Pristup se aktivira nakon plaćanja.
        </p>
      )}

      {booklets && booklets.length === 0 && <p className="mt-8">Knjižice uskoro stižu.</p>}

      <ul className="mt-8 grid gap-6 sm:grid-cols-2">
        {booklets?.map((b) => (
          <li key={b.slug} className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-[15px] font-bold text-brand-cool">Uzrast: {b.age_group}</p>
            <h2 className="text-[24px] font-bold">{b.title}</h2>
            {b.description && <p className="mt-2 text-[17px]">{b.description}</p>}
            <Link href={`/biblioteka/${b.slug}`} className="btn mt-4">Otvori</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
