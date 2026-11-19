"use server";

import { revalidatePath } from "next/cache";
import type { Resultado } from "@/shared/components/mensaje-resultado";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { quitarEjemplo, sembrarEjemplo } from "./sembrar";

function refrescar() {
  revalidatePath("/ajustes");
  revalidatePath("/hoy");
  revalidatePath("/biblioteca");
  revalidatePath("/calendario");
  revalidatePath("/revision");
  revalidatePath("/mapa");
  revalidatePath("/ideas");
  revalidatePath("/frases");
  revalidatePath("/email");
  revalidatePath("/ofertas");
  revalidatePath("/lanzamientos");
}

/** Carga el ejemplo de demostración. */
export async function cargarEjemplo(_p: Resultado, _d: FormData): Promise<Resultado> {
  const supabase = await crearClienteServidor();
  const r = await sembrarEjemplo(supabase);
  refrescar();
  return { error: r.ok ? null : r.mensaje, ok: r.ok };
}

/** Quita el ejemplo: solo afecta a las filas marcadas como ejemplo. */
export async function borrarEjemplo(_p: Resultado, _d: FormData): Promise<Resultado> {
  const supabase = await crearClienteServidor();
  const r = await quitarEjemplo(supabase);
  refrescar();
  return { error: r.ok ? null : r.mensaje, ok: r.ok };
}
