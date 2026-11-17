"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Resultado } from "@/shared/components/mensaje-resultado";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";

const uuid = z.string().uuid();
const texto = (d: FormData, k: string) => (d.get(k) ?? "").toString();

function refrescar() {
  revalidatePath("/ajustes");
  revalidatePath("/lanzamientos");
  revalidatePath("/email");
  revalidatePath("/biblioteca");
}

/** Duplica una plantilla: la copia no tiene clave, así que se puede borrar o editar libre. */
export async function duplicarPlantilla(id: string) {
  const plantilla = uuid.safeParse(id);
  if (!plantilla.success) return;
  const supabase = await crearClienteServidor();
  const { data } = await supabase.from("plantillas").select("tipo,nombre,descripcion,contenido").eq("id", plantilla.data).maybeSingle();
  if (!data) return;
  await supabase.from("plantillas").insert({
    tipo: data.tipo,
    nombre: `${data.nombre} (copia)`,
    descripcion: data.descripcion,
    contenido: data.contenido,
  });
  refrescar();
}

/** Quita una plantilla propia. Las que vienen con la app (con clave) no se pueden quitar. */
export async function eliminarPlantilla(id: string) {
  const plantilla = uuid.safeParse(id);
  if (!plantilla.success) return;
  const supabase = await crearClienteServidor();
  await supabase.from("plantillas").delete().eq("id", plantilla.data).is("clave", null);
  refrescar();
}

/** Guarda una plantilla de secuencia de correo (pasos, plazos y finalidad). */
export async function guardarPlantillaSecuencia(
  plantillaId: string | null,
  _p: Resultado,
  d: FormData,
): Promise<Resultado> {
  const nombre = z.string().trim().min(1, "Ponle un nombre a la plantilla.").max(200).safeParse(texto(d, "nombre"));
  const descripcion = z.string().trim().max(1000).safeParse(texto(d, "descripcion"));
  const contenido = leerJson(texto(d, "contenido"));
  if (!nombre.success) return { error: nombre.error.issues[0]?.message ?? "Revisa el nombre." };
  if (!descripcion.success) return { error: "Revisa la descripción." };
  if (!contenido) return { error: "La plantilla no tiene una estructura válida." };
  const supabase = await crearClienteServidor();
  const valores = { nombre: nombre.data, descripcion: descripcion.data, contenido };
  if (plantillaId === null) {
    const { error } = await supabase.from("plantillas").insert({ ...valores, tipo: "secuencia_email" });
    if (error) return { error: "No se pudo guardar la plantilla." };
  } else {
    const id = uuid.safeParse(plantillaId);
    if (!id.success) return { error: "Plantilla no válida." };
    const { error } = await supabase
      .from("plantillas")
      .update(valores)
      .eq("id", id.data)
      .eq("tipo", "secuencia_email");
    if (error) return { error: "No se pudo guardar la plantilla." };
  }
  refrescar();
  return { error: null, ok: true };
}

/** Guarda una plantilla de stories (sus tarjetas). */
export async function guardarPlantillaStories(
  plantillaId: string | null,
  _p: Resultado,
  d: FormData,
): Promise<Resultado> {
  const nombre = z.string().trim().min(1, "Ponle un nombre a la plantilla.").max(200).safeParse(texto(d, "nombre"));
  const descripcion = z.string().trim().max(1000).safeParse(texto(d, "descripcion"));
  const contenido = leerJson(texto(d, "contenido"));
  if (!nombre.success) return { error: nombre.error.issues[0]?.message ?? "Revisa el nombre." };
  if (!descripcion.success) return { error: "Revisa la descripción." };
  if (!contenido) return { error: "La plantilla no tiene una estructura válida." };
  const supabase = await crearClienteServidor();
  const valores = { nombre: nombre.data, descripcion: descripcion.data, contenido };
  if (plantillaId === null) {
    const { error } = await supabase.from("plantillas").insert({ ...valores, tipo: "stories" });
    if (error) return { error: "No se pudo guardar la plantilla." };
  } else {
    const id = uuid.safeParse(plantillaId);
    if (!id.success) return { error: "Plantilla no válida." };
    const { error } = await supabase.from("plantillas").update(valores).eq("id", id.data).eq("tipo", "stories");
    if (error) return { error: "No se pudo guardar la plantilla." };
  }
  refrescar();
  return { error: null, ok: true };
}

/** Crea una pieza de stories con las tarjetas de una plantilla. */
export async function crearPiezaDesdePlantillaStories(
  _p: Resultado,
  d: FormData,
): Promise<Resultado> {
  const plantilla = uuid.safeParse(texto(d, "plantilla_id"));
  const titulo = z.string().trim().min(1, "Ponle un título a la pieza.").max(300).safeParse(texto(d, "titulo"));
  if (!plantilla.success) return { error: "Elige una plantilla." };
  if (!titulo.success) return { error: titulo.error.issues[0]?.message ?? "Ponle un título." };
  const supabase = await crearClienteServidor();
  const { data: fila } = await supabase
    .from("plantillas")
    .select("contenido")
    .eq("id", plantilla.data)
    .eq("tipo", "stories")
    .maybeSingle();
  if (!fila) return { error: "No encontramos esa plantilla." };
  const contenido = fila.contenido as { tarjetas?: { titulo: string; que_digo: string; texto_pantalla: string; interaccion: string; interaccion_detalle: string }[] };
  const tarjetas = Array.isArray(contenido.tarjetas) ? contenido.tarjetas : [];
  const { data: pieza, error } = await supabase
    .from("piezas")
    .insert({ titulo: titulo.data, formato: "stories", canal: "instagram", estado: "borrador" })
    .select("id")
    .single();
  if (error || !pieza) return { error: "No se pudo crear la pieza." };
  if (tarjetas.length > 0) {
    await supabase.from("story_tarjetas").insert(
      tarjetas.map((t, i) => ({
        pieza_id: pieza.id,
        orden: i,
        titulo: t.titulo ?? "",
        que_digo: t.que_digo ?? "",
        texto_pantalla: t.texto_pantalla ?? "",
        visual: "",
        interaccion: t.interaccion ?? "ninguna",
        interaccion_detalle: t.interaccion_detalle ?? "",
      })),
    );
  }
  revalidatePath("/biblioteca");
  redirect(`/piezas/${pieza.id}`);
}

function leerJson(valor: string): unknown | null {
  try {
    const json: unknown = JSON.parse(valor);
    return typeof json === "object" && json !== null ? json : null;
  } catch {
    return null;
  }
}
