import { esFecha, lunesDe, sumarDias } from "@/shared/lib/fechas";
import { sanearBusqueda } from "@/shared/lib/texto";
import {
  CANALES_FILTRO,
  ESTADOS_FILTRO,
  FINALIDADES_FILTRO,
  FORMATOS_FILTRO,
  type FiltrosCalendario,
} from "./esquemas";

export type Parametros = Record<string, string | string[] | undefined>;

export function valor(p: Parametros, clave: string): string {
  return typeof p[clave] === "string" ? p[clave] : "";
}

/** Lee los filtros del calendario; lo que no es válido vuelve a su valor por defecto. */
export function leerFiltrosCalendario(sp: Parametros): FiltrosCalendario {
  const canal = valor(sp, "canal");
  const formato = valor(sp, "formato");
  const finalidad = valor(sp, "finalidad");
  const estado = valor(sp, "estado");
  return {
    canal: (CANALES_FILTRO as readonly string[]).includes(canal) ? canal : "",
    formato: (FORMATOS_FILTRO as readonly string[]).includes(formato) ? formato : "",
    pilar: valor(sp, "pilar"),
    finalidad: (FINALIDADES_FILTRO as readonly string[]).includes(finalidad) ? finalidad : "",
    oferta: valor(sp, "oferta"),
    lanzamiento: valor(sp, "lanzamiento"),
    estado: (ESTADOS_FILTRO as readonly string[]).includes(estado) ? estado : "",
    q: sanearBusqueda(valor(sp, "q")),
  };
}

/** La fecha que se está mirando: la de la URL si es válida, si no la de hoy. */
export function leerFechaAncla(sp: Parametros, hoy: string): string {
  const fecha = valor(sp, "fecha");
  return esFecha(fecha) ? fecha : hoy;
}

/** Los siete días de la semana que contiene la fecha dada, empezando en lunes. */
export function diasDeSemana(ancla: string): string[] {
  const lunes = lunesDe(ancla);
  return Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));
}

/** Los días del mes de la fecha dada. */
export function diasDelMes(ancla: string): string[] {
  const [a, m] = ancla.split("-");
  const ultimo = new Date(Date.UTC(Number(a), Number(m), 0)).getUTCDate();
  return Array.from({ length: ultimo }, (_, i) => `${a}-${m}-${String(i + 1).padStart(2, "0")}`);
}

/** La rejilla del mes: de lunes a domingo, con los días del mes vecino que la completan. */
export function diasDeMes(ancla: string): string[] {
  const primero = `${ancla.slice(0, 8)}01`;
  const ultimo = diasDelMes(ancla).at(-1) ?? primero;
  const inicio = lunesDe(primero);
  const fin = sumarDias(lunesDe(ultimo), 6);
  const total = Math.round((Date.parse(`${fin}T00:00:00Z`) - Date.parse(`${inicio}T00:00:00Z`)) / 86_400_000) + 1;
  return Array.from({ length: total }, (_, i) => sumarDias(inicio, i));
}

/** Título del periodo: «16-22 de noviembre» o «30 de noviembre - 6 de diciembre». */
export function tituloSemana(inicio: string, fin: string): string {
  const dia = new Intl.DateTimeFormat("es-ES", { day: "numeric", timeZone: "UTC" });
  const mes = new Intl.DateTimeFormat("es-ES", { month: "long", timeZone: "UTC" });
  const mesInicio = mes.format(new Date(`${inicio}T00:00:00Z`));
  const mesFin = mes.format(new Date(`${fin}T00:00:00Z`));
  if (mesInicio === mesFin) return `${dia.format(new Date(`${inicio}T00:00:00Z`))}-${dia.format(new Date(`${fin}T00:00:00Z`))} de ${mesInicio}`;
  return `${dia.format(new Date(`${inicio}T00:00:00Z`))} de ${mesInicio} - ${dia.format(new Date(`${fin}T00:00:00Z`))} de ${mesFin}`;
}

/** Título del mes: «noviembre de 2026». */
export function tituloMes(ancla: string): string {
  const texto = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${ancla}T00:00:00Z`),
  );
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export { sanearBusqueda };
