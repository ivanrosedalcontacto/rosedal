import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { leerEntorno } from "./entorno";

export async function crearClienteServidor() {
  const { url, clave } = leerEntorno();
  const almacen = await cookies();
  return createServerClient(url, clave, {
    cookies: {
      getAll: () => almacen.getAll(),
      setAll: (lista) => {
        try {
          lista.forEach(({ name, value, options }) => almacen.set(name, value, options));
        } catch {
          // En Server Components no se pueden escribir cookies; el proxy ya refresca la sesión.
        }
      },
    },
  });
}
