import { z } from "zod";
import { FINALIDADES, FORMATOS_PIEZA } from "@/features/piezas/esquemas";

export const TIPOS_FASE = ["expectacion", "apertura", "venta", "cierre", "seguimiento"] as const;
export type TipoFase = (typeof TIPOS_FASE)[number];

export const ETIQUETA_FASE: Record<TipoFase, string> = {
  expectacion: "Expectación",
  apertura: "Apertura",
  venta: "Venta",
  cierre: "Cierre",
  seguimiento: "Seguimiento",
};

/** Qué se busca en cada fase, como texto de ayuda al crear una desde cero. */
export const AYUDA_FASE: Record<TipoFase, string> = {
  expectacion: "Que se reconozcan en el problema y sepan que viene algo.",
  apertura: "Anunciar que se abren las plazas.",
  venta: "Resolver dudas y objeciones.",
  cierre: "Último aviso.",
  seguimiento: "Dar la bienvenida y recoger impresiones.",
};

export const ESTADOS_LANZAMIENTO = ["en_preparacion", "en_curso", "terminado"] as const;
export type EstadoLanzamiento = (typeof ESTADOS_LANZAMIENTO)[number];
export const ETIQUETA_ESTADO_LANZAMIENTO: Record<EstadoLanzamiento, string> = {
  en_preparacion: "En preparación",
  en_curso: "En curso",
  terminado: "Terminado",
};

const uuidOpcional = z.string().transform((v) => (v === "" ? null : v)).pipe(z.string().uuid().nullable());
const fechaOpcional = z.string().transform((v) => (v === "" ? null : v)).pipe(z.string().date().nullable());

export const esquemaLanzamiento = z.object({
  nombre: z.string().trim().min(1, "Ponle un nombre al lanzamiento.").max(200),
  oferta_id: uuidOpcional,
  objetivo: z.string().trim().max(1000).default(""),
  fecha_inicio: fechaOpcional,
  fecha_fin: fechaOpcional,
  estado: z.enum(ESTADOS_LANZAMIENTO),
});

export const esquemaFase = z
  .object({
    nombre: z.string().trim().min(1, "Ponle un nombre a la fase.").max(120),
    fecha_inicio: fechaOpcional,
    fecha_fin: fechaOpcional,
    notas: z.string().trim().max(1000).default(""),
  })
  .refine((f) => !f.fecha_inicio || !f.fecha_fin || f.fecha_inicio <= f.fecha_fin, {
    message: "La fase no puede terminar antes de empezar.",
  });

export const esquemaHito = z.object({
  titulo: z.string().trim().min(1, "Escribe el título del hito.").max(200),
  fecha: z.string().date("Elige una fecha para el hito."),
  fase_id: uuidOpcional,
});

/** Estructura de una plantilla de lanzamiento; los días son relativos a la apertura (día 0). */
export const esquemaPlantillaLanzamiento = z.object({
  fases: z
    .array(
      z.object({
        tipo: z.enum(TIPOS_FASE),
        nombre: z.string().trim().min(1, "Cada fase necesita un nombre.").max(120),
        inicio_dias: z.number().int().min(-365).max(365),
        fin_dias: z.number().int().min(-365).max(365),
        notas: z.string().max(1000).default(""),
      }),
    )
    .length(5, "La plantilla necesita las cinco fases."),
  hitos: z
    .array(
      z.object({
        titulo: z.string().trim().min(1, "Cada hito necesita un título.").max(200),
        dias: z.number().int().min(-365).max(365),
        fase: z.enum(TIPOS_FASE),
      }),
    )
    .max(40),
  piezas: z
    .array(
      z.object({
        titulo: z.string().trim().min(1, "Cada pieza sugerida necesita un título.").max(200),
        formato: z.enum(FORMATOS_PIEZA),
        finalidad: z.enum(FINALIDADES).nullable(),
        dias: z.number().int().min(-365).max(365),
        fase: z.enum(TIPOS_FASE),
      }),
    )
    .max(80),
});

export type ContenidoPlantillaLanzamiento = z.infer<typeof esquemaPlantillaLanzamiento>;

export const esquemaAplicarPlantilla = z.object({
  plantilla_id: z.string().uuid("Elige una plantilla."),
  nombre: z.string().trim().min(1, "Ponle un nombre al lanzamiento.").max(200),
  oferta_id: uuidOpcional,
  fecha_apertura: z.string().date("Elige la fecha de apertura."),
});

export type Lanzamiento = {
  id: string;
  nombre: string;
  oferta_id: string | null;
  objetivo: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  estado: EstadoLanzamiento;
  created_at: string;
};

export type Fase = {
  id: string;
  lanzamiento_id: string;
  tipo: TipoFase;
  nombre: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  orden: number;
  notas: string;
};

export type Hito = {
  id: string;
  lanzamiento_id: string;
  fase_id: string | null;
  titulo: string;
  fecha: string;
  hecho: boolean;
};

export type PlantillaLanzamiento = {
  id: string;
  nombre: string;
  descripcion: string;
  clave: string | null;
  contenido: ContenidoPlantillaLanzamiento;
};

export type FilaPieza = {
  id: string;
  titulo: string;
  formato: string;
  estado: string;
  finalidad: string | null;
  fecha_prevista: string | null;
  fase_id: string | null;
};

/** Texto de un día relativo: «Día 0», «6 días antes», «14 días después». */
export function textoDiaRelativo(dias: number): string {
  if (dias === 0) return "Día 0, apertura";
  const cantidad = Math.abs(dias);
  const nombre = cantidad === 1 ? "día" : "días";
  return dias < 0 ? `${cantidad} ${nombre} antes` : `${cantidad} ${nombre} después`;
}
