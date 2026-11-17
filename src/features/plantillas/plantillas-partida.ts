import type { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { esquemaPlantillaSecuencia } from "@/features/email/esquemas";

type Cliente = Awaited<ReturnType<typeof crearClienteServidor>>;

export type PlantillaSecuenciaEmail = {
  clave: string;
  nombre: string;
  descripcion: string;
  contenido: {
    tipo: "bienvenida" | "lanzamiento" | "poscompra" | "upsell" | "otra";
    programacion: "relativa" | "fechas";
    pasos: { finalidad: string | null; plazo_cantidad: number | null; plazo_unidad: string | null; proposito: string }[];
  };
};

export type PlantillaStories = {
  clave: string;
  nombre: string;
  descripcion: string;
  contenido: {
    tarjetas: {
      titulo: string;
      que_digo: string;
      texto_pantalla: string;
      interaccion: "ninguna" | "encuesta" | "pregunta" | "enlace" | "cta";
      interaccion_detalle: string;
    }[];
  };
};

/** Las cuatro plantillas de correo de partida: una por tipo, sin textos. */
export const PLANTILLAS_SECUENCIA_EMAIL: PlantillaSecuenciaEmail[] = [
  {
    clave: "secuencia_bienvenida",
    nombre: "Bienvenida",
    descripcion: "Cuatro correos con plazos relativos para recibir a quien acaba de comprar.",
    contenido: {
      tipo: "bienvenida",
      programacion: "relativa",
      pasos: [
        { finalidad: "nurture", plazo_cantidad: 0, plazo_unidad: "horas", proposito: "Ya estás dentro: por dónde empezar" },
        { finalidad: "position", plazo_cantidad: 1, plazo_unidad: "dias", proposito: "Lo primero que conviene tener claro" },
        { finalidad: "nurture", plazo_cantidad: 3, plazo_unidad: "dias", proposito: "¿Has hecho ya la primera lección?" },
        { finalidad: "convert", plazo_cantidad: 7, plazo_unidad: "dias", proposito: "Si quieres que lo miremos juntas" },
      ],
    },
  },
  {
    clave: "secuencia_lanzamiento",
    nombre: "Lanzamiento",
    descripcion: "Seis correos con fechas fijas alrededor de la apertura: expectativa, venta y cierre.",
    contenido: {
      tipo: "lanzamiento",
      programacion: "fechas",
      pasos: [
        { finalidad: "attract", plazo_cantidad: null, plazo_unidad: null, proposito: "Falta una semana: esto es lo que viene" },
        { finalidad: "nurture", plazo_cantidad: null, plazo_unidad: null, proposito: "Te cuento cómo lo hago yo" },
        { finalidad: "convert", plazo_cantidad: null, plazo_unidad: null, proposito: "Ya puedes apuntarte" },
        { finalidad: "position", plazo_cantidad: null, plazo_unidad: null, proposito: "Las dudas que más me preguntáis" },
        { finalidad: "convert", plazo_cantidad: null, plazo_unidad: null, proposito: "Últimas horas" },
        { finalidad: "nurture", plazo_cantidad: null, plazo_unidad: null, proposito: "Gracias (y qué viene ahora)" },
      ],
    },
  },
  {
    clave: "secuencia_poscompra",
    nombre: "Poscompra",
    descripcion: "Cuatro correos con plazos relativos: de la primera lección a la sesión individual.",
    contenido: {
      tipo: "poscompra",
      programacion: "relativa",
      pasos: [
        { finalidad: "nurture", plazo_cantidad: 0, plazo_unidad: "horas", proposito: "Ya estás dentro: por dónde empezar" },
        { finalidad: "nurture", plazo_cantidad: 3, plazo_unidad: "dias", proposito: "¿Has hecho ya la primera lección?" },
        { finalidad: "position", plazo_cantidad: 4, plazo_unidad: "dias", proposito: "El error más habitual de la primera semana" },
        { finalidad: "convert", plazo_cantidad: 14, plazo_unidad: "dias", proposito: "Si quieres que lo miremos juntas" },
      ],
    },
  },
  {
    clave: "secuencia_upsell",
    nombre: "Upsell",
    descripcion: "Tres correos con plazos relativos para ofrecer el servicio cuando el producto ya está usado.",
    contenido: {
      tipo: "upsell",
      programacion: "relativa",
      pasos: [
        { finalidad: "nurture", plazo_cantidad: 7, plazo_unidad: "dias", proposito: "Cómo va lo que empezaste" },
        { finalidad: "position", plazo_cantidad: 14, plazo_unidad: "dias", proposito: "El salto que suele costar" },
        { finalidad: "convert", plazo_cantidad: 21, plazo_unidad: "dias", proposito: "Si quieres que lo miremos juntas" },
      ],
    },
  },
];

/** Las dos plantillas de stories de partida. */
export const PLANTILLAS_STORIES: PlantillaStories[] = [
  {
    clave: "stories_pregunta_encuesta_respuesta",
    nombre: "Pregunta, encuesta y respuesta",
    descripcion: "Tres tarjetas: plantear la pregunta, preguntar y responder.",
    contenido: {
      tarjetas: [
        {
          titulo: "Plantear la pregunta",
          que_digo: "Esta semana me habéis preguntado mucho por esto",
          texto_pantalla: "¿Te pasa?",
          interaccion: "ninguna",
          interaccion_detalle: "",
        },
        {
          titulo: "Encuesta",
          que_digo: "Antes de contestar, quiero saber dónde estáis vosotras",
          texto_pantalla: "¿Qué te pasa a ti?",
          interaccion: "encuesta",
          interaccion_detalle: "Sí / No / A veces",
        },
        {
          titulo: "Responder e invitar a escribir",
          que_digo: "Si dudas, escríbeme y te lo digo",
          texto_pantalla: "Escríbeme y te digo",
          interaccion: "cta",
          interaccion_detalle: "Escríbeme por privado",
        },
      ],
    },
  },
  {
    clave: "stories_antes_despues",
    nombre: "Antes y después de una clienta",
    descripcion: "Cuatro tarjetas: la situación de partida, qué hicimos, el resultado y la llamada.",
    contenido: {
      tarjetas: [
        {
          titulo: "La situación de partida",
          que_digo: "Esto era su lunes antes de empezar",
          texto_pantalla: "Antes",
          interaccion: "ninguna",
          interaccion_detalle: "",
        },
        {
          titulo: "Qué hicimos",
          que_digo: "Empezamos por la semana real, no por la ideal",
          texto_pantalla: "Lo que hicimos",
          interaccion: "ninguna",
          interaccion_detalle: "",
        },
        {
          titulo: "El resultado",
          que_digo: "Ahora el viernes lo tiene cerrado",
          texto_pantalla: "Después",
          interaccion: "ninguna",
          interaccion_detalle: "",
        },
        {
          titulo: "La llamada",
          que_digo: "Si te suena, escríbeme",
          texto_pantalla: "Escríbeme",
          interaccion: "cta",
          interaccion_detalle: "Escríbeme por privado",
        },
      ],
    },
  },
];

/** Siembra las plantillas de correo y de stories que falten; se puede llamar en cada visita. */
export async function sembrarPlantillasDePartida(supabase: Cliente): Promise<void> {
  const { data: existentes } = await supabase.from("plantillas").select("clave").not("clave", "is", null);
  const claves = new Set((existentes ?? []).map((p) => p.clave as string));

  const faltantesSecuencia = PLANTILLAS_SECUENCIA_EMAIL.filter((p) => !claves.has(p.clave));
  if (faltantesSecuencia.length > 0) {
    await supabase.from("plantillas").insert(
      faltantesSecuencia.map((p) => ({
        tipo: "secuencia_email",
        clave: p.clave,
        nombre: p.nombre,
        descripcion: p.descripcion,
        contenido: p.contenido,
      })),
    );
  }

  const faltantesStories = PLANTILLAS_STORIES.filter((p) => !claves.has(p.clave));
  if (faltantesStories.length > 0) {
    await supabase.from("plantillas").insert(
      faltantesStories.map((p) => ({
        tipo: "stories",
        clave: p.clave,
        nombre: p.nombre,
        descripcion: p.descripcion,
        contenido: p.contenido,
      })),
    );
  }
}

/** Comprueba que el contenido de una plantilla de correo tiene la forma esperada. */
export function esPlantillaSecuenciaValida(contenido: unknown): boolean {
  return esquemaPlantillaSecuencia.safeParse(contenido).success;
}
