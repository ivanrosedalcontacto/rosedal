import type { Finalidad } from "@/features/piezas/esquemas";

/** Métricas que se proponen según la finalidad de la pieza. */
export const METRICAS_POR_FINALIDAD: Record<Finalidad, string[]> = {
  attract: ["alcance", "nuevos_seguidores"],
  nurture: ["respuestas", "conversaciones"],
  position: ["consultas_metodo"],
  convert: ["solicitudes", "reservas", "compras", "ingresos"],
};

/** Los correos miden además aperturas y clics. */
export const METRICAS_DE_CORREO = ["aperturas", "clics"];

export const ETIQUETA_METRICA: Record<string, string> = {
  alcance: "Alcance",
  nuevos_seguidores: "Nuevos seguidores",
  respuestas: "Respuestas",
  conversaciones: "Conversaciones",
  consultas_metodo: "Consultas que mencionan mi método",
  solicitudes: "Solicitudes",
  reservas: "Reservas",
  compras: "Compras",
  ingresos: "Ingresos",
  aperturas: "Aperturas",
  clics: "Clics",
};

/** En compras, reservas e ingresos se anota de dónde vino la pieza. */
export const METRICAS_CON_ATRIBUCION = ["reservas", "compras", "ingresos"];

/** Todas las métricas del catálogo, en el orden en que se ofrecen. */
export const CATALOGO_METRICAS = [
  ...METRICAS_POR_FINALIDAD.attract,
  ...METRICAS_POR_FINALIDAD.nurture,
  ...METRICAS_POR_FINALIDAD.position,
  ...METRICAS_POR_FINALIDAD.convert,
  ...METRICAS_DE_CORREO,
];

export const ETIQUETA_ATRIBUCION: Record<string, string> = {
  confirmada: "Confirmada",
  sin_atribuir: "No sé de dónde vino",
};

export type MetricaPieza = {
  id: string;
  pieza_id: string;
  clave: string;
  valor: number | null;
  atribucion: "confirmada" | "sin_atribuir" | null;
};

/** Las métricas que se proponen para una pieza: las de su finalidad y, si es un correo, las suyas. */
export function metricasPropuestas(finalidad: Finalidad | null, esCorreo: boolean): string[] {
  const propias = finalidad ? METRICAS_POR_FINALIDAD[finalidad] : [];
  return [...propias, ...(esCorreo ? METRICAS_DE_CORREO : [])];
}
