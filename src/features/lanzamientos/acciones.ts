"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Resultado } from "@/shared/components/mensaje-resultado";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { esquemaFase, esquemaHito, esquemaLanzamiento, ESTADOS_LANZAMIENTO, ETIQUETA_FASE, TIPOS_FASE, AYUDA_FASE } from "./esquemas";

const uuid = z.string().uuid();
const texto = (d: FormData, k: string) => (d.get(k) ?? "").toString();

type Cliente = Awaited<ReturnType<typeof crearClienteServidor>>;

function refrescar(lanzamientoId?: string) {
  revalidatePath("/lanzamientos");
  revalidatePath("/biblioteca");
  revalidatePath("/email");
  revalidatePath("/ofertas");
  if (lanzamientoId) {
    revalidatePath(`/lanzamientos/${lanzamientoId}`);
  }
}

function leerLanzamiento(d: FormData) {
  return esquemaLanzamiento.safeParse({
    nombre: texto(d, "nombre"),
    oferta_id: texto(d, "oferta_id"),
    objetivo: texto(d, "objetivo"),
    fecha_inicio: texto(d, "fecha_inicio"),
    fecha_fin: texto(d, "fecha_fin"),
    estado: texto(d, "estado") || "en_preparacion",
  });
}

/** Las fechas del lanzamiento se ajustan a lo que abarcan sus fases. */
async function recalcularFechas(supabase: Cliente, lanzamientoId: string) {
  const { data } = await supabase
    .from("lanzamiento_fases")
    .select("fecha_inicio,fecha_fin")
    .eq("lanzamiento_id", lanzamientoId);
  const inicios = (data ?? []).map((f) => f.fecha_inicio as string | null).filter((f): f is string => Boolean(f));
  const fines = (data ?? []).map((f) => f.fecha_fin as string | null).filter((f): f is string => Boolean(f));
  if (inicios.length === 0 && fines.length === 0) return;
  await supabase
    .from("lanzamientos")
    .update({
      fecha_inicio: inicios.length > 0 ? inicios.sort()[0] : null,
      fecha_fin: fines.length > 0 ? fines.sort().at(-1) : null,
    })
    .eq("id", lanzamientoId);
}

export async function crearLanzamiento(_p: Resultado, d: FormData): Promise<Resultado> {
  const r = leerLanzamiento(d);
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa los datos." };
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.from("lanzamientos").insert(r.data).select("id").single();
  if (error || !data) return { error: "No se pudo crear el lanzamiento." };
  await supabase.from("lanzamiento_fases").insert(
    TIPOS_FASE.map((tipo, orden) => ({
      lanzamiento_id: data.id,
      tipo,
      nombre: ETIQUETA_FASE[tipo],
      orden,
      notas: AYUDA_FASE[tipo],
    })),
  );
  refrescar(data.id);
  redirect(`/lanzamientos/${data.id}`);
}

export async function guardarLanzamiento(id: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const lanzamiento = uuid.safeParse(id);
  const r = leerLanzamiento(d);
  if (!lanzamiento.success) return { error: "Lanzamiento no válido." };
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa los datos." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("lanzamientos").update(r.data).eq("id", lanzamiento.data);
  if (error) return { error: "No se pudo guardar el lanzamiento." };
  refrescar(lanzamiento.data);
  return { error: null, ok: true };
}

export async function cambiarEstadoLanzamiento(id: string, estado: string) {
  const lanzamiento = uuid.safeParse(id);
  const nuevo = z.enum(ESTADOS_LANZAMIENTO).safeParse(estado);
  if (!lanzamiento.success || !nuevo.success) return;
  const supabase = await crearClienteServidor();
  await supabase.from("lanzamientos").update({ estado: nuevo.data }).eq("id", lanzamiento.data);
  refrescar(lanzamiento.data);
}

export async function eliminarLanzamiento(id: string) {
  const lanzamiento = uuid.safeParse(id);
  if (!lanzamiento.success) return;
  const supabase = await crearClienteServidor();
  await supabase.from("lanzamientos").delete().eq("id", lanzamiento.data);
  refrescar();
  redirect("/lanzamientos");
}

export async function guardarFase(lanzamientoId: string, faseId: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const lanzamiento = uuid.safeParse(lanzamientoId);
  const fase = uuid.safeParse(faseId);
  const r = esquemaFase.safeParse({
    nombre: texto(d, "nombre"),
    fecha_inicio: texto(d, "fecha_inicio"),
    fecha_fin: texto(d, "fecha_fin"),
    notas: texto(d, "notas"),
  });
  if (!lanzamiento.success || !fase.success) return { error: "Fase no válida." };
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa la fase." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("lanzamiento_fases")
    .update(r.data)
    .eq("id", fase.data)
    .eq("lanzamiento_id", lanzamiento.data);
  if (error) return { error: "No se pudo guardar la fase." };
  await recalcularFechas(supabase, lanzamiento.data);
  refrescar(lanzamiento.data);
  return { error: null, ok: true };
}

export async function crearHito(lanzamientoId: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const lanzamiento = uuid.safeParse(lanzamientoId);
  const r = esquemaHito.safeParse({
    titulo: texto(d, "titulo"),
    fecha: texto(d, "fecha"),
    fase_id: texto(d, "fase_id"),
  });
  if (!lanzamiento.success) return { error: "Lanzamiento no válido." };
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa el hito." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("lanzamiento_hitos").insert({ ...r.data, lanzamiento_id: lanzamiento.data });
  if (error) return { error: "No se pudo guardar el hito." };
  refrescar(lanzamiento.data);
  return { error: null, ok: true };
}

export async function guardarHito(lanzamientoId: string, hitoId: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const lanzamiento = uuid.safeParse(lanzamientoId);
  const hito = uuid.safeParse(hitoId);
  const r = esquemaHito.safeParse({
    titulo: texto(d, "titulo"),
    fecha: texto(d, "fecha"),
    fase_id: texto(d, "fase_id"),
  });
  if (!lanzamiento.success || !hito.success) return { error: "Hito no válido." };
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa el hito." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("lanzamiento_hitos")
    .update(r.data)
    .eq("id", hito.data)
    .eq("lanzamiento_id", lanzamiento.data);
  if (error) return { error: "No se pudo guardar el hito." };
  refrescar(lanzamiento.data);
  return { error: null, ok: true };
}

export async function alternarHito(lanzamientoId: string, hitoId: string, hecho: boolean) {
  const lanzamiento = uuid.safeParse(lanzamientoId);
  const hito = uuid.safeParse(hitoId);
  if (!lanzamiento.success || !hito.success) return;
  const supabase = await crearClienteServidor();
  await supabase
    .from("lanzamiento_hitos")
    .update({ hecho })
    .eq("id", hito.data)
    .eq("lanzamiento_id", lanzamiento.data);
  refrescar(lanzamiento.data);
}

export async function borrarHito(lanzamientoId: string, hitoId: string) {
  const lanzamiento = uuid.safeParse(lanzamientoId);
  const hito = uuid.safeParse(hitoId);
  if (!lanzamiento.success || !hito.success) return;
  const supabase = await crearClienteServidor();
  await supabase.from("lanzamiento_hitos").delete().eq("id", hito.data).eq("lanzamiento_id", lanzamiento.data);
  refrescar(lanzamiento.data);
}

export async function asignarPieza(lanzamientoId: string, faseId: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const lanzamiento = uuid.safeParse(lanzamientoId);
  const fase = uuid.safeParse(faseId);
  const pieza = uuid.safeParse(texto(d, "pieza_id"));
  const fecha = z
    .string()
    .transform((v) => (v === "" ? null : v))
    .pipe(z.string().date().nullable())
    .safeParse(texto(d, "fecha_prevista"));
  if (!lanzamiento.success || !fase.success) return { error: "Fase no válida." };
  if (!pieza.success) return { error: "Elige una pieza." };
  if (!fecha.success) return { error: "Revisa la fecha." };
  const supabase = await crearClienteServidor();
  const valores: Record<string, unknown> = {
    lanzamiento_id: lanzamiento.data,
    fase_id: fase.data,
  };
  if (fecha.data) valores.fecha_prevista = fecha.data;
  const { error } = await supabase
    .from("piezas")
    .update(valores)
    .eq("id", pieza.data)
    .is("publicado_snapshot", null);
  if (error) return { error: "No se pudo añadir la pieza al lanzamiento." };
  refrescar(lanzamiento.data);
  return { error: null, ok: true };
}

export async function quitarPiezaDelLanzamiento(lanzamientoId: string, piezaId: string) {
  const lanzamiento = uuid.safeParse(lanzamientoId);
  const pieza = uuid.safeParse(piezaId);
  if (!lanzamiento.success || !pieza.success) return;
  const supabase = await crearClienteServidor();
  await supabase
    .from("piezas")
    .update({ lanzamiento_id: null, fase_id: null })
    .eq("id", pieza.data)
    .eq("lanzamiento_id", lanzamiento.data);
  refrescar(lanzamiento.data);
}
