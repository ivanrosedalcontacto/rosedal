"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Resultado } from "@/shared/components/mensaje-resultado";
import { escaparHtml, sanearHtml } from "@/shared/lib/html";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { esquemaAsunto, esquemaVistaPrevia } from "./esquemas";

const uuid = z.string().uuid();
const texto = (d: FormData, k: string) => (d.get(k) ?? "").toString();

type Cliente = Awaited<ReturnType<typeof crearClienteServidor>>;
type IdeaParaCorreo = { id: string; texto: string; tipo: string };

function refrescarEmail(piezaId?: string, ideaId?: string | null) {
  revalidatePath("/email");
  revalidatePath("/email/secuencias");
  revalidatePath("/biblioteca");
  revalidatePath("/ideas");
  if (ideaId) revalidatePath(`/ideas/${ideaId}`);
  if (piezaId) revalidatePath(`/piezas/${piezaId}`);
}

/** El autoguardado no revalida la ficha para no mover el cursor del editor. */
function refrescarListasEmail() {
  revalidatePath("/email");
  revalidatePath("/biblioteca");
}

async function piezaEditable(supabase: Cliente, piezaId: string) {
  const { data } = await supabase.from("piezas").select("id,publicado_snapshot").eq("id", piezaId).maybeSingle();
  return data;
}

/** Guarda el HTML ya saneado; el correo enviado queda congelado. */
export async function guardarCuerpoEmail(piezaId: string, html: string): Promise<Resultado> {
  const pieza = uuid.safeParse(piezaId);
  const cuerpo = z.string().max(200_000, "El cuerpo es demasiado largo.").safeParse(html);
  if (!pieza.success) return { error: "Correo no válido." };
  if (!cuerpo.success) return { error: cuerpo.error.issues[0]?.message ?? "Revisa el cuerpo." };
  const supabase = await crearClienteServidor();
  const actual = await piezaEditable(supabase, pieza.data);
  if (!actual) return { error: "No encontramos el correo." };
  if (actual.publicado_snapshot) return { error: "El correo enviado no se puede editar." };
  const { error } = await supabase
    .from("piezas")
    .update({ email_cuerpo_html: sanearHtml(cuerpo.data) })
    .eq("id", pieza.data)
    .is("publicado_snapshot", null);
  if (error) return { error: "No se pudo guardar el cuerpo." };
  refrescarListasEmail();
  return { error: null, ok: true };
}

export async function guardarVistaPreviaEmail(piezaId: string, valor: string): Promise<Resultado> {
  const pieza = uuid.safeParse(piezaId);
  const r = esquemaVistaPrevia.safeParse({ email_preview: valor });
  if (!pieza.success) return { error: "Correo no válido." };
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa la vista previa." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("piezas")
    .update({ email_preview: r.data.email_preview.trim() || null })
    .eq("id", pieza.data)
    .is("publicado_snapshot", null);
  if (error) return { error: "No se pudo guardar la vista previa." };
  refrescarListasEmail();
  return { error: null, ok: true };
}

export async function crearAsunto(piezaId: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const pieza = uuid.safeParse(piezaId);
  const r = esquemaAsunto.safeParse({ asunto: texto(d, "asunto") });
  if (!pieza.success) return { error: "Correo no válido." };
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa el asunto." };
  const supabase = await crearClienteServidor();
  const actual = await piezaEditable(supabase, pieza.data);
  if (!actual) return { error: "No encontramos el correo." };
  if (actual.publicado_snapshot) return { error: "El correo enviado no se puede editar." };
  const { count } = await supabase.from("pieza_versiones").select("id", { count: "exact", head: true }).eq("pieza_id", pieza.data).eq("tipo", "asunto");
  const { error } = await supabase.from("pieza_versiones").insert({
    pieza_id: pieza.data,
    tipo: "asunto",
    nombre: `Asunto ${(count ?? 0) + 1}`,
    asunto: r.data.asunto,
    elegida: (count ?? 0) === 0,
    orden: count ?? 0,
  });
  if (error) return { error: "No se pudo añadir el asunto." };
  refrescarEmail(pieza.data);
  return { error: null, ok: true };
}

export async function guardarAsunto(piezaId: string, versionId: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const pieza = uuid.safeParse(piezaId);
  const version = uuid.safeParse(versionId);
  const r = esquemaAsunto.safeParse({ asunto: texto(d, "asunto") });
  if (!pieza.success || !version.success) return { error: "Asunto no válido." };
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa el asunto." };
  const supabase = await crearClienteServidor();
  const actual = await piezaEditable(supabase, pieza.data);
  if (!actual) return { error: "No encontramos el correo." };
  if (actual.publicado_snapshot) return { error: "El correo enviado no se puede editar." };
  const { error } = await supabase
    .from("pieza_versiones")
    .update({ asunto: r.data.asunto })
    .eq("id", version.data)
    .eq("pieza_id", pieza.data)
    .eq("tipo", "asunto");
  if (error) return { error: "No se pudo guardar el asunto." };
  refrescarEmail(pieza.data);
  return { error: null, ok: true };
}

export async function elegirAsunto(piezaId: string, versionId: string) {
  const pieza = uuid.safeParse(piezaId);
  const version = uuid.safeParse(versionId);
  if (!pieza.success || !version.success) return;
  const supabase = await crearClienteServidor();
  const actual = await piezaEditable(supabase, pieza.data);
  if (!actual || actual.publicado_snapshot) return;
  await supabase.from("pieza_versiones").update({ elegida: false }).eq("pieza_id", pieza.data).eq("tipo", "asunto");
  await supabase.from("pieza_versiones").update({ elegida: true }).eq("id", version.data).eq("pieza_id", pieza.data).eq("tipo", "asunto");
  refrescarEmail(pieza.data);
}

export async function borrarAsunto(piezaId: string, versionId: string) {
  const pieza = uuid.safeParse(piezaId);
  const version = uuid.safeParse(versionId);
  if (!pieza.success || !version.success) return;
  const supabase = await crearClienteServidor();
  const actual = await piezaEditable(supabase, pieza.data);
  if (!actual || actual.publicado_snapshot) return;
  const { data: borrado } = await supabase
    .from("pieza_versiones")
    .select("elegida")
    .eq("id", version.data)
    .eq("pieza_id", pieza.data)
    .eq("tipo", "asunto")
    .maybeSingle();
  await supabase.from("pieza_versiones").delete().eq("id", version.data).eq("pieza_id", pieza.data).eq("tipo", "asunto");
  if (borrado?.elegida) {
    const { data: alternativa } = await supabase
      .from("pieza_versiones")
      .select("id")
      .eq("pieza_id", pieza.data)
      .eq("tipo", "asunto")
      .order("orden")
      .limit(1)
      .maybeSingle();
    if (alternativa) await supabase.from("pieza_versiones").update({ elegida: true }).eq("id", alternativa.id);
  }
  refrescarEmail(pieza.data);
}

function partirIdea(textoIdea: string) {
  const limpio = textoIdea.trim();
  const lineas = limpio.split(/\r?\n/);
  const primera = lineas[0]?.trim() ?? "";
  const esAsunto = lineas.length === 1 && primera.length <= 200;
  return {
    asunto: esAsunto ? primera : null,
    cuerpo: esAsunto ? "" : `<p>${escaparHtml(limpio).replace(/\r?\n/g, "<br>")}</p>`,
    titulo: (primera || "Correo desde una idea").slice(0, 200),
  };
}

async function crearCorreoDesdeIdea(supabase: Cliente, idea: IdeaParaCorreo): Promise<string | null> {
  const partes = partirIdea(idea.texto);
  const { data, error } = await supabase
    .from("piezas")
    .insert({
      idea_id: idea.id,
      titulo: partes.titulo,
      formato: "email",
      canal: "email",
      email_cuerpo_html: partes.cuerpo,
    })
    .select("id")
    .single();
  if (error || !data) return null;
  if (partes.asunto) {
    await supabase.from("pieza_versiones").insert({
      pieza_id: data.id,
      tipo: "asunto",
      nombre: "Asunto 1",
      asunto: partes.asunto,
      elegida: true,
      orden: 0,
    });
  }
  await supabase.from("ideas").update({ estado: "en_desarrollo" }).eq("id", idea.id);
  return data.id as string;
}

export async function convertirIdeaEnBroadcast(ideaId: string) {
  const idea = uuid.safeParse(ideaId);
  if (!idea.success) return;
  const supabase = await crearClienteServidor();
  const { data } = await supabase.from("ideas").select("id,texto,tipo").eq("id", idea.data).eq("tipo", "idea_email").maybeSingle();
  if (!data) return;
  const piezaId = await crearCorreoDesdeIdea(supabase, data as IdeaParaCorreo);
  if (!piezaId) return;
  refrescarEmail(piezaId, idea.data);
  redirect(`/piezas/${piezaId}`);
}

export async function convertirIdeaEnPaso(ideaId: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const idea = uuid.safeParse(ideaId);
  const secuencia = uuid.safeParse(texto(d, "secuencia_id"));
  const posicion = z.coerce.number().int().min(1).max(100).safeParse(texto(d, "posicion"));
  if (!idea.success) return { error: "Idea no válida." };
  if (!secuencia.success) return { error: "Elige una secuencia." };
  if (!posicion.success) return { error: "Elige una posición." };
  const supabase = await crearClienteServidor();
  const [{ data: ideaR }, { data: secuenciaR }] = await Promise.all([
    supabase.from("ideas").select("id,texto,tipo").eq("id", idea.data).eq("tipo", "idea_email").maybeSingle(),
    supabase.from("secuencias_email").select("id").eq("id", secuencia.data).maybeSingle(),
  ]);
  if (!ideaR) return { error: "No encontramos la idea." };
  if (!secuenciaR) return { error: "No encontramos la secuencia." };
  const piezaId = await crearCorreoDesdeIdea(supabase, ideaR as IdeaParaCorreo);
  if (!piezaId) return { error: "No se pudo crear el correo." };
  const { data: pasos } = await supabase.from("secuencia_pasos").select("id").eq("secuencia_id", secuencia.data).order("orden");
  const lista = pasos ?? [];
  const indice = Math.min(posicion.data - 1, lista.length);
  const { data: nuevo, error } = await supabase
    .from("secuencia_pasos")
    .insert({ secuencia_id: secuencia.data, pieza_id: piezaId, orden: lista.length, plazo_cantidad: 0, plazo_unidad: "dias" })
    .select("id")
    .single();
  if (error || !nuevo) return { error: "El correo se creó, pero no se pudo añadir a la secuencia." };
  const ordenados = [
    ...lista.slice(0, indice).map((p) => p.id as string),
    nuevo.id as string,
    ...lista.slice(indice).map((p) => p.id as string),
  ];
  for (let i = 0; i < ordenados.length; i += 1) {
    await supabase.from("secuencia_pasos").update({ orden: i }).eq("id", ordenados[i]);
  }
  refrescarEmail(piezaId, idea.data);
  revalidatePath(`/email/secuencias/${secuencia.data}`);
  redirect(`/piezas/${piezaId}`);
}
