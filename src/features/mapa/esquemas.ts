import { FINALIDADES, type Finalidad } from "@/features/piezas/esquemas";

export type PeriodoMapa = {
  desde: string;
  hasta: string;
  etiqueta: string;
};

export const PERIODOS_MAPA = ["30", "90", "anio", "rango"] as const;
export type ClavePeriodo = (typeof PERIODOS_MAPA)[number];

export const ESTADOS_MAPA = ["todas", "publicadas", "planificadas"] as const;
export type ClaveEstado = (typeof ESTADOS_MAPA)[number];

/** La fecha que sitúa a una pieza en el mapa: la real si se publicó, si no la prevista. */
export function fechaDeMapa(pieza: { estado: string; fecha_prevista: string | null; fecha_real: string | null }): string | null {
  if (pieza.estado === "publicado" && pieza.fecha_real) return pieza.fecha_real;
  return pieza.fecha_prevista;
}

/** Las columnas del mapa: las cuatro finalidades y las piezas sin finalidad. */
export const COLUMNAS_MAPA = [...FINALIDADES, "sin"] as const;
export type ColumnaMapa = (typeof COLUMNAS_MAPA)[number];

/** Las filas del mapa: los pilares de la usuaria y las piezas sin pilar. */
export type FilaMapa = { id: string | null; nombre: string; color: string | null };

/** Intersección de color para una celda: más piezas, más fondo (un solo tono). */
export function tonoCelda(cantidad: number, maximo: number): string {
  if (cantidad === 0 || maximo === 0) return "transparent";
  const proporcion = Math.min(1, cantidad / maximo);
  const alfa = 0.18 + proporcion * 0.55;
  return `rgba(169, 203, 176, ${alfa.toFixed(2)})`;
}

export function columnaDe(finalidad: string | null): ColumnaMapa {
  return (FINALIDADES as readonly string[]).includes(finalidad ?? "") ? (finalidad as Finalidad) : "sin";
}
