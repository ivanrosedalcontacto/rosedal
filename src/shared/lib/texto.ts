/** Utilidades de texto compartidas por las búsquedas de la app. */

/**
 * Quita los caracteres que rompen una búsqueda en `.or(...)` de PostgREST
 * (`, ( ) % * \ "`): la comilla doble y la barra, los delimitadores y los comodines.
 */
export function sanearBusqueda(texto: string): string {
  return texto.replace(/[\\,()%*"]/g, "").trim();
}
