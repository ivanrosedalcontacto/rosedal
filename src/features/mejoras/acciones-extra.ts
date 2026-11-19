"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Resultado } from "@/shared/components/mensaje-resultado";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { estadoDesdeAntiguo } from "@/features/piezas/esquemas";
import { TABLAS_Copia } from "./tablas-copia";

const uuid = z.string().uuid();
const texto = (d: FormData, k: string) => (d.get(k) ?? "").toString();

type Cliente = Awaited<ReturnType<typeof crearClienteServidor>>;

/** Tablas que entran en la copia de seguridad (en `tablas-copia.ts`). */

const esquemaCopia = z.object({
  version: z.literal(1),
  generado: z.string(),
  tablas: z.record(z.string(), z.array(z.record(z.string(), z.unknown()))),
});

function refrescar() {
  revalidatePath("/ajustes");
  revalidatePath("/biblioteca");
  revalidatePath("/hoy");
  revalidatePath("/calendario");
  revalidatePath("/ideas");
  revalidatePath("/frases");
  revalidatePath("/recursos");
  revalidatePath("/ofertas");
  revalidatePath("/lanzamientos");
  revalidatePath("/email");
  revalidatePath("/revision");
}

/** Genera la copia de seguridad en JSON: todo lo de la usuaria. */
export async function generarCopia(): Promise<string> {
  const supabase = await crearClienteServidor();
  const tablas: Record<string, Record<string, unknown>[]> = {};
  for (const tabla of TABLAS_Copia) {
    const { data } = await supabase.from(tabla).select("*");
    tablas[tabla] = (data ?? []) as Record<string, unknown>[];
  }
  return JSON.stringify({ version: 1, generado: new Date().toISOString(), tablas }, null, 2);
}

/** Exporta las piezas en CSV (una fila por pieza). */
export async function exportarPiezasCsv(): Promise<string> {
  const supabase = await crearClienteServidor();
  const { data } = await supabase
    .from("piezas")
    .select("titulo,formato,canal,estado,finalidad,fecha_prevista,fecha_real,url_publicada,texto_publicacion")
    .is("eliminado_en", null)
    .order("created_at", { ascending: false });
  const filas = (data ?? []) as Record<string, unknown>[];
  const columnas = ["titulo", "formato", "canal", "estado", "finalidad", "fecha_prevista", "fecha_real", "url_publicada", "texto_publicacion"];
  const escapar = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const lineas = [columnas.join(";")];
  for (const fila of filas) lineas.push(columnas.map((c) => escapar(fila[c])).join(";"));
  return lineas.join("\n");
}

/**
 * Restaura una copia de seguridad. Solo se permite sobre una cuenta sin datos
 * propios y se valida el archivo entero antes de escribir nada.
 */
export async function restaurarCopia(_p: Resultado, d: FormData): Promise<Resultado> {
  const bruto = texto(d, "copia");
  let json: unknown;
  try {
    json = JSON.parse(bruto);
  } catch {
    return { error: "El archivo no es un JSON válido." };
  }
  const copia = esquemaCopia.safeParse(json);
  if (!copia.success) return { error: "El archivo no tiene el formato de una copia de Rosedal." };
  const supabase = await crearClienteServidor();
  const [{ count: piezasPropias }, { count: ideasPropias }] = await Promise.all([
    supabase.from("piezas").select("id", { count: "exact", head: true }),
    supabase.from("ideas").select("id", { count: "exact", head: true }),
  ]);
  if ((piezasPropias ?? 0) > 0 || (ideasPropias ?? 0) > 0) {
    return { error: "Solo se puede restaurar en una cuenta vacía. Tu contenido actual no se toca." };
  }
  for (const tabla of TABLAS_Copia) {
    const filas = copia.data.tablas[tabla];
    if (!filas || filas.length === 0) continue;
    // Las copias anteriores al 2026-11-19 traen los estados antiguos de las piezas.
    const propias = filas.map((fila) =>
      tabla === "piezas" ? { ...fila, estado: estadoDesdeAntiguo(fila.estado, fila.grabado, fila.formato) } : { ...fila },
    );
    const { error } = await supabase.from(tabla).insert(propias as never);
    if (error) return { error: `No se pudo restaurar «${tabla}». No se ha tocado nada.` };
  }
  refrescar();
  return { error: null, ok: true };
}

/** Fechas señaladas: días que condicionan la planificación. */
export async function guardarFechaSenalada(_p: Resultado, d: FormData): Promise<Resultado> {
  const titulo = z.string().trim().min(1, "Ponle un título.").max(120).safeParse(texto(d, "titulo"));
  const inicio = z.string().date("Elige el primer día.").safeParse(texto(d, "fecha_inicio"));
  const fin = z.string().transform((v) => (v === "" ? null : v)).pipe(z.string().date().nullable()).safeParse(texto(d, "fecha_fin"));
  if (!titulo.success) return { error: titulo.error.issues[0]?.message ?? "Revisa el título." };
  if (!inicio.success) return { error: "Elige el primer día." };
  if (!fin.success) return { error: "Revisa la fecha de fin." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("fechas_senaladas").insert({
    titulo: titulo.data,
    fecha_inicio: inicio.data,
    fecha_fin: fin.data,
    nota: texto(d, "nota"),
  });
  if (error) return { error: "No se pudo guardar la fecha señalada." };
  refrescar();
  return { error: null, ok: true };
}

export async function borrarFechaSenalada(id: string) {
  const valido = uuid.safeParse(id);
  if (!valido.success) return;
  const supabase = await crearClienteServidor();
  await supabase.from("fechas_senaladas").delete().eq("id", valido.data);
  refrescar();
}

/** Ritmo semanal: cuántas piezas quiere publicar por semana. */
export async function guardarRitmo(_p: Resultado, d: FormData): Promise<Resultado> {
  const reels = z.coerce.number().int().min(0).max(50).safeParse(texto(d, "reels") || "0");
  const correos = z.coerce.number().int().min(0).max(50).safeParse(texto(d, "correos") || "0");
  const posts = z.coerce.number().int().min(0).max(50).safeParse(texto(d, "posts") || "0");
  if (!reels.success || !correos.success || !posts.success) return { error: "Revisa las cantidades." };
  const supabase = await crearClienteServidor();
  const ritmo = { reels: reels.data, correos: correos.data, posts: posts.data };
  const { data: ajustes } = await supabase.from("ajustes").select("id").maybeSingle();
  if (ajustes) {
    await supabase.from("ajustes").update({ ritmo_semanal: ritmo }).eq("id", ajustes.id);
  } else {
    await supabase.from("ajustes").insert({ ritmo_semanal: ritmo });
  }
  refrescar();
  return { error: null, ok: true };
}

/** Marca una pieza como perenne (B5). */
export async function alternarPerenne(piezaId: string, perenne: boolean) {
  const pieza = uuid.safeParse(piezaId);
  if (!pieza.success) return;
  const supabase = await crearClienteServidor();
  await supabase.from("piezas").update({ perenne }).eq("id", pieza.data);
  refrescar();
}

/** Anota un cambio de fecha prevista (A8). */
export async function anotarCambioDeFecha(
  supabase: Cliente,
  piezaId: string,
  anterior: string | null,
  nueva: string | null,
): Promise<void> {
  if (anterior === nueva) return;
  await supabase.from("pieza_cambios_fecha").insert({ pieza_id: piezaId, fecha_anterior: anterior, fecha_nueva: nueva });
}
