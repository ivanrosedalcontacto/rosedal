import type { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import {
  BROADCASTS_DEMO,
  CORREO_CENTRAL,
  PIEZAS_LANZAMIENTO,
  PUBLICADOS_DEMO,
  REEL_CENTRAL,
  STORIES_CENTRAL,
} from "./contenido-piezas";
import { crearAsuntos, crearGuion, crearPieza, type Contexto, type ContextoSimple } from "./tipos";

type Cliente = Awaited<ReturnType<typeof crearClienteServidor>>;

/** Las piezas del lanzamiento, con su fase y su estado. */
export async function sembrarPiezasLanzamiento(
  supabase: Cliente,
  ctx: Contexto,
): Promise<void> {
  const { dia, pilares, ofertas, lanzamiento, fases } = ctx;
  for (const pieza of PIEZAS_LANZAMIENTO) {
    const esCorreo = pieza.formato === "email";
    const id = await crearPieza(supabase, {
      titulo: pieza.titulo,
      formato: pieza.formato,
      canal: pieza.canal,
      estado: pieza.estado,
      finalidad: pieza.finalidad,
      pilar_id: "pilar" in pieza ? (pilares.get(pieza.pilar) ?? null) : null,
      oferta_id: "oferta" in pieza ? (ofertas.get("curso") ?? null) : null,
      lanzamiento_id: lanzamiento,
      fase_id: fases?.get(pieza.fase) ?? null,
      fecha_prevista: dia(diaDeFase(pieza.fase)),
      duracion_seg: "duracion_seg" in pieza ? pieza.duracion_seg : null,
      texto_publicacion: "texto_publicacion" in pieza ? pieza.texto_publicacion : "",
      plano: "plano" in pieza ? pieza.plano : null,
      preparacion: "preparacion" in pieza ? pieza.preparacion : null,
      cta_accion: "cta_accion" in pieza ? pieza.cta_accion : null,
      cta_como: "cta_como" in pieza ? pieza.cta_como : null,
      cta_url: "cta_accion" in pieza && pieza.cta_accion ? "https://ejemplo.com/semana-en-calma" : null,
      email_preview: esCorreo ? ("vista_previa" in pieza ? pieza.vista_previa : "") : null,
      email_cuerpo_html: esCorreo ? ("cuerpo" in pieza ? pieza.cuerpo : "") : null,
    });
    if (!id) continue;
    if (esCorreo && "asunto" in pieza) {
      await crearAsuntos(supabase, id, [{ texto: pieza.asunto, elegida: true }]);
    }
    if ("tarjetas" in pieza && Array.isArray(pieza.tarjetas)) {
      await supabase.from("story_tarjetas").insert(
        pieza.tarjetas.map((t, i) => ({
          es_demo: true,
          pieza_id: id,
          orden: i,
          titulo: t.titulo,
          que_digo: t.que_digo ?? "",
          texto_pantalla: t.texto_pantalla ?? "",
          visual: t.visual ?? "",
          interaccion: "interaccion" in t ? t.interaccion : "ninguna",
          interaccion_detalle: "interaccion_detalle" in t ? t.interaccion_detalle : "",
        })),
      );
    }
  }
}

/** El día previsto de cada pieza del lanzamiento, según su fase. */
function diaDeFase(fase: string): number {
  const dias: Record<string, number> = { expectacion: 3, apertura: 7, venta: 11, cierre: 14, seguimiento: 16 };
  return dias[fase] ?? 3;
}

/** Las tres piezas que salen de la idea central: reel, stories y correo. */
export async function sembrarPiezasCentrales(
  supabase: Cliente,
  ctx: Contexto & { idea: string | null; fases: Map<string, string> | null },
): Promise<string | null> {
  const { idea, dia, pilares, ofertas, lanzamiento } = ctx;
  const reel = await crearPieza(supabase, {
    titulo: REEL_CENTRAL.titulo,
    formato: REEL_CENTRAL.formato,
    canal: REEL_CENTRAL.canal,
    estado: "planificado",
    finalidad: REEL_CENTRAL.finalidad,
    pilar_id: pilares.get("Mi método por dentro") ?? null,
    idea_id: idea,
    fecha_prevista: dia(3),
    duracion_seg: REEL_CENTRAL.duracion_seg,
    texto_publicacion: REEL_CENTRAL.texto_publicacion,
    plano: REEL_CENTRAL.plano,
    preparacion: REEL_CENTRAL.preparacion,
  });
  if (reel) {
    await crearGuion(supabase, reel, "Gancho directo", REEL_CENTRAL.gancho, REEL_CENTRAL.desarrollo, REEL_CENTRAL.cierre, true, 0);
    await crearGuion(
      supabase,
      reel,
      "Gancho a la contra",
      REEL_CENTRAL.ganchoContra,
      REEL_CENTRAL.desarrollo,
      REEL_CENTRAL.cierre,
      false,
      1,
    );
  }

  const stories = await crearPieza(supabase, {
    titulo: STORIES_CENTRAL.titulo,
    formato: STORIES_CENTRAL.formato,
    canal: STORIES_CENTRAL.canal,
    estado: "en_preparacion",
    finalidad: STORIES_CENTRAL.finalidad,
    idea_id: idea,
    fecha_prevista: dia(4),
  });
  if (stories) {
    await supabase.from("story_tarjetas").insert(
      STORIES_CENTRAL.tarjetas.map((t, i) => ({
        es_demo: true,
        pieza_id: stories,
        orden: i,
        titulo: t.titulo,
        que_digo: t.que_digo,
        texto_pantalla: t.texto_pantalla,
        visual: t.visual,
        interaccion: t.interaccion,
        interaccion_detalle: t.interaccion_detalle,
      })),
    );
  }

  const correo = await crearPieza(supabase, {
    titulo: CORREO_CENTRAL.titulo,
    formato: CORREO_CENTRAL.formato,
    canal: CORREO_CENTRAL.canal,
    estado: "borrador",
    finalidad: CORREO_CENTRAL.finalidad,
    oferta_id: ofertas.get("curso") ?? null,
    lanzamiento_id: lanzamiento,
    idea_id: idea,
    origen_pieza_id: reel,
    relacion_origen: "adaptacion",
    fecha_prevista: dia(9),
    cta_accion: CORREO_CENTRAL.cta_accion,
    cta_como: CORREO_CENTRAL.cta_como,
    cta_url: "https://ejemplo.com/semana-en-calma",
    email_preview: CORREO_CENTRAL.vista_previa,
    email_cuerpo_html: CORREO_CENTRAL.cuerpo,
  });
  if (correo) {
    await crearAsuntos(supabase, correo, [
      { texto: CORREO_CENTRAL.asunto, elegida: true },
      { texto: CORREO_CENTRAL.asuntoAlternativo, elegida: false },
    ]);
  }
  return reel;
}

/** Los tres correos de la semana en curso. */
export async function sembrarBroadcasts(
  supabase: Cliente,
  ctx: ContextoSimple & { lanzamiento: string | null },
): Promise<void> {
  const { dia, ofertas, lanzamiento } = ctx;
  const dias: Record<string, number> = { domingo: 0, listas: 2, plazas: 4 };
  for (const correo of BROADCASTS_DEMO) {
    const id = await crearPieza(supabase, {
      titulo: correo.titulo,
      formato: "email",
      canal: "email",
      estado: correo.estado,
      finalidad: correo.finalidad,
      oferta_id: "oferta" in correo ? (ofertas.get(correo.oferta) ?? null) : null,
      lanzamiento_id: "oferta" in correo ? lanzamiento : null,
      fecha_prevista: dia(dias[correo.clave] ?? 0),
      cta_accion: "cta_accion" in correo ? correo.cta_accion : null,
      cta_como: "cta_como" in correo ? correo.cta_como : null,
      cta_url: "cta_accion" in correo && correo.cta_accion ? "https://ejemplo.com/semana-en-calma" : null,
      email_preview: correo.vista_previa,
      email_cuerpo_html: correo.cuerpo,
    });
    if (!id) continue;
    await crearAsuntos(supabase, id, [
      { texto: correo.asunto, elegida: true },
      { texto: correo.asuntoAlternativo, elegida: false },
    ]);
  }
}

/** Lo ya publicado, con sus métricas, y la pieza atrasada. */
export async function sembrarPublicados(supabase: Cliente, ctx: ContextoSimple): Promise<void> {
  const { dia, pilares, ofertas } = ctx;
  for (const pieza of PUBLICADOS_DEMO) {
    const esCorreo = pieza.formato === "email";
    const id = await crearPieza(supabase, {
      titulo: pieza.titulo,
      formato: pieza.formato,
      canal: pieza.canal,
      estado: "publicado",
      finalidad: pieza.finalidad,
      pilar_id: "pilar" in pieza ? (pilares.get(pieza.pilar) ?? null) : null,
      oferta_id: "oferta" in pieza ? (ofertas.get(pieza.oferta) ?? null) : null,
      fecha_prevista: dia(pieza.fecha_prevista),
      fecha_real: dia(pieza.fecha_real),
      url_publicada: pieza.url,
      duracion_seg: "duracion_seg" in pieza ? pieza.duracion_seg : null,
      cta_accion: "cta_accion" in pieza ? pieza.cta_accion : null,
      cta_como: "cta_como" in pieza ? pieza.cta_como : null,
      email_preview: esCorreo ? ("vista_previa" in pieza ? pieza.vista_previa : "") : null,
      email_cuerpo_html: esCorreo ? ("cuerpo" in pieza ? pieza.cuerpo : "") : null,
    });
    if (!id) continue;
    if (esCorreo && "asunto" in pieza) {
      await crearAsuntos(supabase, id, [{ texto: pieza.asunto, elegida: true }]);
    }
    const { data: fila } = await supabase.from("piezas").select("*").eq("id", id).maybeSingle();
    if (fila) {
      await supabase
        .from("piezas")
        .update({ publicado_snapshot: { ...fila, email_asunto: "asunto" in pieza ? pieza.asunto : null, email_asuntos: ["asunto" in pieza ? pieza.asunto : ""] } })
        .eq("id", id);
    }
    await supabase.from("pieza_metricas").insert(
      pieza.metricas.map((m) => ({
        es_demo: true,
        pieza_id: id,
        clave: m.clave,
        valor: m.valor,
        atribucion: m.atribucion,
      })),
    );
  }

  await crearPieza(supabase, {
    titulo: "Mi plantilla de revisión semanal",
    formato: "post",
    canal: "instagram",
    estado: "listo",
    finalidad: "nurture",
    pilar_id: pilares.get("Planificación realista") ?? null,
    fecha_prevista: dia(-1),
    texto_publicacion: "La plantilla con la que cierro la semana en quince minutos.",
  });
}
