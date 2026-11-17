import type { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { metricasPropuestas } from "./esquemas";

type Cliente = Awaited<ReturnType<typeof crearClienteServidor>>;

/**
 * Propone las métricas de una pieza: las de su finalidad y, si es un correo,
 * las suyas. Se crean en estado pendiente; si la pieza ya las tenía, no se tocan.
 */
export async function proponerMetricas(
  supabase: Cliente,
  pieza: { id: string; formato: string; finalidad: string | null },
): Promise<void> {
  const claves = metricasPropuestas(pieza.finalidad as never, pieza.formato === "email");
  if (claves.length === 0) return;
  const { data: existentes } = await supabase.from("pieza_metricas").select("clave").eq("pieza_id", pieza.id);
  const yaEsta = new Set((existentes ?? []).map((m) => m.clave as string));
  const nuevas = claves.filter((c) => !yaEsta.has(c));
  if (nuevas.length === 0) return;
  await supabase.from("pieza_metricas").insert(nuevas.map((clave) => ({ pieza_id: pieza.id, clave, valor: null })));
}
