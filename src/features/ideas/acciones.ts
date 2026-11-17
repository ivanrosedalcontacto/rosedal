"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Resultado } from "@/shared/components/mensaje-resultado";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { CAMPO_DIMENSION, DIMENSIONES, TIPOS_ANGULO, esquemaIdea, esquemaPregunta } from "./esquemas";

const texto = (d: FormData, k: string) => (d.get(k) ?? "").toString();
const uuid = z.string().uuid();

function refrescar(id?: string) {
  revalidatePath("/ideas");
  if (id) revalidatePath(`/ideas/${id}`);
}

export async function guardarIdea(id: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const idValido = uuid.safeParse(id);
  if (!idValido.success) return { error: "Idea no válida." };
  const r = esquemaIdea.safeParse(Object.fromEntries(
    ["texto", "tipo", "estado", "pilar_id", "oferta_id", "lanzamiento_id", "tema", "problema_audiencia", "procedencia",
      "relevancia", "demanda", "minutos_preparacion", "notas"].map((k) => [k, texto(d, k)]),
  ));
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa los datos." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("ideas").update(r.data).eq("id", idValido.data);
  if (error) return { error: "No se pudo guardar. Tu texto sigue aquí; inténtalo de nuevo." };
  refrescar(idValido.data);
  return { error: null, ok: true };
}

export async function crearPregunta(_p: Resultado, d: FormData): Promise<Resultado> {
  const r = esquemaPregunta.safeParse({
    tipo: texto(d, "tipo") || "pregunta",
    palabras: texto(d, "palabras"),
    procedencia: texto(d, "procedencia"),
    oferta_id: texto(d, "oferta_id"),
  });
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa los datos." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("ideas").insert({
    texto: r.data.palabras,
    palabras_originales: r.data.palabras,
    tipo: r.data.tipo,
    procedencia: r.data.procedencia,
    oferta_id: r.data.oferta_id,
  });
  if (error) return { error: "No se pudo guardar. Tu texto sigue aquí; inténtalo de nuevo." };
  refrescar();
  return { error: null, ok: true };
}

/** «Ha vuelto a aparecer»: suma una aparición. */
export async function sumarAparicion(id: string) {
  const idValido = uuid.safeParse(id);
  if (!idValido.success) return;
  const supabase = await crearClienteServidor();
  const { data } = await supabase.from("ideas").select("veces_aparecida").eq("id", idValido.data).maybeSingle();
  if (!data) return;
  await supabase.from("ideas").update({ veces_aparecida: data.veces_aparecida + 1 }).eq("id", idValido.data);
  refrescar(idValido.data);
}

export async function cambiarEstadoIdea(id: string, estado: "pendiente" | "archivada") {
  const idValido = uuid.safeParse(id);
  if (!idValido.success) return;
  const supabase = await crearClienteServidor();
  await supabase.from("ideas").update({ estado }).eq("id", idValido.data);
  refrescar(idValido.data);
}

/** Envía la idea a la papelera (borrado lógico) y vuelve a la bandeja. */
export async function quitarIdea(id: string) {
  const idValido = uuid.safeParse(id);
  if (!idValido.success) return;
  const supabase = await crearClienteServidor();
  await supabase.from("ideas").update({ eliminado_en: new Date().toISOString() }).eq("id", idValido.data);
  revalidatePath("/ideas");
  redirect("/ideas");
}

function valorDimension(por: string, valor: string): { campo: string; valor: string | null } | null {
  const dim = z.enum(DIMENSIONES).safeParse(por);
  if (!dim.success) return null;
  const v = valor.trim();
  if ((dim.data === "pilar" || dim.data === "oferta") && v !== "" && !uuid.safeParse(v).success) return null;
  return { campo: CAMPO_DIMENSION[dim.data], valor: v === "" ? null : v };
}

/** Brainstorming: mover una idea a otra columna cambia ese valor en la idea. */
export async function moverIdea(id: string, por: string, valor: string) {
  const idValido = uuid.safeParse(id);
  const destino = valorDimension(por, valor);
  if (!idValido.success || !destino) return;
  const supabase = await crearClienteServidor();
  await supabase.from("ideas").update({ [destino.campo]: destino.valor }).eq("id", idValido.data);
  refrescar();
}

/** Brainstorming: crear una idea directamente dentro de una columna. */
export async function crearIdeaEnColumna(_p: Resultado, d: FormData): Promise<Resultado> {
  const destino = valorDimension(texto(d, "por"), texto(d, "valor"));
  const t = z.string().max(5000).refine((v) => v.trim().length > 0, "Escribe la idea.").safeParse(texto(d, "texto"));
  if (!destino) return { error: "Columna no válida." };
  if (!t.success) return { error: t.error.issues[0]?.message ?? "Escribe la idea." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("ideas").insert({ texto: t.data, [destino.campo]: destino.valor });
  if (error) return { error: "No se pudo guardar. Inténtalo de nuevo." };
  refrescar();
  return { error: null, ok: true };
}

export async function guardarAngulo(ideaId: string, tipo: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const idValido = uuid.safeParse(ideaId);
  const t = z.enum(TIPOS_ANGULO).safeParse(tipo);
  const nota = z.string().max(3000).safeParse(texto(d, "nota"));
  if (!idValido.success || !t.success || !nota.success) return { error: "Revisa los datos." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("idea_angulos")
    .upsert({ idea_id: idValido.data, tipo: t.data, nota: nota.data }, { onConflict: "idea_id,tipo" });
  if (error) return { error: "No se pudo guardar el ángulo. Inténtalo de nuevo." };
  refrescar(idValido.data);
  return { error: null, ok: true };
}

export async function quitarAngulo(ideaId: string, tipo: string) {
  const idValido = uuid.safeParse(ideaId);
  const t = z.enum(TIPOS_ANGULO).safeParse(tipo);
  if (!idValido.success || !t.success) return;
  const supabase = await crearClienteServidor();
  await supabase.from("idea_angulos").delete().eq("idea_id", idValido.data).eq("tipo", t.data);
  refrescar(idValido.data);
}
