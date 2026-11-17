"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Resultado } from "@/shared/components/mensaje-resultado";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { esquemaFrase, esquemaReelPrueba, esquemaUso } from "./esquemas";

const uuid = z.string().uuid();
const texto = (d: FormData, k: string) => (d.get(k) ?? "").toString();

function refrescar() {
  revalidatePath("/frases");
  revalidatePath("/biblioteca");
}

export async function crearFrase(_p: Resultado, d: FormData): Promise<Resultado> {
  const r = esquemaFrase.safeParse({ texto: texto(d, "texto"), notas: texto(d, "notas") });
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa la frase." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("frases").insert(r.data);
  if (error) return { error: "No se pudo guardar la frase. Inténtalo de nuevo." };
  refrescar();
  return { error: null, ok: true };
}

export async function actualizarFrase(id: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const frase = uuid.safeParse(id);
  const r = esquemaFrase.safeParse({ texto: texto(d, "texto"), notas: texto(d, "notas") });
  if (!frase.success) return { error: "Frase no válida." };
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa la frase." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("frases").update(r.data).eq("id", frase.data);
  if (error) return { error: "No se pudo guardar la frase." };
  refrescar();
  return { error: null, ok: true };
}

export async function alternarFavorita(id: string, favorita: boolean) {
  const frase = uuid.safeParse(id); if (!frase.success) return;
  const supabase = await crearClienteServidor();
  await supabase.from("frases").update({ favorita }).eq("id", frase.data);
  refrescar();
}

export async function archivarFrase(id: string, archivada: boolean) {
  const frase = uuid.safeParse(id); if (!frase.success) return;
  const supabase = await crearClienteServidor();
  await supabase.from("frases").update({ archivada }).eq("id", frase.data);
  refrescar();
}

export async function registrarUsoFrase(id: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const frase = uuid.safeParse(id);
  const uso = esquemaUso.safeParse({ fecha: texto(d, "fecha"), url: texto(d, "url") });
  if (!frase.success) return { error: "Frase no válida." };
  if (!uso.success) return { error: uso.error.issues[0]?.message ?? "Revisa el uso." };
  const supabase = await crearClienteServidor();
  const { data } = await supabase.from("frases").select("texto").eq("id", frase.data).maybeSingle();
  if (!data) return { error: "No encontramos la frase." };
  const { error } = await supabase.from("frase_usos").insert({ frase_id: frase.data, ...uso.data, texto_usado: data.texto });
  if (error) return { error: "No se pudo registrar el uso." };
  refrescar();
  return { error: null, ok: true };
}

export async function crearVarianteFrase(id: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const origen = uuid.safeParse(id);
  const r = esquemaFrase.safeParse({ texto: texto(d, "texto"), notas: "" });
  if (!origen.success) return { error: "Frase no válida." };
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa la variante." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("frases").insert({ ...r.data, frase_origen_id: origen.data });
  if (error) return { error: "No se pudo guardar la variante." };
  refrescar();
  return { error: null, ok: true };
}

export async function planificarReelPrueba(id: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const frase = uuid.safeParse(id);
  const r = esquemaReelPrueba.safeParse({ texto_en_pantalla: texto(d, "texto_en_pantalla"), plano: texto(d, "plano"), fecha_prevista: texto(d, "fecha_prevista") });
  if (!frase.success) return { error: "Frase no válida." };
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa el reel." };
  const supabase = await crearClienteServidor();
  const { data: origen } = await supabase.from("frases").select("texto").eq("id", frase.data).maybeSingle();
  if (!origen) return { error: "No encontramos la frase." };
  const titulo = origen.texto.split("\n")[0]?.slice(0, 100) || "Reel de prueba";
  const { error } = await supabase.from("piezas").insert({
    frase_id: frase.data, titulo: `Reel de prueba · ${titulo}`, formato: "reel_prueba", canal: "instagram",
    finalidad: "attract", duracion_seg: 7, ...r.data,
  });
  if (error) return { error: "No se pudo planificar el reel." };
  refrescar();
  return { error: null, ok: true };
}
