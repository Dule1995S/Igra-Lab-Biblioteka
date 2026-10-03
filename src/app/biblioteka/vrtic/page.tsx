import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type Ja = { id: string; org_id: string; role: string };

/** Prijavljeni korisnik mora biti administrator svog vrtića. Proverava se na serveru pri svakoj akciji. */
async function trazAdmina(): Promise<Ja> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/prijava");
  const { data: me } = await supabase.from("profiles").select("id,org_id,role").eq("id", user.id).maybeSingle();
  if (!me?.org_id || me.role !== "admin") redirect("/biblioteka");
  return me as Ja;
}

async function dodaj(formData: FormData) {
  "use server";
  const me = await trazAdmina();
  const admin = createAdminClient();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const ime = String(formData.get("full_name") ?? "").trim();
  const lozinka = String(formData.get("password") ?? "");
  if (!email || !ime || lozinka.length < 8) redirect("/biblioteka/vrtic?greska=podaci");

  const [{ data: org }, { count }] = await Promise.all([
    admin.from("organizations").select("seats").eq("id", me.org_id).single(),
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("org_id", me.org_id),
  ]);
  if (!org || (count ?? 0) >= org.seats) redirect("/biblioteka/vrtic?greska=mesta");

  const { error } = await admin.auth.admin.createUser({
    email, password: lozinka, email_confirm: true,
    user_metadata: { full_name: ime },
    app_metadata: { org_id: me.org_id },
  });
  if (error) redirect("/biblioteka/vrtic?greska=nalog");
  revalidatePath("/biblioteka/vrtic");
  redirect("/biblioteka/vrtic?dodato=1");
}

async function ukloni(formData: FormData) {
  "use server";
  const me = await trazAdmina();
  const id = String(formData.get("id"));
  if (id === me.id) redirect("/biblioteka/vrtic");
  const admin = createAdminClient();
  const { data: target } = await admin.from("profiles").select("org_id").eq("id", id).maybeSingle();
  if (target?.org_id === me.org_id) await admin.auth.admin.deleteUser(id);
  revalidatePath("/biblioteka/vrtic");
  redirect("/biblioteka/vrtic");
}

async function novaLozinka(formData: FormData) {
  "use server";
  const me = await trazAdmina();
  const id = String(formData.get("id"));
  const lozinka = String(formData.get("password") ?? "");
  if (lozinka.length < 8) redirect("/biblioteka/vrtic?greska=lozinka");
  const admin = createAdminClient();
  const { data: target } = await admin.from("profiles").select("org_id").eq("id", id).maybeSingle();
  if (target?.org_id !== me.org_id) redirect("/biblioteka/vrtic");
  const { error } = await admin.auth.admin.updateUserById(id, { password: lozinka });
  if (error) redirect("/biblioteka/vrtic?greska=nalog");
  redirect("/biblioteka/vrtic?lozinka=1");
}

async function postaviUlogu(formData: FormData) {
  "use server";
  const me = await trazAdmina();
  const id = String(formData.get("id"));
  const uloga = String(formData.get("uloga")) === "admin" ? "admin" : "member";
  if (id === me.id) redirect("/biblioteka/vrtic");
  const admin = createAdminClient();
  const { data: target } = await admin.from("profiles").select("org_id").eq("id", id).maybeSingle();
  if (target?.org_id !== me.org_id) redirect("/biblioteka/vrtic");
  await admin.from("profiles").update({ role: uloga }).eq("id", id);
  revalidatePath("/biblioteka/vrtic");
  redirect("/biblioteka/vrtic?uloga=1");
}

const GRESKE: Record<string, string> = {
  lozinka: "Lozinka mora imati najmanje 8 znakova.",
  podaci: "Unesite ime, email i lozinku od najmanje 8 znakova.",
  mesta: "Dostigli ste broj naloga koji vaš vrtić ima u pretplati. Javite nam se da ga povećamo.",
  nalog: "Nalog nije otvoren. Proverite da email već ne postoji.",
};

export default async function MojVrtic({ searchParams }: PageProps<"/biblioteka/vrtic">) {
  const { greska, dodato, lozinka, uloga } = await searchParams;
  const me = await trazAdmina();
  const supabase = await createClient();

  const [{ data: org }, { data: clanovi }, { data: pretplata }] = await Promise.all([
    supabase.from("organizations").select("name,seats").eq("id", me.org_id).single(),
    supabase.from("profiles").select("id,full_name,role").eq("org_id", me.org_id).order("created_at"),
    supabase.from("subscriptions").select("status,current_period_end").eq("org_id", me.org_id).eq("status", "active").maybeSingle(),
  ]);
  const zauzeto = clanovi?.length ?? 0;
  const polje = "rounded-lg border border-black/30 bg-white px-3 py-2";

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/biblioteka">← Biblioteka</Link>
      <h1 className="mt-4 text-[34px] md:text-[44px] font-extrabold">{org?.name}</h1>
      <p className="mt-2">
        Pretplata: <strong>{pretplata ? "aktivna" : "nije aktivna"}</strong>
        {pretplata?.current_period_end && <> (do {new Date(pretplata.current_period_end).toLocaleDateString("sr-Latn-RS")})</>}.
        {" "}Nalozi: <strong>{zauzeto} od {org?.seats}</strong>.
      </p>

      {greska && <p role="alert" className="mt-4 rounded-xl bg-brand-warm/30 p-4 font-bold">{GRESKE[String(greska)] ?? "Došlo je do greške."}</p>}
      {uloga && <p role="status" className="mt-4 rounded-xl bg-brand-cool/20 p-4 font-bold">Uloga je promenjena.</p>}
      {lozinka && <p role="status" className="mt-4 rounded-xl bg-brand-cool/20 p-4 font-bold">Nova lozinka je postavljena. Predajte je vaspitačici lično.</p>}
      {dodato && <p role="status" className="mt-4 rounded-xl bg-brand-cool/20 p-4 font-bold">Nalog je otvoren. Vaspitačica se prijavljuje emailom i lozinkom koju ste uneli.</p>}

      <h2 className="mt-10 text-[28px] font-bold">Vaspitačice</h2>
      <ul className="mt-4 flex flex-col gap-2">
        {clanovi?.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-4 rounded-xl bg-white p-4">
            <span className="font-bold">{c.full_name || "Bez imena"}{c.role === "admin" && <span className="ml-2 text-[15px] font-normal opacity-70">administrator</span>}</span>
            {c.id !== me.id && (
              <div className="flex flex-wrap items-center gap-4">
                <form action={novaLozinka} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={c.id} />
                  <input name="password" type="text" minLength={8} required autoComplete="off" placeholder="Nova lozinka" aria-label={`Nova lozinka za ${c.full_name ?? "nalog"}`} className="w-40 rounded-lg border border-black/30 bg-white px-3 py-1 text-[16px]" />
                  <button className="underline">Postavi lozinku</button>
                </form>
                <form action={postaviUlogu}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="uloga" value={c.role === "admin" ? "member" : "admin"} />
                  <button className="underline">{c.role === "admin" ? "Skini administratora" : "Postavi za administratora"}</button>
                </form>
                <form action={ukloni}><input type="hidden" name="id" value={c.id} /><button className="underline">Ukloni nalog</button></form>
              </div>
            )}
          </li>
        ))}
      </ul>

      {zauzeto < (org?.seats ?? 0) && (
        <>
          <h2 className="mt-10 text-[28px] font-bold">Dodaj vaspitačicu</h2>
          <form action={dodaj} className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1">Ime i prezime<input name="full_name" required className={polje} /></label>
            <label className="flex flex-col gap-1">Email<input name="email" type="email" required className={polje} /></label>
            <label className="flex flex-col gap-1 sm:col-span-2">Lozinka (najmanje 8 znakova)<input name="password" type="text" minLength={8} required autoComplete="off" className={polje} /></label>
            <div className="sm:col-span-2"><button className="btn">Otvori nalog</button></div>
          </form>
          <p className="mt-3 text-[16px] opacity-80">Lozinku predajte vaspitačici lično. Svaka vaspitačica ima svoj nalog, pa se prijavljuje sa bilo kog računara u vrtiću.</p>
        </>
      )}
    </main>
  );
}
