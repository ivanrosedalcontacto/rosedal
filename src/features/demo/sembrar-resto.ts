import type { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { FRASES_DEMO, IDEAS_DEMO } from "./contenido-ideas";
import { SECUENCIA_POSTCOMPRA } from "./contenido-piezas";
import { crearAsuntos, crearPieza } from "./tipos";

type Cliente = Awaited<ReturnType<typeof crearClienteServidor>>;

/** La secuencia poscompra con sus cuatro correos y sus plazos relativos. */
export async function sembrarSecuencia(
  supabase: Cliente,
  ctx: { ofertas: Map<string, string> },
): Promise<void> {
  const { data: secR } = await supabase
    .from("secuencias_email")
    .insert({
      es_demo: true,
      nombre: SECUENCIA_POSTCOMPRA.nombre,
      tipo: SECUENCIA_POSTCOMPRA.tipo,
      programacion: SECUENCIA_POSTCOMPRA.programacion,
      audiencia: SECUENCIA_POSTCOMPRA.audiencia,
      disparador: SECUENCIA_POSTCOMPRA.disparador,
      objetivo: SECUENCIA_POSTCOMPRA.objetivo,
      oferta_id: ctx.ofertas.get("curso") ?? null,
    })
    .select("id")
    .single();
  const secuencia = secR?.id ?? null;
  if (!secuencia) return;

  for (const [indice, paso] of SECUENCIA_POSTCOMPRA.pasos.entries()) {
    const id = await crearPieza(supabase, {
      titulo: paso.proposito,
      formato: "email",
      canal: "email",
      estado: paso.estado,
      finalidad: paso.finalidad,
      oferta_id: "oferta" in paso ? (ctx.ofertas.get(paso.oferta) ?? null) : null,
      cta_accion: "cta_accion" in paso ? paso.cta_accion : null,
      cta_como: "cta_como" in paso ? paso.cta_como : null,
      email_preview: paso.asunto,
      email_cuerpo_html: paso.cuerpo,
    });
    if (!id) continue;
    await crearAsuntos(supabase, id, [{ texto: paso.asunto, elegida: true }]);
    await supabase.from("secuencia_pasos").insert({
      es_demo: true,
      secuencia_id: secuencia,
      pieza_id: id,
      orden: indice,
      plazo_cantidad: paso.plazo_cantidad,
      plazo_unidad: paso.plazo_unidad,
    });
  }
}

/** Las ocho frases, el uso registrado y el reel de prueba. */
export async function sembrarFrases(supabase: Cliente, ctx: { dia: (n: number) => string }): Promise<void> {
  const { data: frasesR } = await supabase
    .from("frases")
    .insert(FRASES_DEMO.map((f) => ({ ...f, es_demo: true })))
    .select("id,texto");
  const frases = (frasesR ?? []) as { id: string; texto: string }[];
  const porTexto = new Map(frases.map((f) => [f.texto, f.id]));

  const usada = porTexto.get("Planificar no es llenar la semana.\nEs decidir qué se queda fuera.");
  if (usada) {
    await supabase.from("frase_usos").insert({
      es_demo: true,
      frase_id: usada,
      fecha: ctx.dia(-10),
      url: "https://ejemplo.com/reel/planificar",
      texto_usado: "Planificar no es llenar la semana.\nEs decidir qué se queda fuera.",
    });
  }

  const origen = porTexto.get("Tu semana ideal cabe en una hoja.");
  const variante = porTexto.get("Tu semana ideal cabe en una hoja.\nLa real también.");
  if (origen && variante) {
    await supabase.from("frases").update({ frase_origen_id: origen }).eq("id", variante);
  }

  const fraseReel = porTexto.get("El lunes no empieza el lunes.\nEmpieza el viernes, cuando cierras bien.");
  if (fraseReel) {
    const id = await crearPieza(supabase, {
      titulo: "El lunes no empieza el lunes",
      formato: "reel_prueba",
      canal: "instagram",
      estado: "borrador",
      finalidad: "attract",
      frase_id: fraseReel,
      duracion_seg: 7,
      texto_en_pantalla: "El lunes no empieza el lunes.\nEmpieza el viernes, cuando cierras bien.",
      plano: "Mis manos abriendo la agenda",
      fecha_prevista: ctx.dia(5),
    });
    if (id) await crearGuionVacio(supabase, id);
  }
}

async function crearGuionVacio(supabase: Cliente, piezaId: string): Promise<void> {
  await supabase.from("pieza_versiones").insert({
    es_demo: true,
    pieza_id: piezaId,
    tipo: "guion",
    nombre: "Versión 1",
    elegida: true,
  });
}

/** La bandeja de ideas: sueltas, del lanzamiento y objeciones. */
export async function sembrarIdeas(
  supabase: Cliente,
  ctx: { ofertas: Map<string, string>; pilares: Map<string, string>; lanzamiento: string | null },
): Promise<void> {
  for (const idea of IDEAS_DEMO) {
    await supabase.from("ideas").insert({
      es_demo: true,
      texto: idea.texto,
      tipo: idea.tipo ?? "idea",
      estado: "pendiente",
      minutos_preparacion: idea.minutos ?? null,
      relevancia: idea.relevancia ?? null,
      demanda: idea.demanda ?? null,
      tema: idea.tema ?? null,
      problema_audiencia: idea.problema ?? null,
      procedencia: idea.procedencia ?? null,
      palabras_originales: idea.palabras ?? null,
      veces_aparecida: idea.veces ?? 1,
      oferta_id: idea.oferta ? (ctx.ofertas.get(idea.oferta === "curso" ? "Curso «Semana en Calma»" : "Asesoría individual «Sesión Brújula»") ?? null) : null,
      pilar_id: idea.sinClasificar ? null : (ctx.pilares.get("Planificación realista") ?? null),
      lanzamiento_id: idea.linkedLanzamiento ? ctx.lanzamiento : null,
    });
  }
}

/** Una pieza del ejemplo ya grabada, para que la biblioteca muestre «Ya grabadas». */
export async function sembrarGrabada(supabase: Cliente, piezas: { id: string; titulo: string }[]): Promise<void> {
  const yaGrabada = piezas.find((p) => p.titulo === "Tu lunes no tiene la culpa");
  if (yaGrabada) await supabase.from("piezas").update({ estado: "grabado" }).eq("id", yaGrabada.id);
}
