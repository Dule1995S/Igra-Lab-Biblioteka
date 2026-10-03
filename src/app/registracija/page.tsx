import Link from "next/link";
import { redirect } from "next/navigation";
import Captcha, { captchaToken } from "@/components/sajt/Captcha";
import { createClient } from "@/lib/supabase/server";

async function registracija(formData: FormData) {
  "use server";
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect("/registracija?greska=1");
  const f = (k: string) => String(formData.get(k) ?? "").trim();
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: f("email"),
    password: String(formData.get("password") ?? ""),
    options: {
      captchaToken: captchaToken(formData),
      data: {
        full_name: f("full_name"),
        org_name: f("institution"),
        pib: f("pib"),
        mb: f("mb"),
        address: f("address"),
        jbkjs: f("jbkjs"),
        requested_seats: f("seats"),
      },
    },
  });
  if (error) redirect("/registracija?greska=1");
  redirect("/biblioteka");
}

export default async function Registracija({ searchParams }: PageProps<"/registracija">) {
  const { greska } = await searchParams;
  const polje = "rounded-lg border border-black/30 bg-white px-3 py-2";
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-[34px] font-extrabold">Registracija vrtića</h1>
      <p className="mt-2">
        Pravite jedan nalog za ceo vrtić, a posle sami otvarate naloge vaspitačicama. Pretplatu plaćate po fakturi (eFaktura),
        a pristup se aktivira kad evidentiramo uplatu.
      </p>
      {greska && (
        <p role="alert" className="mt-4 font-bold">Registracija nije uspela. Proverite podatke (lozinka najmanje 8 znakova).</p>
      )}
      <form action={registracija} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 sm:col-span-2">Naziv vrtića
          <input name="institution" required className={polje} />
        </label>
        <label className="flex flex-col gap-1">PIB
          <input name="pib" required inputMode="numeric" pattern="[0-9]{9}" title="PIB ima 9 cifara" className={polje} />
        </label>
        <label className="flex flex-col gap-1">Matični broj
          <input name="mb" inputMode="numeric" className={polje} />
        </label>
        <label className="flex flex-col gap-1 sm:col-span-2">Adresa
          <input name="address" required className={polje} />
        </label>
        <label className="flex flex-col gap-1">JBKJS (za javne vrtiće)
          <input name="jbkjs" inputMode="numeric" className={polje} />
        </label>
        <label className="flex flex-col gap-1">Broj vaspitačica
          <input name="seats" type="number" min={1} max={500} defaultValue={12} required className={polje} />
        </label>
        <label className="flex flex-col gap-1 sm:col-span-2">Ime i prezime (kontakt osoba)
          <input name="full_name" required className={polje} />
        </label>
        <label className="flex flex-col gap-1">Email
          <input name="email" type="email" required className={polje} />
        </label>
        <label className="flex flex-col gap-1">Lozinka
          <input name="password" type="password" minLength={8} required className={polje} />
        </label>
        <div className="sm:col-span-2"><Captcha /></div>
        <div className="sm:col-span-2"><button className="btn">Registruj vrtić</button></div>
      </form>
      <p className="mt-6"><Link href="/prijava">Već imamo nalog</Link></p>
    </main>
  );
}
