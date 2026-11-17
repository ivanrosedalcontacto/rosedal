/** Fechas sin hora, siempre como AAAA-MM-DD para no desplazar el día. */

export function hoyMadrid(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function aNumero(fecha: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return null;
  const [a, m, d] = fecha.split("-").map(Number);
  const ms = Date.UTC(a!, (m ?? 1) - 1, d ?? 1);
  const prueba = new Date(ms);
  if (prueba.getUTCFullYear() !== a || prueba.getUTCMonth() !== (m ?? 1) - 1 || prueba.getUTCDate() !== d) return null;
  return ms;
}

export function sumarDias(fecha: string, dias: number): string {
  const ms = aNumero(fecha);
  if (ms == null) return fecha;
  return new Date(ms + dias * 86_400_000).toISOString().slice(0, 10);
}

/** La semana empieza en lunes, como en el resto de la app. */
export function lunesDe(fecha: string): string {
  const ms = aNumero(fecha);
  if (ms == null) return hoyMadrid();
  const dia = new Date(ms).getUTCDay();
  const retroceso = dia === 0 ? 6 : dia - 1;
  return new Date(ms - retroceso * 86_400_000).toISOString().slice(0, 10);
}

export function formatearFecha(fecha: string): string {
  const ms = aNumero(fecha);
  if (ms == null) return fecha;
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(ms));
}

export function formatearFechaCorta(fecha: string): string {
  const ms = aNumero(fecha);
  if (ms == null) return fecha;
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(ms));
}

export function esFecha(fecha: string): boolean {
  return aNumero(fecha) != null;
}
