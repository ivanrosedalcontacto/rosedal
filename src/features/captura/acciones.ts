"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Resultado } from "@/shared/components/mensaje-resultado";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";

const esquema = z.object({
  tipo: z.enum(["idea", "frase", "idea_email"]),
  // Se exige algún carácter visible, pero el texto se guarda sin recortar ni normalizar.
  texto: z.string().max(5000, "El texto es demasiado largo.").refine((v) => v.trim().length > 0, "Escribe algo antes de guardar."),
});

/** Guarda una captura rápida: solo texto, sin clasificar. */
export async function capturar(tipo: string, texto: string): Promise<Resultado> {
  const r = esquema.safeParse({ tipo, texto });
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa el texto." };

  const supabase = await crearClienteServidor();
  const { error } =
    r.data.tipo === "frase"
      ? await supabase.from("frases").insert({ texto: r.data.texto })
      : await supabase.from("ideas").insert({ texto: r.data.texto, tipo: r.data.tipo });

  if (error) return { error: "No se pudo guardar. Tu texto sigue aquí; inténtalo de nuevo." };
  revalidatePath(r.data.tipo === "frase" ? "/frases" : "/ideas");
  return { error: null, ok: true };
}
