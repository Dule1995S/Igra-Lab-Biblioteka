import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Administracija", robots: { index: false } };

/** Samo administrator Igra Lab (profiles.is_admin). Proverava se pri prikazu i pri svakoj akciji. */
async function trazIgraLab() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/prijava");
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!me?.is_admin) notFound();
}

/** Podrazumevani datum isteka: godinu dana od danas (YYYY-MM-DD). */
function zaGodinuDana() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

async function aktiviraj(formData: FormData) {
  "use server";
  await trazIgraLab();
  const orgId = String(formData.get("org"));
  const seats = Math.max(1, Math.min(500, parseInt(String(formData.get("seats")), 10) || 1));
  const until = String(formData.get("until"));
  const faktura = String(formData.get("faktura") ?? "").trim() || null;
  if (!orgId || !/^\d{4}-\d{2}-\d{2}$/.test(until)) redirect("/admin?greska=1");
  const admin = createAdminClient();
  await admin.from("organizations").update({ seats }).eq("id", orgId);
  await admin.from("subscriptions").delete().eq("org_id", orgId);
  await admin.from("subscriptions").insert({
    org_id: orgId, status: "active", provider: "efaktura", provider_ref: faktura,
    current_period_end: new Date(`${until}T23:59:59Z`).toISOString(),
  });
  revalidatePath("/admin");
}

async function iskljuci(formData: FormData) {
  "use server";
  await trazIgraLab();
  const admin = createAdminClient();
  await admin.from("subscriptions").update({ status: "canceled" }).eq("org_id", String(formData.get("org")));
  revalidatePath("/admin");
}

export default async function Administracija({ searchParams }: PageProps<"/admin">) {
  const { greska } = await searchParams;
  await trazIgraLab();
  const admin = createAdminClient();
  const [{ data: orgs }, { data: subs }, { data: profs }] = await Promise.all([
    admin.from("organizations").select("*").order("created_at", { ascending: false }),
    admin.from("subscriptions").select("org_id,status,current_period_end,provider_ref"),
    admin.from("profiles").select("org_id"),
  ]);
  const aktivna = (id: string) =>
    subs?.find((s) => s.org_id === id && s.status === "active" && (!s.current_period_end || new Date(s.current_period_end) > new Date()));
  const clanova = (id: string) => profs?.filter((p) => p.org_id === id).length ?? 0;
  const godinuDana = zaGodinuDana();
  const polje = "rounded-lg border border-black/30 bg-white px-3 py-2";

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-[34px] md:text-[44px] font-extrabold">Administracija</h1>
      <p className="mt-2">Vrtići i pretplate. Aktivirajte vrtić kad uplata po fakturi stigne.</p>
      {greska && <p role="alert" className="mt-4 font-bold">Proverite datum i podatke.</p>}

      <ul className="mt-8 flex flex-col gap-5">
        {orgs?.map((o) => {
          const a = aktivna(o.id);
          return (
            <li key={o.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-[24px] font-bold">{o.name}</h2>
                <span className="rounded-full px-3 py-1 text-[15px] font-bold text-white" style={{ background: a ? "#2e9e5b" : "#8a5ea8" }}>
                  {a ? `aktivan do ${new Date(a.current_period_end!).toLocaleDateString("sr-Latn-RS")}` : "čeka aktivaciju"}
                </span>
              </div>
              <p className="mt-1 text-[16px]">
                PIB {o.pib ?? "-"} · MB {o.mb ?? "-"} · JBKJS {o.jbkjs ?? "-"} · {o.address ?? "-"} · {o.contact_email ?? "-"}
              </p>
              <p className="text-[16px]">Nalozi: {clanova(o.id)} od {o.seats}{a?.provider_ref ? ` · faktura ${a.provider_ref}` : ""}</p>
              <form action={aktiviraj} className="mt-3 flex flex-wrap items-end gap-3">
                <input type="hidden" name="org" value={o.id} />
                <label className="flex flex-col text-[15px]">Broj naloga<input name="seats" type="number" min={1} max={500} defaultValue={o.seats} className={`${polje} w-28`} /></label>
                <label className="flex flex-col text-[15px]">Važi do<input name="until" type="date" defaultValue={godinuDana} required className={polje} /></label>
                <label className="flex flex-col text-[15px]">Broj fakture<input name="faktura" className={`${polje} w-40`} /></label>
                <button className="btn !px-5 !py-2 !text-[17px]">{a ? "Produži / izmeni" : "Aktiviraj"}</button>
              </form>
              {a && <form action={iskljuci} className="mt-2"><input type="hidden" name="org" value={o.id} /><button className="underline">Isključi pretplatu</button></form>}
            </li>
          );
        })}
        {orgs?.length === 0 && <li>Još nema registrovanih vrtića.</li>}
      </ul>
    </main>
  );
}
