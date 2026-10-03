import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function registracija(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
    options: {
      data: {
        full_name: String(formData.get("full_name")),
        institution: String(formData.get("institution")),
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
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-[34px] font-extrabold">Registracija</h1>
      {greska && (
        <p role="alert" className="mt-4 font-bold">Registracija nije uspela. Proverite podatke (lozinka najmanje 8 znakova).</p>
      )}
      <form action={registracija} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1">Ime i prezime
          <input name="full_name" required className={polje} />
        </label>
        <label className="flex flex-col gap-1">Vrtić / ustanova
          <input name="institution" required className={polje} />
        </label>
        <label className="flex flex-col gap-1">Email
          <input name="email" type="email" required className={polje} />
        </label>
        <label className="flex flex-col gap-1">Lozinka
          <input name="password" type="password" minLength={8} required className={polje} />
        </label>
        <button className="btn">Napravi nalog</button>
      </form>
      <p className="mt-6"><Link href="/prijava">Već imam nalog</Link></p>
    </main>
  );
}
