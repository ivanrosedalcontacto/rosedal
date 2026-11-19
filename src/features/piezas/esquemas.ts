import { z } from "zod";

export const FORMATOS_PIEZA = ["reel", "reel_prueba", "carrusel", "post", "stories", "email", "otro"] as const;
export const CANALES_PIEZA = ["instagram", "tiktok", "youtube", "linkedin", "email", "otro"] as const;
export const FINALIDADES = ["attract", "nurture", "position", "convert"] as const;
export const ESTADOS_PIEZA = ["borrador", "grabado", "editado", "publicado"] as const;
/** Estados que se pueden elegir sin pasar por «Publicar» (que congela el contenido). */
export const ESTADOS_SIN_PUBLICAR = ["borrador", "grabado", "editado"] as const;
/** Estados de lo ya grabado: se guardan plegados en «Ya grabadas». */
export const ESTADOS_GRABADOS = ["grabado", "editado", "publicado"] as const;

export type FormatoPieza = (typeof FORMATOS_PIEZA)[number];
export type CanalPieza = (typeof CANALES_PIEZA)[number];
export type Finalidad = (typeof FINALIDADES)[number];
export type EstadoPieza = (typeof ESTADOS_PIEZA)[number];

export const ETIQUETA_FORMATO: Record<FormatoPieza, string> = {
  reel: "Reel",
  reel_prueba: "Reel de prueba",
  carrusel: "Carrusel",
  post: "Publicación",
  stories: "Stories",
  email: "Email",
  otro: "Otro",
};
export const ETIQUETA_CANAL: Record<CanalPieza, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  email: "Email",
  otro: "Otro",
};
export const ETIQUETA_ESTADO: Record<EstadoPieza, string> = {
  borrador: "Borrador",
  grabado: "Grabado",
  editado: "Editado",
  publicado: "Publicado",
};
export const esquemaEstadoPieza = z.enum(ESTADOS_PIEZA);

/** Un correo no se graba: pasa de Borrador a Editado. */
export function estadosDeFormato(formato: FormatoPieza): readonly EstadoPieza[] {
  return formato === "email" ? ["borrador", "editado", "publicado"] : ESTADOS_PIEZA;
}

/** Traduce los estados de antes del 2026-11-19 (copias de seguridad antiguas). */
export function estadoDesdeAntiguo(estado: unknown, grabado: unknown, formato: unknown): EstadoPieza {
  if (estado === "publicado") return "publicado";
  if (estado === "listo" || estado === "planificado" || estado === "editado") return "editado";
  if (estado === "grabado" || (grabado === true && formato !== "email")) return "grabado";
  return "borrador";
}

export const ETIQUETA_FINALIDAD: Record<Finalidad, string> = {
  attract: "Attract · Atraer",
  nurture: "Nurture · Cultivar",
  position: "Position · Posicionarme",
  convert: "Convert · Convertir",
};

const uuidOpcional = z.string().transform((v) => (v === "" ? null : v)).pipe(z.string().uuid().nullable());
const textoOpcional = (max: number) => z.string().trim().max(max).transform((v) => (v === "" ? null : v));
const fechaOpcional = z.string().transform((v) => (v === "" ? null : v)).pipe(z.string().date().nullable());

export const esquemaNuevaPieza = z.object({
  titulo: z.string().trim().min(1, "Ponle un título a la pieza.").max(300),
  formato: z.enum(FORMATOS_PIEZA),
  canal: z.enum(CANALES_PIEZA),
  finalidad: z.enum(FINALIDADES).nullable(),
  idea_id: uuidOpcional,
  oferta_id: uuidOpcional,
  lanzamiento_id: uuidOpcional,
  fase_id: uuidOpcional,
  fecha_prevista: fechaOpcional,
});

export const esquemaPieza = z.object({
  titulo: z.string().trim().min(1, "Ponle un título a la pieza.").max(300),
  formato: z.enum(FORMATOS_PIEZA),
  canal: z.enum(CANALES_PIEZA),
  pilar_id: uuidOpcional,
  finalidad: z.enum(FINALIDADES).nullable(),
  oferta_id: uuidOpcional,
  lanzamiento_id: uuidOpcional,
  fase_id: uuidOpcional,
  cta_accion: textoOpcional(500),
  cta_como: textoOpcional(1000),
  cta_url: textoOpcional(2000),
  texto_publicacion: z.string().max(10000).default(""),
  texto_en_pantalla: z.string().max(10000).default(""),
  notas: z.string().max(10000).default(""),
  plano: textoOpcional(2000),
  preparacion: textoOpcional(3000),
  duracion_seg: z.string().transform((v) => (v === "" ? null : Number(v))).pipe(z.number().int().min(0).max(36000).nullable()),
  email_tematica: textoOpcional(200),
  email_audiencia: textoOpcional(500),
  fecha_prevista: fechaOpcional,
});

export const esquemaVersion = z.object({
  nombre: z.string().trim().min(1, "Ponle un nombre a esta versión.").max(120),
  gancho: z.string().max(10000).default(""),
  desarrollo: z.string().max(30000).default(""),
  cierre: z.string().max(10000).default(""),
});

export type Pieza = z.infer<typeof esquemaPieza> & {
  id: string;
  idea_id: string | null;
  origen_pieza_id: string | null;
  relacion_origen: "adaptacion" | "reutilizacion" | null;
  lanzamiento_id: string | null;
  fase_id: string | null;
  estado: EstadoPieza;
  fecha_real: string | null;
  url_publicada: string | null;
  publicado_snapshot: Record<string, unknown> | null;
  grabado: boolean;
  perenne: boolean;
  hora_prevista: string | null;
  email_preview: string | null;
  email_cuerpo_html: string | null;
  created_at: string;
};

export type VersionPieza = z.infer<typeof esquemaVersion> & { id: string; pieza_id: string; elegida: boolean; orden: number };

export function faltaCta(pieza: Pick<Pieza, "finalidad" | "oferta_id" | "cta_accion" | "cta_como">): boolean {
  return pieza.finalidad === "convert" && (!pieza.oferta_id || !pieza.cta_accion || !pieza.cta_como);
}
