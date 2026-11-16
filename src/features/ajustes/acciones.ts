"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Resultado } from "@/shared/components/mensaje-resultado";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { esquemaMarca, esquemaPilar } from "./esquemas";

const texto = (d: FormData, k: string) => (d.get(k) ?? "").toString();

function leerPilar(d: FormData) {
  return esquemaPilar.safeParse({
    nombre: texto(d, "nombre"),
    descripcion: texto(d, "descripcion"),
    color: texto(d, "color") || "verde",
  });
}

export async function crearPilar(_p: Resultado, d: FormData): Promise<Resultado> {
  const r = leerPilar(d);
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa los datos." };
  const supabase = await crearClienteServidor();
  const { count } = await supabase.from("pilares").select("id", { count: "exact", head: true });
  const { error } = await supabase.from("pilares").insert({ ...r.data, orden: count ?? 0 });
  if (error) return { error: "No se pudo guardar el pilar. Inténtalo de nuevo." };
  revalidatePath("/ajustes");
  return { error: null, ok: true };
}

export async function editarPilar(id: string, _p: Resultado, d: FormData): Promise<Resultado> {
  const idValido = z.string().uuid().safeParse(id);
  const r = leerPilar(d);
  if (!idValido.success) return { error: "Pilar no válido." };
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa los datos." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("pilares").update(r.data).eq("id", idValido.data);
  if (error) return { error: "No se pudo guardar. Inténtalo de nuevo." };
  revalidatePath("/ajustes");
  return { error: null, ok: true };
}

export async function archivarPilar(id: string, archivado: boolean) {
  const idValido = z.string().uuid().safeParse(id);
  if (!idValido.success) return;
  const supabase = await crearClienteServidor();
  await supabase.from("pilares").update({ archivado }).eq("id", idValido.data);
  revalidatePath("/ajustes");
}

export async function guardarMarca(_p: Resultado, d: FormData): Promise<Resultado> {
  const r = esquemaMarca.safeParse({
    nombre_marca: texto(d, "nombre_marca"),
    audiencia_general: texto(d, "audiencia_general"),
    tono_general: texto(d, "tono_general"),
  });
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa los datos." };
  const supabase = await crearClienteServidor();
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return { error: "Tu sesión ha caducado. Vuelve a entrar." };
  const { error } = await supabase.from("ajustes").upsert({ ...r.data, user_id: u.user.id }, { onConflict: "user_id" });
  if (error) return { error: "No se pudo guardar. Tu texto sigue aquí; inténtalo de nuevo." };
  revalidatePath("/ajustes");
  return { error: null, ok: true };
}
