import { z } from "zod";

/** Enlace opcional: vacío se guarda como null; si hay texto, debe ser una URL válida. */
const urlOpcional = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .pipe(z.string().url("El enlace no parece válido (empieza por https://).").nullable());

export const esquemaOferta = z.object({
  nombre: z.string().trim().min(1, "Ponle un nombre a la oferta.").max(120),
  tipo: z.enum(["producto", "servicio"]),
  publico: z.string().trim().max(2000).default(""),
  problema: z.string().trim().max(2000).default(""),
  propuesta_valor: z.string().trim().max(2000).default(""),
  via_compra: z.string().trim().max(500).default(""),
  via_compra_url: urlOpcional,
  precio: z
    .string()
    .trim()
    .max(60)
    .transform((v) => (v === "" ? null : v)),
});

export const esquemaObjecion = z.object({
  objecion: z.string().trim().min(1, "Escribe la objeción.").max(1000),
  respuesta: z
    .string()
    .trim()
    .max(2000)
    .transform((v) => (v === "" ? null : v)),
});

export type Oferta = {
  id: string;
  nombre: string;
  tipo: "producto" | "servicio";
  publico: string;
  problema: string;
  propuesta_valor: string;
  via_compra: string;
  via_compra_url: string | null;
  precio: string | null;
  archivada: boolean;
};

export type Objecion = { id: string; objecion: string; respuesta: string | null; orden: number };
