import type { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { lunesDe, sumarDias } from "@/shared/lib/fechas";
import { OFERTAS_DEMO, PILARES_DEMO } from "./contenido-catalogos";
import { RECURSOS_DEMO } from "./contenido-ideas";
import {
  sembrarBroadcasts,
  sembrarPiezasCentrales,
  sembrarPiezasLanzamiento,
  sembrarPublicados,
} from "./sembrar-piezas";
import { sembrarFrases, sembrarGrabada, sembrarIdeas, sembrarSecuencia } from "./sembrar-resto";

type Cliente = Awaited<ReturnType<typeof crearClienteServidor>>;

export type ResultadoDemo = { ok: boolean; mensaje: string };

const hoy = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());

/** Cuántas piezas de ejemplo hay ahora mismo. */
export async function contarEjemplo(supabase: Cliente): Promise<number> {
  const { count } = await supabase.from("piezas").select("id", { count: "exact", head: true }).eq("es_demo", true);
  return count ?? 0;
}

/** Las ofertas sin sus objeciones: esas van en su propia tabla. */
function sinObjeciones(oferta: (typeof OFERTAS_DEMO)[number]) {
  return {
    nombre: oferta.nombre,
    tipo: oferta.tipo,
    publico: oferta.publico,
    problema: oferta.problema,
    propuesta_valor: oferta.propuesta_valor,
    via_compra: oferta.via_compra,
    via_compra_url: oferta.via_compra_url,
    precio: oferta.precio,
  };
}

/**
 * Carga el ejemplo de `docs/04-datos-demo.md`. Todo lo que crea queda marcado
 * como ejemplo, así que se puede quitar sin tocar nada de la usuaria.
 */
export async function sembrarEjemplo(supabase: Cliente): Promise<ResultadoDemo> {
  const yaEsta = await contarEjemplo(supabase);
  if (yaEsta > 0) return { ok: false, mensaje: "El ejemplo ya está cargado. No se carga dos veces." };

  const L = lunesDe(hoy());
  const dia = (n: number) => sumarDias(L, n);
  const hoyIso = hoy();

  const { data: pilaresR } = await supabase
    .from("pilares")
    .insert(PILARES_DEMO.map((p, i) => ({ ...p, es_demo: true, orden: i })))
    .select("id,nombre");
  const pilares = new Map(((pilaresR ?? []) as { id: string; nombre: string }[]).map((p) => [p.nombre, p.id]));

  const { data: ofertasR } = await supabase
    .from("ofertas")
    .insert(OFERTAS_DEMO.map((oferta) => ({ ...sinObjeciones(oferta), es_demo: true })))
    .select("id,nombre");
  const ofertas = new Map(((ofertasR ?? []) as { id: string; nombre: string }[]).map((o) => [o.nombre, o.id]));
  const curso = ofertas.get("Curso «Semana en Calma»") ?? null;

  for (const oferta of OFERTAS_DEMO) {
    const id = ofertas.get(oferta.nombre);
    if (!id) continue;
    await supabase.from("oferta_objeciones").insert(
      oferta.objeciones.map((o, i) => ({
        es_demo: true,
        oferta_id: id,
        objecion: o.objecion,
        respuesta: o.respuesta,
        orden: i,
      })),
    );
  }

  const { data: lanzamientoR } = await supabase
    .from("lanzamientos")
    .insert({
      es_demo: true,
      nombre: "Semana en Calma · edición de otoño",
      oferta_id: curso,
      objetivo: "Vender 25 plazas",
      fecha_inicio: dia(0),
      fecha_fin: dia(21),
      estado: "en_preparacion",
    })
    .select("id")
    .single();
  const lanzamiento = lanzamientoR?.id ?? null;

  let fases: Map<string, string> | null = null;
  if (lanzamiento) {
    const definicion = [
      { tipo: "expectacion", nombre: "Expectación", desde: 0, hasta: 6, notas: "Que se reconozcan en el problema y sepan que viene algo" },
      { tipo: "apertura", nombre: "Apertura", desde: 7, hasta: 8, notas: "Anunciar que se abren las plazas" },
      { tipo: "venta", nombre: "Venta", desde: 9, hasta: 12, notas: "Resolver dudas y objeciones" },
      { tipo: "cierre", nombre: "Cierre", desde: 13, hasta: 14, notas: "Último aviso" },
      { tipo: "seguimiento", nombre: "Seguimiento", desde: 15, hasta: 21, notas: "Dar la bienvenida y recoger impresiones" },
    ] as const;
    const { data: fasesR } = await supabase
      .from("lanzamiento_fases")
      .insert(
        definicion.map((f, i) => ({
          es_demo: true,
          lanzamiento_id: lanzamiento,
          tipo: f.tipo,
          nombre: f.nombre,
          fecha_inicio: dia(f.desde),
          fecha_fin: dia(f.hasta),
          orden: i,
          notas: f.notas,
        })),
      )
      .select("id,tipo");
    const mapaFases = new Map(((fasesR ?? []) as { id: string; tipo: string }[]).map((f) => [f.tipo, f.id]));
    fases = mapaFases;
    const hitos = [
      { titulo: "Abrir lista de espera", dia: 1, fase: "expectacion" },
      { titulo: "Abrir inscripciones", dia: 7, fase: "apertura" },
      { titulo: "Directo de preguntas", dia: 10, fase: "venta" },
      { titulo: "Cierre de inscripciones", dia: 14, fase: "cierre" },
      { titulo: "Empieza el curso", dia: 21, fase: "seguimiento" },
    ];
    await supabase.from("lanzamiento_hitos").insert(
      hitos.map((h) => ({
        es_demo: true,
        lanzamiento_id: lanzamiento,
        fase_id: mapaFases.get(h.fase) ?? null,
        titulo: h.titulo,
        fecha: dia(h.dia),
        hecho: h.dia === 1 && dia(h.dia) < hoyIso,
      })),
    );
    await sembrarPiezasLanzamiento(supabase, { dia, pilares, ofertas, lanzamiento, fases: mapaFases });
  }

  const { data: ideaR } = await supabase
    .from("ideas")
    .insert({
      es_demo: true,
      texto: "¿Cómo sé si me basta con el curso o necesito una asesoría individual?",
      tipo: "pregunta",
      estado: "pendiente",
      palabras_originales: "¿Cómo sé si me basta con el curso o necesito una asesoría individual?",
      procedencia: "Mensaje privado de Instagram",
      veces_aparecida: 4,
      pilar_id: pilares.get("Mi método por dentro") ?? null,
      oferta_id: curso,
      lanzamiento_id: lanzamiento,
      relevancia: 3,
      demanda: 3,
      minutos_preparacion: 30,
      notas: "La idea que explica el example entero.",
    })
    .select("id")
    .single();
  const idea = ideaR?.id ?? null;
  if (idea) {
    await supabase.from("idea_angulos").insert([
      {
        es_demo: true,
        idea_id: idea,
        tipo: "objecion_compra",
        nota: "Detrás hay miedo a gastar dos veces. Explicar que el curso es el punto de partida y la sesión es para casos concretos.",
      },
      {
        es_demo: true,
        idea_id: idea,
        tipo: "caso_real",
        nota: "Lucía hizo el curso y no necesitó más. Irene empezó por la sesión porque tenía equipo.",
      },
      {
        es_demo: true,
        idea_id: idea,
        tipo: "error_frecuente",
        nota: "Pensar que lo individual siempre es mejor.",
      },
    ]);
  }

  await sembrarPiezasCentrales(supabase, { idea, dia, pilares, ofertas, lanzamiento, fases });
  await sembrarBroadcasts(supabase, { dia, pilares, ofertas, lanzamiento });
  await sembrarSecuencia(supabase, { ofertas });
  await sembrarFrases(supabase, { dia });
  await sembrarPublicados(supabase, { dia, pilares, ofertas });
  await sembrarIdeas(supabase, { ofertas, pilares, lanzamiento });

  const { data: piezasDemo } = await supabase.from("piezas").select("id,titulo").eq("es_demo", true);
  await sembrarGrabada(supabase, (piezasDemo ?? []) as { id: string; titulo: string }[]);
  await supabase.from("recursos_marca").insert(RECURSOS_DEMO.map((r) => ({ ...r, es_demo: true })));

  return { ok: true, mensaje: "Ejemplo cargado. Está en Ajustes, en «Datos de ejemplo»." };
}

/** Quita el ejemplo: solo borra filas marcadas como ejemplo. */
export async function quitarEjemplo(supabase: Cliente): Promise<ResultadoDemo> {
  const antes = await contarEjemplo(supabase);
  if (antes === 0) return { ok: false, mensaje: "No hay ningún ejemplo cargado." };
  const tablas = [
    "pieza_metricas",
    "secuencia_pasos",
    "story_tarjetas",
    "pieza_versiones",
    "frase_usos",
    "sesion_piezas",
    "idea_angulos",
    "oferta_objeciones",
    "lanzamiento_hitos",
    "lanzamiento_fases",
    "piezas",
    "ideas",
    "frases",
    "sesiones_grabacion",
    "secuencias_email",
    "lanzamientos",
    "ofertas",
    "pilares",
    "recursos_marca",
  ];
  const fallos: string[] = [];
  for (const tabla of tablas) {
    const { error } = await supabase.from(tabla).delete().eq("es_demo", true);
    if (error) fallos.push(`${tabla}: ${error.message}`);
  }
  const despues = await contarEjemplo(supabase);
  return {
    ok: despues === 0,
    mensaje:
      despues === 0
        ? "Ejemplo quitado. No se ha tocado nada tuyo."
        : `Se ha quitado casi todo el ejemplo. No se pudo borrar: ${fallos.join("; ") || "motivo desconocido"}`,
  };
}
