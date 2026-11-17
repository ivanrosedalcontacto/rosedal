import type { Oferta } from "@/features/ofertas/esquemas";
import type { Pilar } from "@/features/ajustes/esquemas";

type Datos = {
  titulo: string;
  formato: string;
  canal: string;
  finalidad: string | null;
  pilar?: Pilar | null;
  oferta?: Oferta | null;
  ganchoActual?: string;
  desarrollo?: string;
  asuntoActual?: string;
  audienciaGeneral?: string;
  tonoGeneral?: string;
  ejemplosTono?: string[];
};

/** Prompt para pedir ganchos alternativos (B6). */
export function promptGanchos(datos: Datos): string {
  return [
    `Escríbeme 5 ganchos alternativos para esta pieza.`,
    ``,
    `Pieza: ${datos.titulo}`,
    `Formato: ${datos.formato} · Canal: ${datos.canal}${datos.finalidad ? ` · Finalidad: ${datos.finalidad}` : ""}`,
    datos.pilar ? `Pilar: ${datos.pilar.nombre}` : "",
    datos.oferta ? `Oferta: ${datos.oferta.nombre} — ${datos.oferta.propuesta_valor}` : "",
    ``,
    `Gancho actual: ${datos.ganchoActual ?? "(no hay)"}`,
    datos.desarrollo ? `Desarrollo: ${datos.desarrollo}` : "",
    ``,
    datos.audienciaGeneral ? `Mi audiencia: ${datos.audienciaGeneral}` : "",
    datos.tonoGeneral ? `Mi tono: ${datos.tonoGeneral}` : "",
    datos.ejemplosTono?.length ? `Ejemplos de cómo escribo:\n${datos.ejemplosTono.map((t) => `- ${t}`).join("\n")}` : "",
    ``,
    `Un gancho por línea, sin numeración y sin comillas.`,
  ]
    .filter((l) => l !== "")
    .join("\n");
}

/** Prompt para pedir asuntos alternativos (B6). */
export function promptAsuntos(datos: Datos): string {
  return [
    `Escríbeme 5 asuntos alternativos para este correo.`,
    ``,
    `Pieza: ${datos.titulo}`,
    `Asunto actual: ${datos.asuntoActual ?? "(no hay)"}`,
    datos.oferta ? `Oferta: ${datos.oferta.nombre}` : "",
    ``,
    datos.audienciaGeneral ? `Mi audiencia: ${datos.audienciaGeneral}` : "",
    datos.tonoGeneral ? `Mi tono: ${datos.tonoGeneral}` : "",
    ``,
    `Un asunto por línea, sin numeración y sin comillas.`,
  ]
    .filter((l) => l !== "")
    .join("\n");
}

/** Prompt para adaptar una pieza a otro formato (B6). */
export function promptAdaptar(datos: Datos, formatoDestino: string): string {
  return [
    `Adapta esta pieza a ${formatoDestino}.`,
    ``,
    `Pieza de partida: ${datos.titulo} (${datos.formato})`,
    datos.finalidad ? `Finalidad actual: ${datos.finalidad}` : "",
    datos.oferta ? `Oferta: ${datos.oferta.nombre} — ${datos.oferta.propuesta_valor}` : "",
    datos.ganchoActual ? `Gancho: ${datos.ganchoActual}` : "",
    datos.desarrollo ? `Desarrollo: ${datos.desarrollo}` : "",
    ``,
    `Dame el texto listo para ${formatoDestino}:`,
  ]
    .filter((l) => l !== "")
    .join("\n");
}
