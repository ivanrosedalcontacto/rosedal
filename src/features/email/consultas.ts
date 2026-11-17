import { sanearBusqueda } from "@/shared/lib/texto";

export { sanearBusqueda };

export type Parametros = Record<string, string | string[] | undefined>;

export function valor(p: Parametros, clave: string): string {
  return typeof p[clave] === "string" ? p[clave] : "";
}

/** Quita caracteres que rompen `.or(...)` o los comodines de Postgres. */
export type FiltrosEmail = {
  tematica: string;
  audiencia: string;
  pilar: string;
  finalidad: string;
  oferta: string;
  lanzamiento: string;
};

export function leerFiltrosEmail(sp: Parametros): FiltrosEmail {
  return {
    tematica: valor(sp, "tematica"),
    audiencia: valor(sp, "audiencia"),
    pilar: valor(sp, "pilar"),
    finalidad: valor(sp, "finalidad"),
    oferta: valor(sp, "oferta"),
    lanzamiento: valor(sp, "lanzamiento"),
  };
}
