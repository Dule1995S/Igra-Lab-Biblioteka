import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Preuzimanje radnog lista: provera pristupa, evidencija i svež link koji važi minut. */
export async function GET(req: NextRequest, ctx: RouteContext<"/biblioteka/preuzmi/[id]">) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/prijava", req.url));

  // RLS vraća red samo nalogu sa aktivnom pretplatom vrtića.
  const { data: w } = await supabase.from("worksheets").select("id,file_path").eq("id", id).maybeSingle();
  if (!w) return new Response("Radni list nije pronađen ili pretplata nije aktivna.", { status: 404 });

  const filename = w.file_path.split("/").pop() ?? "radni-list.pdf";
  const { data: signed } = await supabase.storage.from("worksheets").createSignedUrl(w.file_path, 60, { download: filename });
  if (!signed) return new Response("Fajl nije dostupan.", { status: 404 });

  const { data: me } = await supabase.from("profiles").select("org_id").eq("id", user.id).maybeSingle();
  await supabase.from("downloads").insert({ user_id: user.id, org_id: me?.org_id ?? null, worksheet_id: w.id });

  return NextResponse.redirect(signed.signedUrl);
}
