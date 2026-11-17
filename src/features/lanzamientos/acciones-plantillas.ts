"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Resultado } from "@/shared/components/mensaje-resultado";
import { sumarDias } from "@/shared/lib/fechas";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { esquemaAplicarPlantilla, esquemaPlantillaLanzamiento } from "./esquemas";

const uuid = z.string().uuid();
const texto = (d: FormData, k: string) => (d.get(k) ?? "").toString();

function refrescar(lanzamientoId?: string) {
  revalidatePath("/lanzamientos");
  revalidatePath("/ajustes");
  revalidatePath("/biblioteca");
  revalidatePath("/email");
  if (lanzamientoId) revalidatePath(`/lanzamientos/${lanzamientoId}`);
}

function leerContenido(valor: string) {
  try {
    const json: unknown = JSON.parse(valor);
    return esquemaPlantillaLanzamiento.safeParse(json);
  } catch {
    return esquemaPlantillaLanzamiento.safeParse(null);
  }
}

export async function guardarPlantillaLanzamiento(plantillaId: string | null, _p: Resultado, d: FormData): Promise<Resultado> {
  const nombre = z.string().trim().min(1, "Ponle un nombre a la plantilla.").max(200).safeParse(texto(d, "nombre"));
  const descripcion = z.string().trim().max(1000).safeParse(texto(d, "descripcion"));
  const contenido = leerContenido(texto(d, "contenido"));
  if (!nombre.success) return { error: nombre.error.issues[0]?.message ?? "Revisa el nombre." };
  if (!descripcion.success) return { error: "Revisa la descripción." };
  if (!contenido.success) return { error: contenido.error.issues[0]?.message ?? "Revisa las fases, hitos y piezas." };
  const supabase = await crearClienteServidor();
  const valores = { nombre: nombre.data, descripcion: descripcion.data, contenido: contenido.data };
  if (plantillaId === null) {
    const { error } = await supabase.from("plantillas").insert({ ...valores, tipo: "lanzamiento" });
    if (error) return { error: "No se pudo guardar la plantilla." };
  } else {
    const id = uuid.safeParse(plantillaId);
    if (!id.success) return { error: "Plantilla no válida." };
    const { error } = await supabase.from("plantillas").update(valores).eq("id", id.data).eq("tipo", "lanzamiento");
    if (error) return { error: "No se pudo guardar la plantilla." };
  }
  refrescar();
  return { error: null, ok: true };
}

export async function eliminarPlantillaLanzamiento(id: string) {
  const plantilla = uuid.safeParse(id);
  if (!plantilla.success) return;
  const supabase = await crearClienteServidor();
  await supabase.from("plantillas").delete().eq("id", plantilla.data).eq("tipo", "lanzamiento").is("clave", null);
  refrescar();
}

export async function aplicarPlantilla(_p: Resultado, d: FormData): Promise<Resultado> {
  const r = esquemaAplicarPlantilla.safeParse({
    plantilla_id: texto(d, "plantilla_id"),
    nombre: texto(d, "nombre"),
    oferta_id: texto(d, "oferta_id"),
    fecha_apertura: texto(d, "fecha_apertura"),
  });
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa los datos." };
  const supabase = await crearClienteServidor();
  const { data: fila } = await supabase
    .from("plantillas")
    .select("contenido")
    .eq("id", r.data.plantilla_id)
    .eq("tipo", "lanzamiento")
    .maybeSingle();
  if (!fila) return { error: "No encontramos esa plantilla." };
  const contenido = esquemaPlantillaLanzamiento.safeParse(fila.contenido);
  if (!contenido.success) return { error: "La plantilla no tiene una estructura válida." };
  const apertura = r.data.fecha_apertura;
  const fechas = contenido.data.fases.flatMap((f) => [sumarDias(apertura, f.inicio_dias), sumarDias(apertura, f.fin_dias)]).sort();
  const { data: lanzamiento, error } = await supabase
    .from("lanzamientos")
    .insert({
      nombre: r.data.nombre,
      oferta_id: r.data.oferta_id,
      fecha_inicio: fechas[0] ?? apertura,
      fecha_fin: fechas.at(-1) ?? apertura,
      estado: "en_preparacion",
    })
    .select("id")
    .single();
  if (error || !lanzamiento) return { error: "No se pudo crear el lanzamiento." };

  const { data: fases, error: errorFases } = await supabase
    .from("lanzamiento_fases")
    .insert(
      contenido.data.fases.map((fase, orden) => ({
        lanzamiento_id: lanzamiento.id,
        tipo: fase.tipo,
        nombre: fase.nombre,
        fecha_inicio: sumarDias(apertura, fase.inicio_dias),
        fecha_fin: sumarDias(apertura, fase.fin_dias),
        orden,
        notas: fase.notas,
      })),
    )
    .select("id,tipo");
  if (errorFases || !fases) return { error: "El lanzamiento se creó, pero no se pudieron crear sus fases." };
  const fasePorTipo = new Map(fases.map((f) => [f.tipo as string, f.id as string]));

  if (contenido.data.hitos.length > 0) {
    await supabase.from("lanzamiento_hitos").insert(
      contenido.data.hitos.map((hito) => ({
        lanzamiento_id: lanzamiento.id,
        fase_id: fasePorTipo.get(hito.fase) ?? null,
        titulo: hito.titulo,
        fecha: sumarDias(apertura, hito.dias),
      })),
    );
  }

  if (contenido.data.piezas.length > 0) {
    await supabase.from("piezas").insert(
      contenido.data.piezas.map((pieza) => ({
        lanzamiento_id: lanzamiento.id,
        fase_id: fasePorTipo.get(pieza.fase) ?? null,
        titulo: pieza.titulo,
        formato: pieza.formato,
        canal: pieza.formato === "email" ? "email" : "instagram",
        finalidad: pieza.finalidad,
        fecha_prevista: sumarDias(apertura, pieza.dias),
        estado: "borrador",
      })),
    );
  }

  refrescar(lanzamiento.id);
  redirect(`/lanzamientos/${lanzamiento.id}`);
}
