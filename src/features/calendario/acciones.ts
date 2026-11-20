"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Resultado } from "@/shared/components/mensaje-resultado";
import { esFecha } from "@/shared/lib/fechas";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { anotarCambioDeFecha } from "@/features/mejoras/acciones-extra";

const uuid = z.string().uuid();
const texto = (d: FormData, k: string) => (d.get(k) ?? "").toString();

/**
 * Mover una pieza cambia solo su fecha prevista. Las piezas publicadas no se
 * mueven: su fecha real se corrige desde su ficha.
 */
export async function moverPiezaAFecha(_p: Resultado, d: FormData): Promise<Resultado> {
  const pieza = uuid.safeParse(texto(d, "pieza_id"));
  const fecha = texto(d, "fecha_prevista");
  if (!pieza.success) return { error: "Pieza no válida." };
  if (fecha !== "" && !esFecha(fecha)) return { error: "Elige una fecha del calendario." };
  const supabase = await crearClienteServidor();
  const { data } = await supabase.from("piezas").select("id,estado,fecha_prevista").eq("id", pieza.data).maybeSingle();
  if (!data) return { error: "No encontramos la pieza." };
  if (data.estado === "publicado") return { error: "Una pieza publicada no se mueve: corrige su fecha real desde la ficha." };
  const { error } = await supabase
    .from("piezas")
    .update({ fecha_prevista: fecha === "" ? null : fecha })
    .eq("id", pieza.data)
    .is("publicado_snapshot", null);
  if (error) return { error: "No se pudo cambiar la fecha." };
  await anotarCambioDeFecha(supabase, pieza.data, data.fecha_prevista, fecha === "" ? null : fecha);
  revalidatePath("/calendario");
  revalidatePath("/hoy");
  revalidatePath("/biblioteca");
  return { error: null, ok: true };
}

/**
 * Programar desde el calendario (día → pilar → pieza): solo piezas Editadas.
 * `volver` es la vista del calendario de la que se vino; solo se aceptan rutas del calendario.
 */
export async function programarPieza(piezaId: string, fecha: string, volver: string): Promise<void> {
  const pieza = uuid.safeParse(piezaId);
  const destino = volver.startsWith("/calendario") && !volver.startsWith("//") ? volver : "/calendario";
  if (!pieza.success || !esFecha(fecha)) redirect(destino);
  const supabase = await crearClienteServidor();
  const { data } = await supabase.from("piezas").select("estado,fecha_prevista").eq("id", pieza.data).maybeSingle();
  if (data && data.estado === "editado") {
    const { error } = await supabase.from("piezas").update({ fecha_prevista: fecha }).eq("id", pieza.data).is("publicado_snapshot", null);
    if (!error) await anotarCambioDeFecha(supabase, pieza.data, data.fecha_prevista, fecha);
  }
  revalidatePath("/calendario");
  revalidatePath("/hoy");
  redirect(destino);
}
