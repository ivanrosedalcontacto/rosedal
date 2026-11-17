import type { TipoCaptura } from "./tipos";

export type CapturaEnCola = { tipo: TipoCaptura; texto: string; cuando: string };

const CLAVE = "rosedal-capturas-pendientes";

/** Capturas guardadas en el dispositivo a falta de conexión (A2). */
export function leerCola(): CapturaEnCola[] {
  try {
    const bruto = localStorage.getItem(CLAVE);
    if (!bruto) return [];
    const json: unknown = JSON.parse(bruto);
    if (!Array.isArray(json)) return [];
    return json as CapturaEnCola[];
  } catch {
    return [];
  }
}

export function encolar(tipo: TipoCaptura, texto: string): void {
  try {
    const cola = leerCola().filter((c) => c.texto !== texto);
    cola.push({ tipo, texto, cuando: new Date().toISOString() });
    localStorage.setItem(CLAVE, JSON.stringify(cola));
  } catch {
    // Sin almacenamiento local no se puede encolar: el texto sigue en pantalla.
  }
}

export function quitarDeLaCola(texto: string): void {
  try {
    const cola = leerCola().filter((c) => c.texto !== texto);
    localStorage.setItem(CLAVE, JSON.stringify(cola));
  } catch {
    // Nada que hacer.
  }
}

export function hayPendientes(): boolean {
  return leerCola().length > 0;
}
