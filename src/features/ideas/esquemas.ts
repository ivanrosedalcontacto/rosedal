import { z } from "zod";

export const TIPOS_IDEA = ["idea", "idea_email", "pregunta", "objecion"] as const;
export type TipoIdea = (typeof TIPOS_IDEA)[number];
export const ETIQUETA_TIPO: Record<TipoIdea, string> = {
  idea: "Idea",
  idea_email: "Idea de email",
  pregunta: "Pregunta",
  objecion: "Objeción",
};

export const ESTADOS_IDEA = ["pendiente", "en_desarrollo", "archivada"] as const;
export type EstadoIdea = (typeof ESTADOS_IDEA)[number];
export const ETIQUETA_ESTADO: Record<EstadoIdea, string> = {
  pendiente: "Pendiente",
  en_desarrollo: "En desarrollo",
  archivada: "Archivada",
};

export const TIPOS_ANGULO = [
  "tutorial",
  "historia_personal",
  "error_frecuente",
  "demostracion",
  "caso_real",
  "objecion_compra",
  "otro",
] as const;
export type TipoAngulo = (typeof TIPOS_ANGULO)[number];
export const ETIQUETA_ANGULO: Record<TipoAngulo, string> = {
  tutorial: "Tutorial",
  historia_personal: "Historia personal",
  error_frecuente: "Error frecuente",
  demostracion: "Demostración",
  caso_real: "Caso real",
  objecion_compra: "Objeción de compra",
  otro: "Otro",
};

export const NIVELES = { 1: "Baja", 2: "Media", 3: "Alta" } as const;
export const ATAJOS_MINUTOS = [15, 30, 60, 120] as const;

export const DIMENSIONES = ["tema", "pilar", "oferta", "problema"] as const;
export type Dimension = (typeof DIMENSIONES)[number];
export const ETIQUETA_DIMENSION: Record<Dimension, string> = {
  tema: "Tema",
  pilar: "Pilar",
  oferta: "Oferta",
  problema: "Problema de la audiencia",
};

const textoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v));
const uuidOpcional = z
  .string()
  .transform((v) => (v === "" ? null : v))
  .pipe(z.string().uuid().nullable());
const nivelOpcional = z
  .string()
  .transform((v) => (v === "" ? null : Number(v)))
  .pipe(z.number().int().min(1).max(3).nullable());
const minutosOpcional = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : Number(v)))
  .pipe(z.number().int().min(0, "El tiempo no puede ser negativo.").max(10000).nullable());

export const esquemaIdea = z.object({
  texto: z.string().max(5000).refine((v) => v.trim().length > 0, "La idea no puede quedar vacía."),
  tipo: z.enum(TIPOS_IDEA),
  estado: z.enum(ESTADOS_IDEA),
  pilar_id: uuidOpcional,
  oferta_id: uuidOpcional,
  tema: textoOpcional(120),
  problema_audiencia: textoOpcional(300),
  procedencia: textoOpcional(200),
  relevancia: nivelOpcional,
  demanda: nivelOpcional,
  minutos_preparacion: minutosOpcional,
  notas: z.string().max(5000).default(""),
});

export const esquemaPregunta = z.object({
  tipo: z.enum(["pregunta", "objecion"]),
  palabras: z.string().max(3000).refine((v) => v.trim().length > 0, "Escribe las palabras tal como te las dijeron."),
  procedencia: textoOpcional(200),
  oferta_id: uuidOpcional,
});

export type Idea = {
  id: string;
  texto: string;
  tipo: TipoIdea;
  estado: EstadoIdea;
  pilar_id: string | null;
  oferta_id: string | null;
  lanzamiento_id: string | null;
  tema: string | null;
  problema_audiencia: string | null;
  palabras_originales: string | null;
  procedencia: string | null;
  veces_aparecida: number;
  relevancia: number | null;
  demanda: number | null;
  minutos_preparacion: number | null;
  notas: string;
  created_at: string;
};

export type Opcion = { id: string; nombre: string };
