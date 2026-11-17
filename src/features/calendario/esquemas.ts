import { CANALES_PIEZA, ESTADOS_PIEZA, FINALIDADES, FORMATOS_PIEZA } from "@/features/piezas/esquemas";

/** Una pieza tal y como se ve en el calendario. */
export type EntradaPieza = {
  id: string;
  titulo: string;
  formato: string;
  canal: string;
  estado: string;
  finalidad: string | null;
  pilar_id: string | null;
  oferta_id: string | null;
  lanzamiento_id: string | null;
  fecha_prevista: string | null;
  fecha_real: string | null;
  url_publicada: string | null;
  /** Las stories son una sola entrada, aunque tengan varias tarjetas. */
  tarjetas: number;
};

/** Un hito de lanzamiento, con aspecto distinto al de las piezas. */
export type HitoCalendario = {
  id: string;
  titulo: string;
  fecha: string;
  hecho: boolean;
  lanzamiento_id: string;
  fase_id: string | null;
};

/** Las fases del lanzamiento activo, como banda de color sobre los días. */
export type BandaFase = {
  id: string;
  nombre: string;
  tipo: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  lanzamiento_id: string;
};

export type FiltrosCalendario = {
  canal: string;
  formato: string;
  pilar: string;
  finalidad: string;
  oferta: string;
  lanzamiento: string;
  estado: string;
  q: string;
};

export const CANALES_FILTRO = CANALES_PIEZA;
export const FORMATOS_FILTRO = FORMATOS_PIEZA;
export const FINALIDADES_FILTRO = FINALIDADES;
export const ESTADOS_FILTRO = ESTADOS_PIEZA;

/** Color de cada tipo de fase, para la banda sobre los días. */
export const TONO_FASE: Record<string, string> = {
  expectacion: "bg-verde-200",
  apertura: "bg-verde-300",
  venta: "bg-menta-100",
  cierre: "bg-rosa-200",
  seguimiento: "bg-borde",
};

/** La fecha en la que se coloca una pieza: la real si está publicada, si no la prevista. */
export function fechaDeEntrada(pieza: Pick<EntradaPieza, "estado" | "fecha_prevista" | "fecha_real">): string | null {
  if (pieza.estado === "publicado" && pieza.fecha_real) return pieza.fecha_real;
  return pieza.fecha_prevista;
}

/** Si la pieza publicada se apartó de la fecha prevista, se avisa. */
export function notaPrevista(pieza: Pick<EntradaPieza, "estado" | "fecha_prevista" | "fecha_real">): string | null {
  if (pieza.estado !== "publicado") return null;
  if (!pieza.fecha_prevista || !pieza.fecha_real || pieza.fecha_prevista === pieza.fecha_real) return null;
  return pieza.fecha_prevista;
}
