import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Knjizica({ params }: PageProps<"/biblioteka/[slug]">) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/prijava");

  // RLS vraća red samo korisniku sa aktivnim pristupom.
  const { data: booklet } = await supabase
    .from("booklets")
    .select("id,title,age_group,description,presentation_path")
    .eq("slug", slug)
    .maybeSingle();
  if (!booklet) notFound();

  const { data: worksheets } = await supabase
    .from("worksheets")
    .select("id,title,file_path")
    .eq("booklet_id", booklet.id)
    .order("sort_order");

  const sign = async (bucket: string, path: string) =>
    (await supabase.storage.from(bucket).createSignedUrl(path, 3600)).data?.signedUrl;

  const presentationUrl = booklet.presentation_path
    ? await sign("presentations", booklet.presentation_path)
    : undefined;
  const sheets = await Promise.all(
    (worksheets ?? []).map(async (w) => ({ ...w, url: await sign("worksheets", w.file_path) })),
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/biblioteka">← Nazad u biblioteku</Link>
      <h1 className="mt-4 text-[34px] md:text-[44px] font-extrabold">{booklet.title}</h1>
      <p className="font-bold text-brand-cool">Uzrast: {booklet.age_group}</p>
      {booklet.description && <p className="mt-2">{booklet.description}</p>}

      <h2 className="mt-10 text-[32px] font-bold">Prezentacija</h2>
      {presentationUrl ? (
        <iframe src={presentationUrl} title={`Prezentacija: ${booklet.title}`}
          className="mt-4 h-[70vh] w-full rounded-2xl border border-black/20 bg-white" />
      ) : (
        <p className="mt-2">Prezentacija uskoro.</p>
      )}

      <h2 className="mt-10 text-[32px] font-bold">Radni listovi</h2>
      <ul className="mt-4 flex flex-col gap-3">
        {sheets.map((w) => (
          <li key={w.id} className="flex items-center justify-between gap-4 rounded-xl bg-white p-4">
            <span className="font-bold">{w.title}</span>
            {w.url && <a href={w.url} download className="btn">Preuzmi</a>}
          </li>
        ))}
        {sheets.length === 0 && <li>Radni listovi uskoro.</li>}
      </ul>
    </main>
  );
}
