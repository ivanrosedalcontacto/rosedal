"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Resultado } from "@/shared/components/mensaje-resultado";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import {
  esquemaFechaPaso,
  esquemaPlazo,
  esquemaPlantillaSecuencia,
  esquemaSecuencia,
} from "./esquemas";

const uuid = z.string().uuid();
const texto = (d: FormData, k: string) => (d.get(k) ?? "").toString();

type Cliente = Awaited<ReturnType<typeof crearClienteServidor>>;
type PiezaCorreo = {
  id: string;
  titulo: string;
  formato: string;
  canal: string;
  idea_id: string | null;
  pilar_id: string | null;
  finalidad: string | null;
  oferta_id: string | null;
  cta_accion: string | null;
  cta_como: string | null;
  cta_url: string | null;
  texto_publicacion: string;
  texto_en_pantalla: string;
  notas: string;
  email_preview: string | null;
  email_cuerpo_html: string | null;
  email_tematica: string | null;
  email_audiencia: string | null;
};

function refrescarSecuencia(secuenciaId?: string, piezaId?: string) {
  revalidatePath("/email");
  revalidatePath("/email/secuencias");
  if (secuenciaId) revalidatePath(`/email/secuencias/${secuenciaId}`);
  if (piezaId) revalidatePath(`/piezas/${piezaId}`);
  revalidatePath("/biblioteca");
}

/** Copia un correo para un paso relativo: el original fechado o enviado no se toca. */
async function copiarCorreo(supabase: Cliente, original: PiezaCorreo, sufijo: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("piezas")
    .insert({
      titulo: `${original.titulo}${sufijo}`.slice(0, 300),
      formato: "email",
      canal: original.canal || "email",
      idea_id: original.idea_id,
      pilar_id: original.pilar_id,
      finalidad: original.finalidad,
      oferta_id: original.oferta_id,
      cta_accion: original.cta_accion,
      cta_como: original.cta_como,
      cta_url: original.cta_url,
      texto_publicacion: original.texto_publicacion,
      texto_en_pantalla: original.texto_en_pantalla,
      notas: original.notas,
      email_preview: original.email_preview,
      email_cuerpo_html: original.email_cuerpo_html,
      email_tematica: original.email_tematica,
      email_audiencia: original.email_audiencia,
      origen_pieza_id: original.id,
      relacion_origen: "reutilizacion",
    })
    .select("id")
    .single();
  if (error || !data) return null;
  const { data: asuntos } = await supabase
    .from("pieza_versiones")
    .select("nombre,asunto,elegida,orden")
    .eq("pieza_id", original.id)
    .eq("tipo", "asunto")
    .order("orden");
  if (asuntos && asuntos.length > 0) {
    await supabase.from("pieza_versiones").insert(
      asuntos.map((a) => ({
        pieza_id: data.id,
        tipo: "asunto",
        nombre: a.nombre,
        asunto: a.asunto,
        elegida: a.elegida,
        orden: a.orden,
      })),
    );
  }
  return data.id as string;
}

async function piezaDeCorreo(supabase: Cliente, piezaId: string): Promise<PiezaCorreo | null> {
  const { data } = await supabase
    .from("piezas")
    .select("id,titulo,formato,canal,idea_id,pilar_id,finalidad,oferta_id,cta_accion,cta_como,cta_url,texto_publicacion,texto_en_pantalla,notas,email_preview,email_cuerpo_html,email_tematica,email_audiencia")
    .eq("id", piezaId)
    .is("eliminado_en", null)
    .maybeSingle();
  return (data as PiezaCorreo | null) ?? null;
}

async function reordenar(supabase: Cliente, secuenciaId: string) {
  const { data } = await supabase.from("secuencia_pasos").select("id").eq("secuencia_id", secuenciaId).order("orden");
  const lista = data ?? [];
  for (let i = 0; i < lista.length; i += 1) {
    await supabase.from("secuencia_pasos").update({ orden: i }).eq("id", lista[i]!.id);
  }
}

export async function crearSecuencia(_p: Resultado, d: FormData): Promise<Resultado> {
  const r = esquemaSecuencia.safeParse({
    nombre: texto(d, "nombre"),
    tipo: texto(d, "tipo") || "otra",
    programacion: texto(d, "programacion") || "relativa",
    audiencia: texto(d, "audiencia"),
    disparador: texto(d, "disparador"),
    objetivo: texto(d, "objetivo"),
    oferta_id: texto(d, "oferta_id"),
  });
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa la secuencia." };
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.from("secuencias_email").insert(r.data).select("id").single();
  if (error || !data) return { error: "No se pudo crear la secuencia." };
  refrescarSecuencia(data.id);
  redirect(`/email/secuencias/${data.id}`);
}

export async function guardarSecuencia(id: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const secuencia = uuid.safeParse(id);
  const r = esquemaSecuencia.safeParse({
    nombre: texto(d, "nombre"),
    tipo: texto(d, "tipo"),
    programacion: texto(d, "programacion"),
    audiencia: texto(d, "audiencia"),
    disparador: texto(d, "disparador"),
    objetivo: texto(d, "objetivo"),
    oferta_id: texto(d, "oferta_id"),
  });
  if (!secuencia.success) return { error: "Secuencia no válida." };
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa la secuencia." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("secuencias_email").update(r.data).eq("id", secuencia.data);
  if (error) return { error: "No se pudo guardar la secuencia." };
  refrescarSecuencia(secuencia.data);
  return { error: null, ok: true };
}

export async function anadirPasoNuevo(secuenciaId: string) {
  const secuencia = uuid.safeParse(secuenciaId);
  if (!secuencia.success) return;
  const supabase = await crearClienteServidor();
  const [{ data: sec }, { count }] = await Promise.all([
    supabase.from("secuencias_email").select("id,programacion").eq("id", secuencia.data).maybeSingle(),
    supabase.from("secuencia_pasos").select("id", { count: "exact", head: true }).eq("secuencia_id", secuencia.data),
  ]);
  if (!sec) return;
  const { data: pieza, error } = await supabase
    .from("piezas")
    .insert({ titulo: `Paso ${(count ?? 0) + 1}`, formato: "email", canal: "email" })
    .select("id")
    .single();
  if (error || !pieza) return;
  const relativa = sec.programacion === "relativa";
  await supabase.from("secuencia_pasos").insert({
    secuencia_id: secuencia.data,
    pieza_id: pieza.id,
    orden: count ?? 0,
    plazo_cantidad: relativa ? 0 : null,
    plazo_unidad: relativa ? "dias" : null,
  });
  refrescarSecuencia(secuencia.data, pieza.id as string);
  redirect(`/piezas/${pieza.id}`);
}

export async function anadirPasoExistente(secuenciaId: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const secuencia = uuid.safeParse(secuenciaId);
  const piezaId = uuid.safeParse(texto(d, "pieza_id"));
  const fecha = esquemaFechaPaso.safeParse({ fecha_prevista: texto(d, "fecha_prevista") });
  if (!secuencia.success) return { error: "Secuencia no válida." };
  if (!piezaId.success) return { error: "Elige un correo." };
  if (!fecha.success) return { error: "Revisa la fecha." };
  const supabase = await crearClienteServidor();
  const { data: sec } = await supabase.from("secuencias_email").select("id,programacion").eq("id", secuencia.data).maybeSingle();
  if (!sec) return { error: "No encontramos la secuencia." };
  const original = await piezaDeCorreo(supabase, piezaId.data);
  if (!original || original.formato !== "email") return { error: "Ese correo no existe." };
  const { data: yaVinculado } = await supabase.from("secuencia_pasos").select("id").eq("pieza_id", piezaId.data).maybeSingle();
  const relativa = sec.programacion === "relativa";
  if (yaVinculado && !relativa) return { error: "Ese correo ya pertenece a una secuencia." };
  let idFinal: string | null = piezaId.data;
  if (relativa) {
    idFinal = await copiarCorreo(supabase, original, " · paso de secuencia");
    if (!idFinal) return { error: "No se pudo preparar la copia del correo." };
  } else if (fecha.data.fecha_prevista) {
    await supabase
      .from("piezas")
      .update({ fecha_prevista: fecha.data.fecha_prevista, estado: "planificado" })
      .eq("id", piezaId.data)
      .is("publicado_snapshot", null);
  }
  const { count } = await supabase.from("secuencia_pasos").select("id", { count: "exact", head: true }).eq("secuencia_id", secuencia.data);
  const { error } = await supabase.from("secuencia_pasos").insert({
    secuencia_id: secuencia.data,
    pieza_id: idFinal,
    orden: count ?? 0,
    plazo_cantidad: relativa ? 1 : null,
    plazo_unidad: relativa ? "dias" : null,
  });
  if (error) return { error: "No se pudo añadir el correo a la secuencia." };
  refrescarSecuencia(secuencia.data, idFinal);
  return { error: null, ok: true };
}

export async function duplicarPaso(secuenciaId: string, pasoId: string) {
  const secuencia = uuid.safeParse(secuenciaId);
  const paso = uuid.safeParse(pasoId);
  if (!secuencia.success || !paso.success) return;
  const supabase = await crearClienteServidor();
  const [{ data: pasoR }, { data: pasosR }] = await Promise.all([
    supabase.from("secuencia_pasos").select("id,pieza_id,orden,plazo_cantidad,plazo_unidad").eq("id", paso.data).eq("secuencia_id", secuencia.data).maybeSingle(),
    supabase.from("secuencia_pasos").select("id").eq("secuencia_id", secuencia.data).order("orden"),
  ]);
  if (!pasoR) return;
  const original = await piezaDeCorreo(supabase, pasoR.pieza_id);
  if (!original) return;
  const copiaId = await copiarCorreo(supabase, original, " · copia");
  if (!copiaId) return;
  const { data: nuevo } = await supabase
    .from("secuencia_pasos")
    .insert({ secuencia_id: secuencia.data, pieza_id: copiaId, orden: 0, plazo_cantidad: pasoR.plazo_cantidad, plazo_unidad: pasoR.plazo_unidad })
    .select("id")
    .single();
  if (!nuevo) return;
  const lista = pasosR ?? [];
  const indice = lista.findIndex((p) => p.id === paso.data);
  const ordenados = [
    ...lista.slice(0, indice + 1).map((p) => p.id as string),
    nuevo.id as string,
    ...lista.slice(indice + 1).map((p) => p.id as string),
  ];
  for (let i = 0; i < ordenados.length; i += 1) {
    await supabase.from("secuencia_pasos").update({ orden: i }).eq("id", ordenados[i]);
  }
  refrescarSecuencia(secuencia.data, copiaId);
}

export async function quitarPaso(secuenciaId: string, pasoId: string) {
  const secuencia = uuid.safeParse(secuenciaId);
  const paso = uuid.safeParse(pasoId);
  if (!secuencia.success || !paso.success) return;
  const supabase = await crearClienteServidor();
  await supabase.from("secuencia_pasos").delete().eq("id", paso.data).eq("secuencia_id", secuencia.data);
  await reordenar(supabase, secuencia.data);
  refrescarSecuencia(secuencia.data);
}

export async function moverPaso(secuenciaId: string, pasoId: string, direccion: "subir" | "bajar") {
  const secuencia = uuid.safeParse(secuenciaId);
  const paso = uuid.safeParse(pasoId);
  if (!secuencia.success || !paso.success) return;
  const supabase = await crearClienteServidor();
  const { data } = await supabase.from("secuencia_pasos").select("id").eq("secuencia_id", secuencia.data).order("orden");
  const lista = data ?? [];
  const indice = lista.findIndex((p) => p.id === paso.data);
  const destino = direccion === "subir" ? indice - 1 : indice + 1;
  if (indice < 0 || destino < 0 || destino >= lista.length) return;
  const actual = lista[indice]!;
  const vecino = lista[destino]!;
  await supabase.from("secuencia_pasos").update({ orden: destino }).eq("id", actual.id);
  await supabase.from("secuencia_pasos").update({ orden: indice }).eq("id", vecino.id);
  refrescarSecuencia(secuencia.data);
}

export async function guardarPlazoPaso(secuenciaId: string, pasoId: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const secuencia = uuid.safeParse(secuenciaId);
  const paso = uuid.safeParse(pasoId);
  const r = esquemaPlazo.safeParse({ plazo_cantidad: texto(d, "plazo_cantidad"), plazo_unidad: texto(d, "plazo_unidad") || "dias" });
  if (!secuencia.success || !paso.success) return { error: "Paso no válido." };
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa el plazo." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("secuencia_pasos")
    .update({ plazo_cantidad: r.data.plazo_cantidad, plazo_unidad: r.data.plazo_unidad })
    .eq("id", paso.data)
    .eq("secuencia_id", secuencia.data);
  if (error) return { error: "No se pudo guardar el plazo." };
  refrescarSecuencia(secuencia.data);
  return { error: null, ok: true };
}

export async function guardarFechaPaso(secuenciaId: string, pasoId: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const secuencia = uuid.safeParse(secuenciaId);
  const paso = uuid.safeParse(pasoId);
  const r = esquemaFechaPaso.safeParse({ fecha_prevista: texto(d, "fecha_prevista") });
  if (!secuencia.success || !paso.success) return { error: "Paso no válido." };
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa la fecha." };
  const supabase = await crearClienteServidor();
  const { data: pasoR } = await supabase
    .from("secuencia_pasos")
    .select("pieza_id,piezas(estado)")
    .eq("id", paso.data)
    .eq("secuencia_id", secuencia.data)
    .maybeSingle();
  if (!pasoR) return { error: "No encontramos el paso." };
  const relacion = pasoR.piezas as unknown as { estado: string } | { estado: string }[] | null;
  const pieza = Array.isArray(relacion) ? relacion[0] ?? null : relacion;
  const valores: Record<string, unknown> = { fecha_prevista: r.data.fecha_prevista };
  if (r.data.fecha_prevista) valores.estado = "planificado";
  else if (pieza?.estado === "planificado") valores.estado = "borrador";
  const { error } = await supabase
    .from("piezas")
    .update(valores)
    .eq("id", pasoR.pieza_id)
    .is("publicado_snapshot", null);
  if (error) return { error: "No se pudo guardar la fecha." };
  refrescarSecuencia(secuencia.data, pasoR.pieza_id);
  return { error: null, ok: true };
}

export async function guardarComoTemplate(secuenciaId: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const secuencia = uuid.safeParse(secuenciaId);
  const nombre = z.string().trim().min(1, "Ponle un nombre a la plantilla.").max(200).safeParse(texto(d, "nombre"));
  const descripcion = z.string().trim().max(1000).safeParse(texto(d, "descripcion"));
  if (!secuencia.success) return { error: "Secuencia no válida." };
  if (!nombre.success) return { error: nombre.error.issues[0]?.message ?? "Revisa el nombre." };
  if (!descripcion.success) return { error: "Revisa la descripción." };
  const supabase = await crearClienteServidor();
  const [{ data: sec }, { data: pasos }] = await Promise.all([
    supabase.from("secuencias_email").select("id,tipo,programacion").eq("id", secuencia.data).maybeSingle(),
    supabase
      .from("secuencia_pasos")
      .select("orden,plazo_cantidad,plazo_unidad,piezas(titulo,finalidad)")
      .eq("secuencia_id", secuencia.data)
      .order("orden"),
  ]);
  if (!sec) return { error: "No encontramos la secuencia." };
  const lista = pasos ?? [];
  const contenido = {
    tipo: sec.tipo,
    programacion: sec.programacion,
    pasos: lista.map((p) => {
      const relacion = p.piezas as unknown as { titulo: string; finalidad: string | null } | { titulo: string; finalidad: string | null }[] | null;
      const pieza = Array.isArray(relacion) ? relacion[0] ?? null : relacion;
      return {
        finalidad: pieza?.finalidad ?? null,
        plazo_cantidad: p.plazo_cantidad,
        plazo_unidad: p.plazo_unidad,
        proposito: pieza?.titulo ?? "",
      };
    }),
  };
  const { error } = await supabase.from("plantillas").insert({
    tipo: "secuencia_email",
    nombre: nombre.data,
    descripcion: descripcion.data,
    contenido,
  });
  if (error) return { error: "No se pudo guardar la plantilla." };
  refrescarSecuencia(secuencia.data);
  return { error: null, ok: true };
}

export async function crearSecuenciaDesdePlantilla(_p: Resultado, d: FormData): Promise<Resultado> {
  const plantilla = uuid.safeParse(texto(d, "plantilla_id"));
  const nombre = z.string().trim().min(1, "Ponle un nombre a la secuencia.").max(200).safeParse(texto(d, "nombre"));
  if (!plantilla.success) return { error: "Elige una plantilla." };
  if (!nombre.success) return { error: nombre.error.issues[0]?.message ?? "Revisa el nombre." };
  const supabase = await crearClienteServidor();
  const { data: fila } = await supabase.from("plantillas").select("contenido").eq("id", plantilla.data).eq("tipo", "secuencia_email").maybeSingle();
  if (!fila) return { error: "No encontramos la plantilla." };
  const contenido = esquemaPlantillaSecuencia.safeParse(fila.contenido);
  if (!contenido.success) return { error: "La plantilla no tiene una estructura válida." };
  const { data: sec, error } = await supabase
    .from("secuencias_email")
    .insert({ nombre: nombre.data, tipo: contenido.data.tipo, programacion: contenido.data.programacion })
    .select("id")
    .single();
  if (error || !sec) return { error: "No se pudo crear la secuencia." };
  const relativa = contenido.data.programacion === "relativa";
  for (let i = 0; i < contenido.data.pasos.length; i += 1) {
    const paso = contenido.data.pasos[i]!;
    const { data: pieza } = await supabase
      .from("piezas")
      .insert({ titulo: (paso.proposito || `Paso ${i + 1}`).slice(0, 300), formato: "email", canal: "email", finalidad: paso.finalidad })
      .select("id")
      .single();
    if (!pieza) continue;
    await supabase.from("secuencia_pasos").insert({
      secuencia_id: sec.id,
      pieza_id: pieza.id,
      orden: i,
      plazo_cantidad: relativa ? paso.plazo_cantidad : null,
      plazo_unidad: relativa ? paso.plazo_unidad : null,
    });
  }
  refrescarSecuencia(sec.id);
  redirect(`/email/secuencias/${sec.id}`);
}
