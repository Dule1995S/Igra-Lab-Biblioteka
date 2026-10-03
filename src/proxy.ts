import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Osvežava Supabase sesiju i šalje neprijavljene sa /biblioteka na prijavu.
// Prava pristupa se proveravaju i na stranici i u bazi (RLS), ne samo ovde.
export async function proxy(request: NextRequest) {
  // Bez Supabase podešavanja (npr. prvi pregled) sajt radi, samo bez prijave.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Zaštićen deo bez podešene baze ne sme da bude dostupan.
    if (request.nextUrl.pathname.startsWith("/biblioteka")) return NextResponse.redirect(new URL("/prijava", request.url));
    return NextResponse.next();
  }
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getUser();

  if (!data.user && request.nextUrl.pathname.startsWith("/biblioteka")) {
    return NextResponse.redirect(new URL("/prijava", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico)$).*)"],
};
