import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Povratak sa linka iz emaila (nova lozinka): razmenjuje kod za sesiju. */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/biblioteka/nalog";
  const safe = next.startsWith("/") && !next.startsWith("//") ? next : "/biblioteka/nalog";
  if (code && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(safe, origin));
  }
  return NextResponse.redirect(new URL("/prijava?greska=1", origin));
}
