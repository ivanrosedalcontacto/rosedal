"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Resultado } from "@/shared/components/mensaje-resultado";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";

const uuid = z.string().uuid();
const texto = (d: FormData, k: string) => (d.get(k) ?? "").toString();
const esquemaTarjeta = z.object({
  titulo: z.string().trim().max(160).default(""),
  que_digo: z.string().max(5000).default(""),
  texto_pantalla: z.string().max(5000).default(""),
  visual: z.string().max(2000).default(""),
  interaccion: z.enum(["ninguna", "encuesta", "pregunta", "enlace", "cta"]),
  interaccion_detalle: z.string().max(2000).default(""),
});

function refrescarStories(id: string) {
  revalidatePath(`/piezas/${id}`);
  revalidatePath("/biblioteca");
}

export async function crearTarjeta(piezaId: string) {
  const pieza = uuid.safeParse(piezaId); if (!pieza.success) return;
  const supabase = await crearClienteServidor();
  const { count } = await supabase.from("story_tarjetas").select("id", { count: "exact", head: true }).eq("pieza_id", pieza.data);
  await supabase.from("story_tarjetas").insert({ pieza_id: pieza.data, orden: count ?? 0, titulo: `Story ${(count ?? 0) + 1}` });
  refrescarStories(pieza.data);
}

export async function guardarTarjeta(piezaId: string, tarjetaId: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const pieza = uuid.safeParse(piezaId); const tarjeta = uuid.safeParse(tarjetaId);
  const r = esquemaTarjeta.safeParse({ titulo: texto(d, "titulo"), que_digo: texto(d, "que_digo"), texto_pantalla: texto(d, "texto_pantalla"), visual: texto(d, "visual"), interaccion: texto(d, "interaccion") || "ninguna", interaccion_detalle: texto(d, "interaccion_detalle") });
  if (!pieza.success || !tarjeta.success) return { error: "Tarjeta no válida." };
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa la tarjeta." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("story_tarjetas").update(r.data).eq("id", tarjeta.data).eq("pieza_id", pieza.data);
  if (error) return { error: "No se pudo guardar la tarjeta." };
  refrescarStories(pieza.data);
  return { error: null, ok: true };
}

export async function moverTarjeta(piezaId: string, tarjetaId: string, direccion: "subir" | "bajar") {
  const pieza = uuid.safeParse(piezaId); const tarjeta = uuid.safeParse(tarjetaId);
  if (!pieza.success || !tarjeta.success) return;
  const supabase = await crearClienteServidor();
  const { data: tarjetas } = await supabase.from("story_tarjetas").select("id,orden").eq("pieza_id", pieza.data).order("orden");
  const lista = tarjetas ?? [];
  const indice = lista.findIndex((x) => x.id === tarjeta.data);
  const destino = direccion === "subir" ? indice - 1 : indice + 1;
  if (indice < 0 || destino < 0 || destino >= lista.length) return;
  // Se renumera toda la secuencia (0, 1, 2…): así nunca queda un orden temporal ni huecos si dos movimientos se solapan.
  const nueva = [...lista];
  const [movida] = nueva.splice(indice, 1);
  nueva.splice(destino, 0, movida!);
  for (const [posicion, t] of nueva.entries()) {
    if (t.orden !== posicion) await supabase.from("story_tarjetas").update({ orden: posicion }).eq("id", t.id);
  }
  refrescarStories(pieza.data);
}

export async function borrarTarjeta(piezaId: string, tarjetaId: string) {
  const pieza = uuid.safeParse(piezaId); const tarjeta = uuid.safeParse(tarjetaId);
  if (!pieza.success || !tarjeta.success) return;
  const supabase = await crearClienteServidor();
  await supabase.from("story_tarjetas").delete().eq("id", tarjeta.data).eq("pieza_id", pieza.data);
  refrescarStories(pieza.data);
}

export async function duplicarTarjeta(piezaId: string, tarjetaId: string) {
  const pieza = uuid.safeParse(piezaId); const tarjeta = uuid.safeParse(tarjetaId);
  if (!pieza.success || !tarjeta.success) return;
  const supabase = await crearClienteServidor();
  const [{ data: original }, { count }] = await Promise.all([
    supabase.from("story_tarjetas").select("*").eq("id", tarjeta.data).eq("pieza_id", pieza.data).maybeSingle(),
    supabase.from("story_tarjetas").select("id", { count: "exact", head: true }).eq("pieza_id", pieza.data),
  ]);
  if (!original) return;
  await supabase.from("story_tarjetas").insert({ pieza_id: pieza.data, orden: count ?? 0, titulo: `${original.titulo} (copia)`, que_digo: original.que_digo, texto_pantalla: original.texto_pantalla, visual: original.visual, interaccion: original.interaccion, interaccion_detalle: original.interaccion_detalle });
  refrescarStories(pieza.data);
}

/** Guarda la estructura de la secuencia como plantilla, sin el texto concreto. */
export async function guardarEstructuraComoPlantilla(piezaId: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const pieza = uuid.safeParse(piezaId);
  const nombre = z.string().trim().min(1, "Ponle un nombre a la plantilla.").max(200).safeParse(texto(d, "nombre"));
  if (!pieza.success) return { error: "Pieza no válida." };
  if (!nombre.success) return { error: nombre.error.issues[0]?.message ?? "Ponle un nombre." };
  const supabase = await crearClienteServidor();
  const { data: tarjetas } = await supabase
    .from("story_tarjetas")
    .select("titulo,interaccion,interaccion_detalle,orden")
    .eq("pieza_id", pieza.data)
    .order("orden");
  const contenido = {
    tarjetas: ((tarjetas ?? []) as { titulo: string; interaccion: string; interaccion_detalle: string }[]).map((t) => ({
      titulo: t.titulo,
      que_digo: "",
      texto_pantalla: "",
      visual: "",
      interaccion: t.interaccion,
      interaccion_detalle: t.interaccion_detalle,
    })),
  };
  const { error } = await supabase.from("plantillas").insert({
    tipo: "stories",
    nombre: nombre.data,
    descripcion: "Estructura guardada desde una secuencia de stories.",
    contenido,
  });
  if (error) return { error: "No se pudo guardar la plantilla." };
  revalidatePath("/ajustes");
  refrescarStories(pieza.data);
  return { error: null, ok: true };
}
