import { z } from "zod";
import { COLORES_PILAR, type ColorPilar } from "@/shared/constants/colores-pilar";

// Reexportados para que los consumidores de esta feature no dependan de shared directamente.
export { COLORES_PILAR, HEX_PILAR } from "@/shared/constants/colores-pilar";

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
  color: ColorPilar;
  orden: number;
  archivado: boolean;
};
