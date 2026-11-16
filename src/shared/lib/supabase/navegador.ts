import { createBrowserClient } from "@supabase/ssr";
import { leerEntorno } from "./entorno";

export function crearClienteNavegador() {
  const { url, clave } = leerEntorno();
  return createBrowserClient(url, clave);
}
