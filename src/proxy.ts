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

  const { data } = await supabase.auth.getUser();
  const enLogin = request.nextUrl.pathname.startsWith("/login");

  if (!data.user && !enLogin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (data.user && enLogin) {
    return NextResponse.redirect(new URL("/hoy", request.url));
  }
  return respuesta;
}

export const config = {
  // El manifiesto y los iconos son públicos: los necesita el instalador de la app.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|ico|webp)$).*)"],
};
