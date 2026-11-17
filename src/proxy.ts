import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { leerEntorno } from "@/shared/lib/supabase/entorno";

/** Refresca la sesión y manda a /login si no hay usuaria. La autorización real va en cada consulta (RLS). */
export async function proxy(request: NextRequest) {
  const { url, clave } = leerEntorno();
  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(url, clave, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (lista) => {
        lista.forEach(({ name, value }) => request.cookies.set(name, value));
        respuesta = NextResponse.next({ request });
        lista.forEach(({ name, value, options }) => respuesta.cookies.set(name, value, options));
      },
    },
  });

  // getClaims verifica el token en local (sin viajar a Supabase en cada navegación) y lo refresca si hace falta.
  const { data } = await supabase.auth.getClaims();
  const haySesion = Boolean(data?.claims);
  const enLogin = request.nextUrl.pathname.startsWith("/login");

  if (!haySesion && !enLogin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (haySesion && enLogin) {
    return NextResponse.redirect(new URL("/hoy", request.url));
  }
  return respuesta;
}

export const config = {
  // El manifiesto y los iconos son públicos: los necesita el instalador de la app.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|ico|webp)$).*)"],
};
