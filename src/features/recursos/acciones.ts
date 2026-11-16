"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Resultado } from "@/shared/components/mensaje-resultado";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { esquemaRecurso } from "./esquemas";

const texto = (d: FormData, k: string) => (d.get(k) ?? "").toString();

export async function crearRecurso(_p: Resultado, d: FormData): Promise<Resultado> {
  const r = esquemaRecurso.safeParse({
    tipo: texto(d, "tipo"),
    titulo: texto(d, "titulo"),
    texto: texto(d, "texto"),
    url: texto(d, "url"),
    autor: texto(d, "autor"),
    autorizado: d.get("autorizado") === "on",
  });
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa los datos." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("recursos_marca").insert(r.data);
  if (error) return { error: "No se pudo guardar. Tu texto sigue aquí; inténtalo de nuevo." };
  revalidatePath("/recursos");
  return { error: null, ok: true };
}

/** Envía el recurso a la papelera (borrado lógico). */
export async function quitarRecurso(id: string) {
  const idValido = z.string().uuid().safeParse(id);
  if (!idValido.success) return;
  const supabase = await crearClienteServidor();
  await supabase.from("recursos_marca").update({ eliminado_en: new Date().toISOString() }).eq("id", idValido.data);
  revalidatePath("/recursos");
}
