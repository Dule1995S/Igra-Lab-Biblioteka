import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Captcha, { captchaToken } from "@/components/sajt/Captcha";
import { SAJT } from "@/lib/sajt";
import { createClient } from "@/lib/supabase/server";

async function posalji(formData: FormData) {
  "use server";
  if (process.env.NEXT_PUBLIC_EMAIL_RESET !== "1") notFound();
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(String(formData.get("email") ?? "").trim(), {
      redirectTo: `${SAJT.url}/auth/callback?next=/biblioteka/nalog`,
      captchaToken: captchaToken(formData),
    });
  }
  // Isti odgovor bez obzira da li nalog postoji (ne otkriva se ko ima nalog).
  redirect("/zaboravljena-lozinka?poslato=1");
}

export default async function ZaboravljenaLozinka({ searchParams }: PageProps<"/zaboravljena-lozinka">) {
  if (process.env.NEXT_PUBLIC_EMAIL_RESET !== "1") notFound();
  const { poslato } = await searchParams;
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-[34px] font-extrabold">Zaboravljena lozinka</h1>
      {poslato ? (
        <p role="status" className="mt-4 rounded-xl bg-brand-cool/20 p-4 font-bold">
          Ako nalog sa tim emailom postoji, poslali smo link za novu lozinku. Proverite i neželjenu poštu.
        </p>
      ) : (
        <form action={posalji} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1">Email
            <input name="email" type="email" required className="rounded-lg border border-black/30 bg-white px-3 py-2" />
          </label>
          <Captcha />
          <button className="btn">Pošalji link</button>
        </form>
      )}
      <p className="mt-6"><Link href="/prijava">Nazad na prijavu</Link></p>
    </main>
  );
}
