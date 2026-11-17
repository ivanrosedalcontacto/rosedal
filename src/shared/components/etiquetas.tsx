import type { ReactNode } from "react";
import { HEX_PILAR, type ColorPilar } from "@/shared/constants/colores-pilar";

/** Píldoras de fondo claro y texto oscuro del mismo tono (docs/03). */
const TONOS = {
  neutro: "bg-fondo-suave text-tinta-suave",
  gris: "bg-borde text-tinta-suave",
  verde: "bg-verde-100 text-verde-700",
  menta: "bg-menta-100 text-menta-700",
  rosa: "bg-rosa-100 text-rosa-800",
  aviso: "bg-aviso-fondo text-aviso",
} as const;

export type TonoEtiqueta = keyof typeof TONOS;

export function Etiqueta({
  tono = "neutro",
  children,
  className = "",
}: {
  tono?: TonoEtiqueta;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${TONOS[tono]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Nombre del pilar con su punto de color; nunca el color como fondo completo. */
export function EtiquetaPilar({ nombre, color, className = "" }: { nombre: string; color: ColorPilar; className?: string }) {
  return (
    <Etiqueta tono="neutro" className={className}>
      <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: HEX_PILAR[color] }} />
      <span className="truncate">{nombre}</span>
    </Etiqueta>
  );
}
