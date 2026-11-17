import { z } from "zod";

export const esquemaFrase = z.object({
  texto: z.string().max(5000, "La frase es demasiado larga.").refine((v) => v.trim().length > 0, "Escribe una frase antes de guardar."),
  notas: z.string().max(3000).default(""),
});

export const esquemaUso = z.object({
  fecha: z.string().date("Elige una fecha."),
  url: z.string().trim().max(2000).transform((v) => (v === "" ? null : v)),
});

export const esquemaReelPrueba = z.object({
  texto_en_pantalla: z.string().max(5000).refine((v) => v.trim().length > 0, "Escribe el texto en pantalla."),
  plano: z.string().trim().max(2000).transform((v) => (v === "" ? null : v)),
  fecha_prevista: z.string().transform((v) => (v === "" ? null : v)).pipe(z.string().date().nullable()),
});

export type Frase = {
  id: string;
  texto: string;
  favorita: boolean;
  frase_origen_id: string | null;
  notas: string;
  archivada: boolean;
  created_at: string;
};

export type UsoFrase = { id: string; frase_id: string; pieza_id: string | null; fecha: string; url: string | null; texto_usado: string };
export type FraseVista = Frase & { usos: UsoFrase[]; reelsPrevistos: { id: string; fecha_prevista: string | null }[]; variantes: number; origenTexto: string | null };
