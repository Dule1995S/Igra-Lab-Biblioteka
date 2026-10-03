import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function prijava(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });
  if (error) redirect("/prijava?greska=1");
  redirect("/biblioteka");
}

export default async function Prijava({ searchParams }: PageProps<"/prijava">) {
  const { greska } = await searchParams;
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-[34px] font-extrabold">Prijava</h1>
      {greska && (
        <p role="alert" className="mt-4 font-bold">Pogrešan email ili lozinka.</p>
      )}
      <form action={prijava} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1">Email
          <input name="email" type="email" required className="rounded-lg border border-black/30 bg-white px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1">Lozinka
          <input name="password" type="password" required className="rounded-lg border border-black/30 bg-white px-3 py-2" />
        </label>
        <button className="btn">Prijavi se</button>
      </form>
      <p className="mt-6"><Link href="/registracija">Nemam nalog</Link></p>
    </main>
  );
}
