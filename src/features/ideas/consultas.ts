import { sanearBusqueda } from "@/shared/lib/texto";
import { ESTADOS_IDEA, TIPOS_IDEA } from "./esquemas";

export { sanearBusqueda };

/** Tipo de searchParams de Next, ya resuelto. */
export type Parametros = Record<string, string | string[] | undefined>;

/** Campos de una idea que necesitan la bandeja, el tablero y la ficha. */
export const CAMPOS_IDEAS =
  "id,texto,tipo,estado,pilar_id,oferta_id,lanzamiento_id,tema,problema_audiencia,palabras_originales,procedencia,veces_aparecida,relevancia,demanda,minutos_preparacion,notas,created_at";

export const ORDENES_BANDEJA = ["recientes", "prioridad", "tiempo"] as const;
export type OrdenBandeja = (typeof ORDENES_BANDEJA)[number];

/** Tiempo máximo de preparación: minutos concretos o «más de 60». */
export const TIEMPOS_FILTRO = ["15", "30", "60", "mas"] as const;

export type FiltrosBandeja = {
  q: string;
  tipo: string; // vacío = idea + idea_email
  estado: string; // vacío = sin archivar
  pilar: string;
  oferta: string;
  lanzamiento: string;
  relevancia: string; // vacío | 1 | 2 | 3
  minutos: string; // vacío | 15 | 30 | 60 | mas
  orden: OrdenBandeja;
};

function valor(p: Parametros, clave: string): string {
  const v = p[clave];
  return typeof v === "string" ? v : "";
}

function incluido(lista: readonly string[], v: string): boolean {
  return lista.includes(v);
}

/** Lee y valida los parámetros de la bandeja; lo no válido vuelve a su valor por defecto. */
export function leerFiltros(p: Parametros): FiltrosBandeja {
  const tipo = valor(p, "tipo");
  const estado = valor(p, "estado");
  const relevancia = valor(p, "relevancia");
  const minutos = valor(p, "minutos");
  const orden = valor(p, "orden");
  return {
    q: valor(p, "q"),
    tipo: incluido(TIPOS_IDEA, tipo) ? tipo : "",
    estado: incluido(ESTADOS_IDEA, estado) ? estado : "",
    pilar: valor(p, "pilar"),
    oferta: valor(p, "oferta"),
    lanzamiento: valor(p, "lanzamiento"),
    relevancia: incluido(["1", "2", "3"], relevancia) ? relevancia : "",
    minutos: incluido(TIEMPOS_FILTRO, minutos) ? minutos : "",
    orden: incluido(ORDENES_BANDEJA, orden) ? (orden as OrdenBandeja) : "recientes",
  };
}

export function hayFiltrosActivos(f: FiltrosBandeja): boolean {
  return Boolean(f.q || f.tipo || f.estado || f.pilar || f.oferta || f.lanzamiento || f.relevancia || f.minutos);
}

type ConPrioridad = {
  relevancia: number | null;
  demanda: number | null;
  minutos_preparacion: number | null;
};

function minutosDe(x: ConPrioridad): number {
  return x.minutos_preparacion ?? Number.MAX_SAFE_INTEGER;
}

/** Prioridad: relevancia y demanda altas primero; a igualdad, menos tiempo de preparación. */
export function compararPrioridad(a: ConPrioridad, b: ConPrioridad): number {
  const sa = (a.relevancia ?? 0) + (a.demanda ?? 0);
  const sb = (b.relevancia ?? 0) + (b.demanda ?? 0);
  if (sb !== sa) return sb - sa;
  return minutosDe(a) - minutosDe(b);
}

/** Tiempo de preparación: de menor a mayor; sin tiempo estimado al final. */
export function compararTiempo(a: ConPrioridad & { created_at: string }, b: ConPrioridad & { created_at: string }): number {
  const d = minutosDe(a) - minutosDe(b);
  if (d !== 0) return d;
  if (a.created_at === b.created_at) return 0;
  return a.created_at < b.created_at ? 1 : -1;
}
