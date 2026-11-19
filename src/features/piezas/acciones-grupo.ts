"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Resultado } from "@/shared/components/mensaje-resultado";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";

const esquemaGrupo = z.object({
  ids: z.array(z.string().uuid()).min(1, "Elige al menos una pieza.").max(200, "Son demasiadas piezas a la vez."),
  accion: z.enum(["grabadas", "papelera"]),
});

/**
 * Acciones sobre varias piezas pendientes de la carpeta de un pilar.
 * Solo tocan piezas en Borrador y sin publicar: lo publicado nunca se mueve ni se borra desde aquí.
 * La papelera es un borrado lógico (se puede restaurar desde Ajustes).
 */
export async function actuarEnGrupo(ids: string[], accion: "grabadas" | "papelera"): Promise<Resultado> {
  const r = esquemaGrupo.safeParse({ ids, accion });
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa la selección." };
  const supabase = await crearClienteServidor();
  if (r.data.accion === "grabadas") {
    // Un correo no se graba: pasa a Editado, que también cuenta como «ya hecho».
    const [video, correo] = await Promise.all([
      supabase.from("piezas").update({ estado: "grabado" }).in("id", r.data.ids).eq("estado", "borrador").neq("formato", "email"),
      supabase.from("piezas").update({ estado: "editado" }).in("id", r.data.ids).eq("estado", "borrador").eq("formato", "email"),
    ]);
    if (video.error || correo.error) return { error: "No se pudieron mover las piezas. Inténtalo de nuevo." };
  } else {
    const { error } = await supabase
      .from("piezas")
      .update({ eliminado_en: new Date().toISOString() })
      .in("id", r.data.ids)
      .eq("estado", "borrador")
      .is("publicado_snapshot", null)
      .is("eliminado_en", null);
    if (error) return { error: "No se pudieron enviar a la papelera. Inténtalo de nuevo." };
  }
  revalidatePath("/biblioteca", "layout");
  revalidatePath("/hoy");
  revalidatePath("/calendario");
  return { error: null, ok: true };
}
