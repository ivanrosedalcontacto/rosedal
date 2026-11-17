"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Resultado } from "@/shared/components/mensaje-resultado";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { anotarCambioDeFecha } from "@/features/mejoras/acciones-extra";
import { proponerMetricas } from "@/features/revision/metricas";
import { esquemaNuevaPieza, esquemaPieza, esquemaVersion, type EstadoPieza } from "./esquemas";

const uuid = z.string().uuid();
const texto = (d: FormData, k: string) => (d.get(k) ?? "").toString();

function refrescar(id?: string, ideaId?: string | null) {
  revalidatePath("/biblioteca");
  if (id) revalidatePath(`/piezas/${id}`);
  if (ideaId) revalidatePath(`/ideas/${ideaId}`);
}

function datosNuevaPieza(d: FormData) {
  return esquemaNuevaPieza.safeParse({
    titulo: texto(d, "titulo"),
    formato: texto(d, "formato") || "reel",
    canal: texto(d, "canal") || "instagram",
    finalidad: texto(d, "finalidad") || null,
    idea_id: texto(d, "idea_id"),
    oferta_id: texto(d, "oferta_id"),
    lanzamiento_id: texto(d, "lanzamiento_id"),
    fase_id: texto(d, "fase_id"),
    fecha_prevista: texto(d, "fecha_prevista"),
  });
}

async function registrarUsoDeFrase(supabase: Awaited<ReturnType<typeof crearClienteServidor>>, pieza: { id: string; frase_id: string | null }, fecha: string, url: string | null) {
  if (!pieza.frase_id) return;
  const { data: frase } = await supabase.from("frases").select("texto").eq("id", pieza.frase_id).maybeSingle();
  if (!frase) return;
  const { data: existente } = await supabase.from("frase_usos").select("id").eq("pieza_id", pieza.id).maybeSingle();
  if (existente) return;
  await supabase.from("frase_usos").insert({ frase_id: pieza.frase_id, pieza_id: pieza.id, fecha, url, texto_usado: frase.texto });
}

export async function crearPieza(_p: Resultado, d: FormData): Promise<Resultado> {
  const r = datosNuevaPieza(d);
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa los datos." };
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.from("piezas").insert(r.data).select("id").single();
  if (error || !data) return { error: "No se pudo crear la pieza. Inténtalo de nuevo." };
  const { error: errorVersion } = await supabase
    .from("pieza_versiones")
    .insert({ pieza_id: data.id, tipo: "guion", nombre: "Versión 1", elegida: true });
  if (errorVersion) return { error: "La pieza se creó, pero no se pudo preparar su primer guion." };
  revalidatePath("/biblioteca");
  if (r.data.idea_id) revalidatePath(`/ideas/${r.data.idea_id}`);
  redirect(`/piezas/${data.id}`);
}

export async function guardarPieza(id: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const idValido = uuid.safeParse(id);
  const r = esquemaPieza.safeParse({
    titulo: texto(d, "titulo"), formato: texto(d, "formato"), canal: texto(d, "canal"),
    pilar_id: texto(d, "pilar_id"), finalidad: texto(d, "finalidad") || null, oferta_id: texto(d, "oferta_id"),
    lanzamiento_id: texto(d, "lanzamiento_id"), fase_id: texto(d, "fase_id"),
    cta_accion: texto(d, "cta_accion"), cta_como: texto(d, "cta_como"), cta_url: texto(d, "cta_url"),
    texto_publicacion: texto(d, "texto_publicacion"), texto_en_pantalla: texto(d, "texto_en_pantalla"),
    notas: texto(d, "notas"), plano: texto(d, "plano"), preparacion: texto(d, "preparacion"),
    duracion_seg: texto(d, "duracion_seg"), fecha_prevista: texto(d, "fecha_prevista"),
    email_tematica: texto(d, "email_tematica"), email_audiencia: texto(d, "email_audiencia"),
  });
  if (!idValido.success) return { error: "Pieza no válida." };
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa los datos." };
  const supabase = await crearClienteServidor();
  const valores = { ...r.data };
  // La fase solo vale si pertenece al lanzamiento elegido.
  if (!valores.lanzamiento_id) valores.fase_id = null;
  else if (valores.fase_id) {
    const { data: fase } = await supabase
      .from("lanzamiento_fases")
      .select("lanzamiento_id")
      .eq("id", valores.fase_id)
      .maybeSingle();
    if (!fase || fase.lanzamiento_id !== valores.lanzamiento_id) valores.fase_id = null;
  }
  const { error } = await supabase.from("piezas").update(valores).eq("id", idValido.data).is("publicado_snapshot", null);
  if (error) return { error: "No se pudo guardar. La pieza publicada no se puede editar." };
  const { data: antes } = await supabase.from("piezas").select("fecha_prevista").eq("id", idValido.data).maybeSingle();
  if (antes && antes.fecha_prevista !== valores.fecha_prevista) {
    await anotarCambioDeFecha(supabase, idValido.data, antes.fecha_prevista, valores.fecha_prevista);
  }
  refrescar(idValido.data);
  return { error: null, ok: true };
}

export async function guardarVersion(piezaId: string, versionId: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const pieza = uuid.safeParse(piezaId);
  const version = uuid.safeParse(versionId);
  const r = esquemaVersion.safeParse({ nombre: texto(d, "nombre"), gancho: texto(d, "gancho"), desarrollo: texto(d, "desarrollo"), cierre: texto(d, "cierre") });
  if (!pieza.success || !version.success) return { error: "Versión no válida." };
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa los datos." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("pieza_versiones").update(r.data).eq("id", version.data);
  if (error) return { error: "No se pudo guardar la versión." };
  refrescar(pieza.data);
  return { error: null, ok: true };
}

export async function crearVersion(piezaId: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const id = uuid.safeParse(piezaId);
  if (!id.success) return { error: "Pieza no válida." };
  const supabase = await crearClienteServidor();
  const { count } = await supabase.from("pieza_versiones").select("id", { count: "exact", head: true }).eq("pieza_id", id.data).eq("tipo", "guion");
  const r = esquemaVersion.safeParse({ nombre: texto(d, "nombre") || `Versión ${(count ?? 0) + 1}`, gancho: texto(d, "gancho"), desarrollo: texto(d, "desarrollo"), cierre: texto(d, "cierre") });
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa los datos." };
  const { error } = await supabase.from("pieza_versiones").insert({ ...r.data, pieza_id: id.data, tipo: "guion", elegida: (count ?? 0) === 0, orden: count ?? 0 });
  if (error) return { error: "No se pudo crear la versión." };
  refrescar(id.data);
  return { error: null, ok: true };
}

export async function elegirVersion(piezaId: string, versionId: string) {
  const p = uuid.safeParse(piezaId); const v = uuid.safeParse(versionId);
  if (!p.success || !v.success) return;
  const supabase = await crearClienteServidor();
  await supabase.from("pieza_versiones").update({ elegida: false }).eq("pieza_id", p.data).eq("tipo", "guion");
  await supabase.from("pieza_versiones").update({ elegida: true }).eq("id", v.data).eq("pieza_id", p.data);
  refrescar(p.data);
}

/** Cambio de columna del tablero: conserva las reglas de estado de la ficha. */
export async function moverPiezaEnTablero(id: string, estado: EstadoPieza) {
  const pieza = uuid.safeParse(id);
  const destino = z.enum(["borrador", "en_preparacion", "listo", "planificado", "publicado"]).safeParse(estado);
  if (!pieza.success || !destino.success || ["planificado", "publicado"].includes(destino.data)) return;
  const supabase = await crearClienteServidor();
  await supabase.from("piezas").update({ estado: destino.data }).eq("id", pieza.data);
  refrescar(pieza.data);
}

export async function cambiarEstadoPieza(id: string, estado: EstadoPieza, fechaReal?: string) {
  const pieza = uuid.safeParse(id); const estadoValido = z.enum(["borrador", "en_preparacion", "listo", "planificado", "publicado"]).safeParse(estado);
  if (!pieza.success || !estadoValido.success) return;
  const supabase = await crearClienteServidor();
  const valores: Record<string, unknown> = { estado: estadoValido.data };
  let datosPieza: { id: string; formato: string; finalidad: string | null } | null = null;
  if (estadoValido.data === "publicado") {
    const { data } = await supabase.from("piezas").select("*").eq("id", pieza.data).single();
    if (!data) return;
    datosPieza = { id: data.id, formato: data.formato, finalidad: data.finalidad };
    valores.fecha_real = fechaReal || new Date().toISOString().slice(0, 10);
    valores.publicado_snapshot = data;
    await registrarUsoDeFrase(supabase, data, valores.fecha_real as string, null);
  }
  if (estadoValido.data !== "publicado") {
    valores.publicado_snapshot = null;
    await supabase.from("frase_usos").delete().eq("pieza_id", pieza.data);
  }
  await supabase.from("piezas").update(valores).eq("id", pieza.data);
  if (datosPieza) await proponerMetricas(supabase, datosPieza);
  refrescar(pieza.data);
}

/** Cambia el estado de una pieza desde su ficha, sin tocar la fecha real. */
export async function marcarEstadoPieza(id: string, estado: EstadoPieza) {
  await cambiarEstadoPieza(id, estado);
}

/** Planificar exige una fecha para que no queden piezas planificadas sin sitio en el calendario. */
export async function planificarPieza(id: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const pieza = uuid.safeParse(id);
  const fecha = z.string().date("Elige una fecha prevista.").safeParse(texto(d, "fecha_prevista"));
  if (!pieza.success) return { error: "Pieza no válida." };
  if (!fecha.success) return { error: fecha.error.issues[0]?.message ?? "Elige una fecha." };
  const supabase = await crearClienteServidor();
  const { data: antes } = await supabase.from("piezas").select("fecha_prevista").eq("id", pieza.data).maybeSingle();
  const { error } = await supabase.from("piezas").update({ estado: "planificado", fecha_prevista: fecha.data }).eq("id", pieza.data);
  if (error) return { error: "No se pudo planificar la pieza." };
  await anotarCambioDeFecha(supabase, pieza.data, antes?.fecha_prevista ?? null, fecha.data);
  refrescar(pieza.data);
  return { error: null, ok: true };
}

/** Publicar conserva una instantánea exacta y mantiene separadas las dos fechas. */
export async function publicarPieza(id: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const pieza = uuid.safeParse(id);
  const fecha = z.string().date("Elige la fecha real.").safeParse(texto(d, "fecha_real"));
  const url = z.string().trim().max(2000).safeParse(texto(d, "url_publicada"));
  if (!pieza.success) return { error: "Pieza no válida." };
  if (!fecha.success || !url.success) return { error: "Revisa la fecha y el enlace." };
  const supabase = await crearClienteServidor();
  const { data } = await supabase.from("piezas").select("*").eq("id", pieza.data).maybeSingle();
  if (!data) return { error: "No encontramos la pieza." };
  // El correo enviado conserva también el asunto elegido, que vive en las versiones.
  let instantanea: Record<string, unknown> = data;
  if (data.formato === "email") {
    const { data: asuntos } = await supabase
      .from("pieza_versiones")
      .select("asunto,elegida,orden")
      .eq("pieza_id", pieza.data)
      .eq("tipo", "asunto")
      .order("orden");
    instantanea = {
      ...data,
      email_asunto: asuntos?.find((a) => a.elegida)?.asunto ?? null,
      email_asuntos: asuntos?.map((a) => a.asunto) ?? [],
    };
  }
  const { error } = await supabase.from("piezas").update({
    estado: "publicado", fecha_real: fecha.data, url_publicada: url.data || null, publicado_snapshot: instantanea,
  }).eq("id", pieza.data);
  if (error) return { error: "No se pudo marcar como publicada." };
  await registrarUsoDeFrase(supabase, data, fecha.data, url.data || null);
  await proponerMetricas(supabase, data);
  refrescar(pieza.data);
  return { error: null, ok: true };
}

export async function borrarVersion(piezaId: string, versionId: string) {
  const pieza = uuid.safeParse(piezaId); const version = uuid.safeParse(versionId);
  if (!pieza.success || !version.success) return;
  const supabase = await crearClienteServidor();
  const { count } = await supabase.from("pieza_versiones").select("id", { count: "exact", head: true }).eq("pieza_id", pieza.data).eq("tipo", "guion");
  if ((count ?? 0) <= 1) return;
  const { data: borrada } = await supabase.from("pieza_versiones").select("elegida").eq("id", version.data).eq("pieza_id", pieza.data).maybeSingle();
  await supabase.from("pieza_versiones").delete().eq("id", version.data).eq("pieza_id", pieza.data);
  if (borrada?.elegida) {
    const { data: alternativa } = await supabase.from("pieza_versiones").select("id").eq("pieza_id", pieza.data).eq("tipo", "guion").order("orden").limit(1).maybeSingle();
    if (alternativa) await supabase.from("pieza_versiones").update({ elegida: true }).eq("id", alternativa.id);
  }
  refrescar(pieza.data);
}

export async function marcarGrabada(id: string, grabado: boolean) {
  const pieza = uuid.safeParse(id); if (!pieza.success) return;
  const supabase = await crearClienteServidor();
  await supabase.from("piezas").update({ grabado, grabado_en: grabado ? new Date().toISOString() : null }).eq("id", pieza.data);
  refrescar(pieza.data);
}

/** Crea una adaptación o reutilización como borrador, conservando el origen sin modificarlo. */
export async function crearDerivada(piezaId: string, relacion: "adaptacion" | "reutilizacion") {
  const id = uuid.safeParse(piezaId);
  if (!id.success) return;
  const supabase = await crearClienteServidor();
  const { data: origen } = await supabase.from("piezas").select("*").eq("id", id.data).maybeSingle();
  if (!origen || (relacion === "reutilizacion" && !origen.publicado_snapshot)) return;
  const copia = origen.publicado_snapshot && relacion === "reutilizacion" ? origen.publicado_snapshot : origen;
  const { data, error } = await supabase.from("piezas").insert({
    titulo: `${copia.titulo} · ${relacion === "adaptacion" ? "adaptación" : "reutilización"}`,
    formato: copia.formato, canal: copia.canal, idea_id: origen.idea_id,
    pilar_id: copia.pilar_id, finalidad: copia.finalidad, oferta_id: copia.oferta_id,
    texto_publicacion: copia.texto_publicacion, texto_en_pantalla: copia.texto_en_pantalla,
    notas: copia.notas, plano: copia.plano, preparacion: copia.preparacion,
    duracion_seg: copia.duracion_seg, origen_pieza_id: origen.id, relacion_origen: relacion,
    email_preview: copia.email_preview, email_cuerpo_html: copia.email_cuerpo_html,
    email_tematica: copia.email_tematica, email_audiencia: copia.email_audiencia,
  }).select("id").single();
  if (error || !data) return;
  await supabase.from("pieza_versiones").insert({ pieza_id: data.id, tipo: "guion", nombre: "Versión 1", elegida: true });
  if (origen.formato === "email") {
    const { data: asuntos } = await supabase
      .from("pieza_versiones")
      .select("nombre,asunto,elegida,orden")
      .eq("pieza_id", origen.id)
      .eq("tipo", "asunto")
      .order("orden");
    if (asuntos && asuntos.length > 0) {
      await supabase.from("pieza_versiones").insert(
        asuntos.map((a) => ({ pieza_id: data.id, tipo: "asunto", nombre: a.nombre, asunto: a.asunto, elegida: a.elegida, orden: a.orden })),
      );
    }
  }
  refrescar(origen.id, origen.idea_id);
  redirect(`/piezas/${data.id}`);
}

export async function enviarPiezaAPapelera(id: string) {
  const pieza = uuid.safeParse(id); if (!pieza.success) return;
  const supabase = await crearClienteServidor();
  await supabase.from("piezas").update({ eliminado_en: new Date().toISOString() }).eq("id", pieza.data);
  revalidatePath("/biblioteca");
  redirect("/biblioteca");
}
