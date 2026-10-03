import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function promeniLozinku(formData: FormData) {
  "use server";
  const nova = String(formData.get("password") ?? "");
  const ponovo = String(formData.get("password2") ?? "");
  if (nova.length < 8) redirect("/biblioteka/nalog?greska=kratka");
  if (nova !== ponovo) redirect("/biblioteka/nalog?greska=razlicito");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/prijava");
  const { error } = await supabase.auth.updateUser({ password: nova });
  if (error) redirect("/biblioteka/nalog?greska=nalog");
  redirect("/biblioteka/nalog?ok=1");
}

const GRESKE: Record<string, string> = {
  kratka: "Lozinka mora imati najmanje 8 znakova.",
  razlicito: "Lozinke se ne poklapaju.",
  nalog: "Lozinka nije promenjena. Pokušajte ponovo ili se odjavite i prijavite.",
};

export default async function MojNalog({ searchParams }: PageProps<"/biblioteka/nalog">) {
  const { greska, ok } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/prijava");
  const { data: me } = await supabase.from("profiles").select("full_name,org_id").eq("id", user.id).maybeSingle();
  const { data: org } = me?.org_id ? await supabase.from("organizations").select("name").eq("id", me.org_id).maybeSingle() : { data: null };
  const polje = "rounded-lg border border-black/30 bg-white px-3 py-2";

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <Link href="/biblioteka">← Biblioteka</Link>
      <h1 className="mt-4 text-[34px] font-extrabold">Moj nalog</h1>
      <p className="mt-2">{me?.full_name ?? "Bez imena"}{org?.name ? `, ${org.name}` : ""}<br />{user.email}</p>

      <h2 className="mt-8 text-[24px] font-bold">Nova lozinka</h2>
      {greska && <p role="alert" className="mt-3 font-bold">{GRESKE[String(greska)] ?? "Došlo je do greške."}</p>}
      {ok && <p role="status" className="mt-3 rounded-xl bg-brand-cool/20 p-3 font-bold">Lozinka je promenjena.</p>}
      <form action={promeniLozinku} className="mt-4 flex flex-col gap-4">
        <label className="flex flex-col gap-1">Nova lozinka<input name="password" type="password" minLength={8} required autoComplete="new-password" className={polje} /></label>
        <label className="flex flex-col gap-1">Ponovite lozinku<input name="password2" type="password" minLength={8} required autoComplete="new-password" className={polje} /></label>
        <button className="btn">Promeni lozinku</button>
      </form>
    </main>
  );
}
