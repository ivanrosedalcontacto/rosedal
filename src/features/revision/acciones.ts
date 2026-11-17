"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Resultado } from "@/shared/components/mensaje-resultado";
import { esFecha } from "@/shared/lib/fechas";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { CATALOGO_METRICAS, ETIQUETA_METRICA, METRICAS_CON_ATRIBUCION } from "./esquemas";

const uuid = z.string().uuid();
const texto = (d: FormData, k: string) => (d.get(k) ?? "").toString();

function refrescar(piezaId?: string) {
  revalidatePath("/revision");
  revalidatePath("/mapa");
  revalidatePath("/hoy");
  if (piezaId) revalidatePath(`/piezas/${piezaId}`);
}

/**
 * Guarda las métricas de una pieza. Cada clave enviada se actualiza; las que
 * ya no están en la lista se quitan («dejar de seguir»). Un campo vacío
 * devuelve la métrica a pendiente; escribir 0 registra un cero.
 */
export async function guardarMetricas(piezaId: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const pieza = uuid.safeParse(piezaId);
  if (!pieza.success) return { error: "Pieza no válida." };
  const claves = texto(d, "claves")
    .split(",")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
  const invalida = claves.find((c) => !CATALOGO_METRICAS.includes(c));
  if (invalida) return { error: `«${ETIQUETA_METRICA[invalida] ?? invalida}» no es una métrica del catálogo.` };

  const supabase = await crearClienteServidor();
  const { data: actuales } = await supabase.from("pieza_metricas").select("id,clave").eq("pieza_id", pieza.data);
  const actualesClaves = new Set((actuales ?? []).map((m) => m.clave as string));

  for (const clave of claves) {
    const valorBruto = texto(d, `valor_${clave}`).trim();
    const valor = valorBruto === "" ? null : Number(valorBruto.replace(",", "."));
    if (valor !== null && (!Number.isFinite(valor) || valor < 0)) {
      return { error: "Las métricas llevan un número (o un 0 si no hubo ninguna)." };
    }
    const atribucionBruta = texto(d, `atribucion_${clave}`);
    const atribucion = METRICAS_CON_ATRIBUCION.includes(clave) && atribucionBruta ? atribucionBruta : null;
    if (actualesClaves.has(clave)) {
      await supabase.from("pieza_metricas").update({ valor, atribucion }).eq("pieza_id", pieza.data).eq("clave", clave);
    } else {
      await supabase.from("pieza_metricas").insert({ pieza_id: pieza.data, clave, valor, atribucion });
    }
  }

  // Las que desaparecen de la lista dejan de seguirse.
  const quitadas = [...actualesClaves].filter((c) => !claves.includes(c));
  if (quitadas.length > 0) {
    await supabase.from("pieza_metricas").delete().eq("pieza_id", pieza.data).in("clave", quitadas);
  }
  refrescar(pieza.data);
  return { error: null, ok: true };
}

/** Lo que se aprende de la pieza, en una línea. */
export async function guardarAprendizaje(piezaId: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const pieza = uuid.safeParse(piezaId);
  const nota = z.string().trim().max(1000).safeParse(texto(d, "aprendizaje"));
  if (!pieza.success) return { error: "Pieza no válida." };
  if (!nota.success) return { error: "La nota es demasiado larga." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("piezas")
    .update({ aprendizaje: nota.data || null })
    .eq("id", pieza.data)
    .is("publicado_snapshot", null);
  if (error) return { error: "No se pudo guardar la nota." };
  refrescar(pieza.data);
  return { error: null, ok: true };
}

/** «Retomar el…»: fija el día en que la pieza vuelve a aparecer en Hoy. */
export async function retomarPieza(piezaId: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const pieza = uuid.safeParse(piezaId);
  const fecha = texto(d, "retomar_el");
  const nota = z.string().trim().max(500).safeParse(texto(d, "nota_retomar"));
  if (!pieza.success) return { error: "Pieza no válida." };
  if (fecha !== "" && !esFecha(fecha)) return { error: "Elige un día." };
  if (!nota.success) return { error: "La nota es demasiado larga." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("piezas")
    .update({ retomar_el: fecha === "" ? null : fecha, nota_retomar: nota.data || null })
    .eq("id", pieza.data)
    .is("publicado_snapshot", null);
  if (error) return { error: "No se pudo marcar para retomar." };
  refrescar(pieza.data);
  return { error: null, ok: true };
}
