import type { Finalidad } from "@/features/piezas/esquemas";

export type PasoSecuencia = {
  finalidad: Finalidad | null;
  plazo_cantidad: number | null;
  plazo_unidad: "horas" | "dias" | null;
  proposito: string;
};

export type TarjetaStories = {
  titulo: string;
  que_digo: string;
  texto_pantalla: string;
  interaccion: "ninguna" | "encuesta" | "pregunta" | "enlace" | "cta";
  interaccion_detalle: string;
};

/** Cómo se lee un plazo en una plantilla de correo. */
export function textoPlazo(paso: PasoSecuencia): string {
  if (paso.plazo_cantidad === null || paso.plazo_unidad === null) return "Fecha fija";
  if (paso.plazo_cantidad === 0) return "Inmediatamente";
  return `${paso.plazo_cantidad} ${paso.plazo_unidad === "horas" ? "horas" : "días"} después`;
}
