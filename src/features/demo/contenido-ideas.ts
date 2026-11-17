/** Recursos de marca, frases e ideas del ejemplo (docs/04-datos-demo.md). */

export const RECURSOS_DEMO = [
  {
    tipo: "tono",
    titulo: "Cómo escribo",
    texto:
      "Escribo como hablo: frases cortas, ejemplos de mi día y ninguna promesa exagerada. Cuando algo no cabe en una frase, lo digo en dos.",
  },
  { tipo: "tono", titulo: "Palabras que no uso", texto: "Palabras que no uso: productividad extrema, hackear, sin excusas" },
  { tipo: "cta", titulo: "Reservar sesión", texto: "Escríbeme SESIÓN por privado" },
  { tipo: "cta", titulo: "Comprar el curso", texto: "Compra en este enlace" },
  { tipo: "cta", titulo: "Guardar para el domingo", texto: "Guárdalo para el domingo" },
  { tipo: "cta", titulo: "Responder", texto: "Respóndeme a este correo y cuéntame" },
  {
    tipo: "testimonio",
    titulo: "Lucía, diseñadora",
    texto: "Con el curso dejé de planificar los lunes por la mañana. Ahora mi semana la monto el domingo con la cabeza más despejada.",
    autor: "Lucía, diseñadora",
    autorizado: true,
  },
  {
    tipo: "testimonio",
    titulo: "Irene",
    texto: "La sesión me sirvió para ordenar el mes con equipo y dos negocios. Salí con tres cambios y los estoy haciendo.",
    autor: "Irene",
    autorizado: false,
  },
  { tipo: "plano", titulo: "Plano 1", texto: "Mis manos abriendo la agenda" },
  { tipo: "plano", titulo: "Plano 2", texto: "Plano cenital de la mesa con la hoja semanal" },
  { tipo: "plano", titulo: "Plano 3", texto: "Yo de espaldas mirando por la ventana con el café" },
  {
    tipo: "enlace_venta",
    titulo: "Curso Semana en Calma",
    texto: "Enlace de venta del curso",
    url: "https://ejemplo.com/semana-en-calma",
  },
] as const;

/** Las ocho frases del ejemplo; los saltos de línea son parte del dato. */
export const FRASES_DEMO = [
  { texto: "No necesitas más horas.\nNecesitas menos frentes abiertos.", favorita: true },
  { texto: "Tu lista de tareas no es un plan.\n\nEs un inventario de culpa.", favorita: false },
  { texto: "Planificar no es llenar la semana.\nEs decidir qué se queda fuera.", favorita: false },
  { texto: "El lunes no empieza el lunes.\nEmpieza el viernes, cuando cierras bien.", favorita: false },
  { texto: "Descansar también va en la agenda.", favorita: true },
  { texto: "Si todo es urgente,\nnada lo es.", favorita: false },
  { texto: "Tu semana ideal cabe en una hoja.\nLa real también.", favorita: false },
  { texto: "Tu semana ideal cabe en una hoja.", favorita: false },
] as const;

export type IdeaDemo = {
  texto: string;
  tipo?: "idea" | "idea_email" | "pregunta" | "objecion";
  minutos?: number;
  relevancia?: number;
  demanda?: number;
  tema?: string;
  problema?: string;
  procedencia?: string;
  palabras?: string;
  veces?: number;
  sinClasificar?: boolean;
  linkedLanzamiento?: boolean;
  oferta?: "curso" | "asesoria";
};

export const IDEAS_DEMO: IdeaDemo[] = [
  {
    texto: "Enseñar mi hoja semanal en blanco y cómo la relleno",
    minutos: 20,
    relevancia: 3,
    demanda: 2,
    tema: "Lunes",
    linkedLanzamiento: true,
  },
  { texto: "Cinco ideas para el viernes sin reunión", minutos: 25, relevancia: 2, linkedLanzamiento: true, tema: "Clientes" },
  { texto: "Qué hago cuando una clienta cancela a última hora", minutos: 30, relevancia: 3, linkedLanzamiento: true },
  {
    texto: "Ideas para el lanzamiento que puedo preparar en una tarde entera",
    minutos: 90,
    relevancia: 2,
    linkedLanzamiento: true,
    tema: "Descanso",
  },
  { texto: "El orden en el que recojo la mesa por la mañana", sinClasificar: true, tema: "Lunes" },
  { texto: "Contar lo de la clienta que canceló el lunes y no pasó nada", tipo: "idea_email", sinClasificar: true },
  { texto: "Una revisión de veinte minutos que me cabe en el café", sinClasificar: true, problema: "No llego a todo" },
  { texto: "Lo que hago cuando todo es urgente", sinClasificar: true, tema: "Clientes", problema: "Urgencias de clientes" },
  {
    texto: "No tengo tiempo ni para organizarme",
    tipo: "objecion",
    palabras: "No tengo tiempo ni para organizarme",
    procedencia: "comentarios",
    veces: 6,
    oferta: "curso",
    tema: "Lunes",
    problema: "No llego a todo",
  },
  {
    texto: "Es que mi trabajo es imprevisible",
    tipo: "objecion",
    palabras: "Es que mi trabajo es imprevisible",
    procedencia: "llamada con clienta",
    veces: 3,
    oferta: "curso",
    tema: "Clientes",
    problema: "Urgencias de clientes",
  },
];
