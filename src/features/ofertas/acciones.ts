"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Resultado } from "@/shared/components/mensaje-resultado";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { esquemaObjecion, esquemaOferta } from "./esquemas";

const texto = (d: FormData, k: string) => (d.get(k) ?? "").toString();
const uuid = z.string().uuid();

function leerOferta(d: FormData) {
  return esquemaOferta.safeParse({
    nombre: texto(d, "nombre"),
    tipo: texto(d, "tipo") || "producto",
    publico: texto(d, "publico"),
    problema: texto(d, "problema"),
    propuesta_valor: texto(d, "propuesta_valor"),
    via_compra: texto(d, "via_compra"),
    via_compra_url: texto(d, "via_compra_url"),
    precio: texto(d, "precio"),
  });
}

export async function crearOferta(_p: Resultado, d: FormData): Promise<Resultado> {
  const r = leerOferta(d);
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa los datos." };
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.from("ofertas").insert(r.data).select("id").single();
  if (error || !data) return { error: "No se pudo guardar la oferta. Inténtalo de nuevo." };
  revalidatePath("/ofertas");
  redirect(`/ofertas/${data.id}`);
}

export async function actualizarOferta(id: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const idValido = uuid.safeParse(id);
  const r = leerOferta(d);
  if (!idValido.success) return { error: "Oferta no válida." };
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa los datos." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("ofertas").update(r.data).eq("id", idValido.data);
  if (error) return { error: "No se pudo guardar. Tu texto sigue aquí; inténtalo de nuevo." };
  revalidatePath("/ofertas");
  revalidatePath(`/ofertas/${idValido.data}`);
  return { error: null, ok: true };
}

export async function archivarOferta(id: string, archivada: boolean) {
  const idValido = uuid.safeParse(id);
  if (!idValido.success) return;
  const supabase = await crearClienteServidor();
  await supabase.from("ofertas").update({ archivada }).eq("id", idValido.data);
  revalidatePath("/ofertas");
  revalidatePath(`/ofertas/${idValido.data}`);
}

export async function crearObjecion(ofertaId: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const idValido = uuid.safeParse(ofertaId);
  const r = esquemaObjecion.safeParse({ objecion: texto(d, "objecion"), respuesta: texto(d, "respuesta") });
  if (!idValido.success) return { error: "Oferta no válida." };
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa los datos." };
  const supabase = await crearClienteServidor();
  const { count } = await supabase
    .from("oferta_objeciones")
    .select("id", { count: "exact", head: true })
    .eq("oferta_id", idValido.data);
  const { error } = await supabase
    .from("oferta_objeciones")
    .insert({ ...r.data, oferta_id: idValido.data, orden: count ?? 0 });
  if (error) return { error: "No se pudo guardar la objeción. Inténtalo de nuevo." };
  revalidatePath(`/ofertas/${idValido.data}`);
  return { error: null, ok: true };
}

export async function borrarObjecion(ofertaId: string, id: string) {
  const a = uuid.safeParse(ofertaId);
  const b = uuid.safeParse(id);
  if (!a.success || !b.success) return;
  const supabase = await crearClienteServidor();
  await supabase.from("oferta_objeciones").delete().eq("id", b.data);
  revalidatePath(`/ofertas/${a.data}`);
}
