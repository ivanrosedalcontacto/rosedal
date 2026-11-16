import { z } from "zod";

export const COLORES_PILAR = ["verde", "menta", "oliva", "rosa", "frambuesa", "melocoton", "salvia", "malva"] as const;

/** Tonos pastel de la paleta; se muestran como un punto junto al nombre. */
export const HEX_PILAR: Record<(typeof COLORES_PILAR)[number], string> = {
  verde: "#A9CBB0",
  menta: "#8FCDB8",
  oliva: "#C5CF9E",
  rosa: "#EDB1BF",
  frambuesa: "#D98BA3",
  melocoton: "#F4C6A8",
  salvia: "#BFD3C1",
  malva: "#D6B8D2",
};

export const esquemaPilar = z.object({
  nombre: z.string().trim().min(1, "Ponle un nombre al pilar.").max(80),
  descripcion: z.string().trim().max(500).default(""),
  color: z.enum(COLORES_PILAR).default("verde"),
});

export const esquemaMarca = z.object({
  nombre_marca: z.string().trim().min(1, "Escribe el nombre de tu marca.").max(80),
  audiencia_general: z.string().trim().max(1000).default(""),
  tono_general: z.string().trim().max(1000).default(""),
});

export type Pilar = {
  id: string;
  nombre: string;
  descripcion: string;
  color: (typeof COLORES_PILAR)[number];
  orden: number;
  archivado: boolean;
};
