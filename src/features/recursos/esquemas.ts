import { z } from "zod";

export const TIPOS_RECURSO = ["tono", "cta", "testimonio", "plano", "enlace_venta"] as const;
export type TipoRecurso = (typeof TIPOS_RECURSO)[number];

export const INFO_TIPO: Record<TipoRecurso, { plural: string; singular: string; ayuda: string }> = {
  tono: { plural: "Tono", singular: "ejemplo de tono", ayuda: "Ejemplos de cómo escribes y palabras que usas o evitas." },
  cta: { plural: "CTA habituales", singular: "CTA", ayuda: "Llamadas a la acción listas para reutilizar." },
  testimonio: { plural: "Testimonios", singular: "testimonio", ayuda: "Solo se usan los que tienes autorizados." },
  plano: { plural: "Planos recurrentes", singular: "plano", ayuda: "Descripciones escritas de planos que repites al grabar." },
  enlace_venta: { plural: "Enlaces de venta", singular: "enlace de venta", ayuda: "Páginas de compra o reserva." },
};

export const esquemaRecurso = z.object({
  tipo: z.enum(TIPOS_RECURSO),
  titulo: z.string().trim().max(120).default(""),
  texto: z.string().max(4000).refine((v) => v.trim().length > 0, "Escribe el texto del recurso."),
  url: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .pipe(z.string().url("El enlace no parece válido (empieza por https://).").nullable()),
  autor: z
    .string()
    .trim()
    .max(120)
    .transform((v) => (v === "" ? null : v)),
  autorizado: z.boolean().default(false),
});

export type Recurso = {
  id: string;
  tipo: TipoRecurso;
  titulo: string;
  texto: string;
  url: string | null;
  autor: string | null;
  autorizado: boolean;
};
