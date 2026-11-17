import { z } from "zod";
import { FINALIDADES } from "@/features/piezas/esquemas";

export const VISTAS_EMAIL = ["broadcasts", "ideas", "secuencias"] as const;
export type VistaEmail = (typeof VISTAS_EMAIL)[number];
export const ETIQUETA_VISTA_EMAIL: Record<VistaEmail, string> = {
  broadcasts: "Broadcasts",
  ideas: "Ideas de email",
  secuencias: "Secuencias",
};

export const PESTANAS_BROADCAST = ["semana", "sin_fecha", "enviados"] as const;
export type PestanaBroadcast = (typeof PESTANAS_BROADCAST)[number];
export const ETIQUETA_PESTANA: Record<PestanaBroadcast, string> = {
  semana: "Esta semana",
  sin_fecha: "Sin fecha",
  enviados: "Enviados",
};

export const TIPOS_SECUENCIA = ["bienvenida", "lanzamiento", "poscompra", "upsell", "otra"] as const;
export type TipoSecuencia = (typeof TIPOS_SECUENCIA)[number];
export const ETIQUETA_TIPO_SECUENCIA: Record<TipoSecuencia, string> = {
  bienvenida: "Bienvenida",
  lanzamiento: "Lanzamiento",
  poscompra: "Poscompra",
  upsell: "Upsell",
  otra: "Otra",
};

export const PROGRAMACIONES = ["relativa", "fechas"] as const;
export type Programacion = (typeof PROGRAMACIONES)[number];
export const ETIQUETA_PROGRAMACION: Record<Programacion, string> = {
  relativa: "Plazos relativos",
  fechas: "Fechas fijas",
};

const uuidOpcional = z.string().transform((v) => (v === "" ? null : v)).pipe(z.string().uuid().nullable());

export const esquemaAsunto = z.object({
  asunto: z.string().trim().min(1, "Escribe un asunto.").max(200, "El asunto no debería pasar de 200 caracteres."),
});

export const esquemaVistaPrevia = z.object({
  email_preview: z.string().max(300, "El texto de vista previa no debería pasar de 300 caracteres.").default(""),
});

export const esquemaSecuencia = z.object({
  nombre: z.string().trim().min(1, "Ponle un nombre a la secuencia.").max(200),
  tipo: z.enum(TIPOS_SECUENCIA),
  programacion: z.enum(PROGRAMACIONES),
  audiencia: z.string().max(2000).default(""),
  disparador: z.string().max(1000).default(""),
  objetivo: z.string().max(3000).default(""),
  oferta_id: uuidOpcional,
});

export const esquemaPlazo = z.object({
  plazo_cantidad: z.string().trim().transform((v) => (v === "" ? 0 : Number(v))).pipe(z.number().int().min(0, "El plazo no puede ser negativo.").max(10000)),
  plazo_unidad: z.enum(["horas", "dias"]),
});

export const esquemaFechaPaso = z.object({
  fecha_prevista: z.string().transform((v) => (v === "" ? null : v)).pipe(z.string().date().nullable()),
});

export const esquemaPlantillaSecuencia = z.object({
  tipo: z.enum(TIPOS_SECUENCIA),
  programacion: z.enum(PROGRAMACIONES),
  pasos: z
    .array(
      z.object({
        finalidad: z.enum(FINALIDADES).nullable(),
        plazo_cantidad: z.number().int().min(0).max(10000).nullable(),
        plazo_unidad: z.enum(["horas", "dias"]).nullable(),
        proposito: z.string().max(300),
      }),
    )
    .max(50),
});

export type ContenidoPlantillaSecuencia = z.infer<typeof esquemaPlantillaSecuencia>;

export type Secuencia = {
  id: string;
  nombre: string;
  tipo: TipoSecuencia;
  programacion: Programacion;
  audiencia: string;
  disparador: string;
  objetivo: string;
  oferta_id: string | null;
  lanzamiento_id: string | null;
  created_at: string;
};

export type Paso = {
  id: string;
  secuencia_id: string;
  pieza_id: string;
  orden: number;
  plazo_cantidad: number | null;
  plazo_unidad: "horas" | "dias" | null;
};

export type Asunto = { id: string; asunto: string; elegida: boolean; orden: number };

export type CorreoResumen = {
  id: string;
  titulo: string;
  estado: string;
  finalidad: string | null;
  fecha_prevista: string | null;
  fecha_real: string | null;
  email_preview: string | null;
  email_tematica: string | null;
  email_audiencia: string | null;
  pilar_id: string | null;
  oferta_id: string | null;
  lanzamiento_id: string | null;
  asunto: string | null;
};

export type PlantillaSecuencia = {
  id: string;
  nombre: string;
  descripcion: string;
  contenido: unknown;
  created_at: string;
};

export function textoPlazo(cantidad: number | null, unidad: "horas" | "dias" | null): string {
  if (cantidad == null) return "Sin plazo";
  if (cantidad === 0) return "Inmediatamente";
  const nombre = unidad === "horas" ? (cantidad === 1 ? "hora" : "horas") : cantidad === 1 ? "día" : "días";
  return `${cantidad} ${nombre} después del anterior`;
}

export function acumuladoPlazo(pasos: { plazo_cantidad: number | null; plazo_unidad: "horas" | "dias" | null }[], indice: number): string {
  let horas = 0;
  let dias = 0;
  for (let i = 0; i <= indice; i += 1) {
    const paso = pasos[i];
    if (!paso || paso.plazo_cantidad == null) continue;
    if (paso.plazo_unidad === "horas") horas += paso.plazo_cantidad;
    else dias += paso.plazo_cantidad;
  }
  if (horas === 0 && dias === 0) return "En el momento del disparador";
  const partes: string[] = [];
  if (dias > 0) partes.push(`Día ${dias}`);
  if (horas > 0) partes.push(`${horas} ${horas === 1 ? "hora" : "horas"}`);
  return `${partes.join(" y ")} tras el disparador`;
}

/** El plazo del primer paso se cuenta desde el disparador; los demás, desde el anterior. */
export function textoPlazoPaso(
  pasos: { plazo_cantidad: number | null; plazo_unidad: "horas" | "dias" | null }[],
  indice: number,
): string {
  return textoPlazo(pasos[indice]?.plazo_cantidad ?? null, pasos[indice]?.plazo_unidad ?? null);
}
