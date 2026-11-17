"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
const esquemaSesion = z.object({
  nombre: z.string().trim().min(1, "Ponle un nombre a la sesión.").max(200),
  fecha: z.string().transform((v) => (v === "" ? null : v)).pipe(z.string().date().nullable()),
  notas: z.string().max(5000).default(""),
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
  const actual = lista[indice]!; const vecina = lista[destino]!;
  await supabase.from("story_tarjetas").update({ orden: -1 }).eq("id", actual.id);
  await supabase.from("story_tarjetas").update({ orden: actual.orden }).eq("id", vecina.id);
  await supabase.from("story_tarjetas").update({ orden: vecina.orden }).eq("id", actual.id);
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

export async function crearSesion(_p: Resultado, d: FormData): Promise<Resultado> {
  const r = esquemaSesion.safeParse({ nombre: texto(d, "nombre"), fecha: texto(d, "fecha"), notas: texto(d, "notas") });
  const ids = z.array(uuid).safeParse(d.getAll("pieza_ids").map(String));
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa la sesión." };
  if (!ids.success) return { error: "Revisa las piezas de la sesión." };
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.from("sesiones_grabacion").insert(r.data).select("id").single();
  if (error || !data) return { error: "No se pudo crear la sesión." };
  if (ids.data.length) await supabase.from("sesion_piezas").insert(ids.data.map((pieza_id, orden) => ({ sesion_id: data.id, pieza_id, orden })));
  revalidatePath("/grabacion");
  redirect(`/grabacion/${data.id}`);
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

export async function alternarPreparadoEnSesion(sesionId: string, piezaId: string, preparado: boolean) {  const sesion = uuid.safeParse(sesionId); const pieza = uuid.safeParse(piezaId);
  if (!sesion.success || !pieza.success) return;
  const supabase = await crearClienteServidor();
  await supabase.from("sesion_piezas").update({ preparado }).eq("sesion_id", sesion.data).eq("pieza_id", pieza.data);
  revalidatePath(`/grabacion/${sesion.data}`);
}

export async function alternarGrabadaEnSesion(sesionId: string, piezaId: string, grabado: boolean) {
  const sesion = uuid.safeParse(sesionId); const pieza = uuid.safeParse(piezaId);
  if (!sesion.success || !pieza.success) return;
  const supabase = await crearClienteServidor();
  await supabase.from("piezas").update({ grabado, grabado_en: grabado ? new Date().toISOString() : null }).eq("id", pieza.data);
  revalidatePath(`/grabacion/${sesion.data}`);
  revalidatePath("/grabacion");
  revalidatePath(`/piezas/${pieza.data}`);
}
