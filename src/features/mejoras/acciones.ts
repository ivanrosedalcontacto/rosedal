"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { sanearBusqueda } from "@/shared/lib/texto";

export type ResultadoBusqueda = {
  tipo: "idea" | "pieza" | "frase" | "correo" | "oferta" | "recurso";
  id: string;
  titulo: string;
  detalle: string;
  href: string;
};

/** Busca en ideas, piezas, frases, correos, ofertas y recursos. */
export async function buscarGlobal(texto: string): Promise<ResultadoBusqueda[]> {
  const limpio = sanearBusqueda(texto).slice(0, 60);
  if (limpio.length < 2) return [];
  const supabase = await crearClienteServidor();
  const patron = `%${limpio}%`;
  const [ideasQ, piezasQ, frasesQ, ofertasQ, recursosQ] = await Promise.all([
    supabase.from("ideas").select("id,texto,tipo").is("eliminado_en", null).ilike("texto", patron).limit(5),
    supabase.from("piezas").select("id,titulo,formato,estado").is("eliminado_en", null).ilike("titulo", patron).limit(7),
    supabase.from("frases").select("id,texto").is("eliminado_en", null).ilike("texto", patron).limit(5),
    supabase.from("ofertas").select("id,nombre,tipo").ilike("nombre", patron).limit(5),
    supabase.from("recursos_marca").select("id,titulo,texto,tipo").is("eliminado_en", null).ilike("texto", patron).limit(5),
  ]);

  const resultados: ResultadoBusqueda[] = [];
  for (const idea of ideasQ.data ?? []) {
    resultados.push({
      tipo: "idea",
      id: idea.id as string,
      titulo: (idea.texto as string).slice(0, 80),
      detalle: idea.tipo === "idea_email" ? "Idea de email" : "Idea",
      href: `/ideas/${idea.id}`,
    });
  }
  for (const pieza of piezasQ.data ?? []) {
    const esCorreo = pieza.formato === "email";
    resultados.push({
      tipo: esCorreo ? "correo" : "pieza",
      id: pieza.id as string,
      titulo: pieza.titulo as string,
      detalle: `${pieza.formato} · ${pieza.estado}`,
      href: `/piezas/${pieza.id}`,
    });
  }
  for (const frase of frasesQ.data ?? []) {
    resultados.push({
      tipo: "frase",
      id: frase.id as string,
      titulo: (frase.texto as string).split("\n")[0].slice(0, 80),
      detalle: "Frase",
      href: "/frases",
    });
  }
  for (const oferta of ofertasQ.data ?? []) {
    resultados.push({
      tipo: "oferta",
      id: oferta.id as string,
      titulo: oferta.nombre as string,
      detalle: oferta.tipo === "producto" ? "Producto" : "Servicio",
      href: `/ofertas/${oferta.id}`,
    });
  }
  for (const recurso of recursosQ.data ?? []) {
    resultados.push({
      tipo: "recurso",
      id: recurso.id as string,
      titulo: (recurso.titulo as string) || (recurso.texto as string).slice(0, 60),
      detalle: `Recurso de marca · ${recurso.tipo}`,
      href: "/recursos",
    });
  }
  return resultados;
}

/** Restaura un elemento de la papelera. */
export async function restaurarDeLaPapelera(tipo: "idea" | "pieza" | "frase" | "recurso", id: string) {
  const uuid = z.string().uuid();
  const valido = uuid.safeParse(id);
  if (!valido.success) return;
  const supabase = await crearClienteServidor();
  const tablas = { idea: "ideas", pieza: "piezas", frase: "frases", recurso: "recursos_marca" } as const;
  await supabase.from(tablas[tipo]).update({ eliminado_en: null }).eq("id", valido.data);
  revalidatePath("/ajustes");
  revalidatePath("/biblioteca");
  revalidatePath("/ideas");
  revalidatePath("/frases");
  revalidatePath("/recursos");
}

/** Vacía la papelera: borra de verdad lo que hay dentro. */
export async function vaciarPapelera() {
  const supabase = await crearClienteServidor();
  await supabase.from("ideas").delete().not("eliminado_en", "is", null);
  await supabase.from("piezas").delete().not("eliminado_en", "is", null);
  await supabase.from("frases").delete().not("eliminado_en", "is", null);
  await supabase.from("recursos_marca").delete().not("eliminado_en", "is", null);
  revalidatePath("/ajustes");
  revalidatePath("/biblioteca");
  revalidatePath("/ideas");
  revalidatePath("/frases");
  revalidatePath("/recursos");
}
