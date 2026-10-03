import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AGES, ageLabel } from "@/lib/uzrasti";

export default async function Uzrast({ params }: PageProps<"/biblioteka/uzrast/[uzrast]">) {
  const { uzrast } = await params;
  if (!(AGES as readonly string[]).includes(uzrast)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/prijava");

  // RLS vraća knjižice samo nalogu sa aktivnom pretplatom.
  const { data: booklets } = await supabase
    .from("booklets").select("slug,title,description")
    .eq("age_group", uzrast).order("sort_order");

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/biblioteka">← Svi uzrasti</Link>
      <h1 className="mt-4 text-[34px] md:text-[44px] font-extrabold">Uzrast: {ageLabel(uzrast)}</h1>

      {booklets?.length === 0 && <p className="mt-8">Knjižice za ovaj uzrast uskoro stižu.</p>}
      <ul className="mt-8 grid gap-6 sm:grid-cols-2">
        {booklets?.map((b) => (
          <li key={b.slug} className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-[24px] font-bold">{b.title}</h2>
            {b.description && <p className="mt-2 text-[17px]">{b.description}</p>}
            <Link href={`/biblioteka/${b.slug}`} className="btn mt-4">Otvori</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
