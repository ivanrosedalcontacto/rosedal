"use client";

import Link from "next/link";
import { useId, useState, type ReactNode } from "react";

type Props = {
  /** Número de filtros aplicados ahora mismo (se muestra en la pestaña). */
  activos: number;
  /** Cuántos resultados hay con los filtros actuales. */
  total: number;
  /** Dirección que quita todos los filtros. */
  limpiar: string;
  filtros: ReactNode;
  children: ReactNode;
};

/**
 * Dos pestañas: «Resultados» (por defecto) y «Filtros (n)». Así los filtros no
 * alargan la vista y los resultados se ven nada más entrar.
 */
export function PestanasFiltros({ activos, total, limpiar, filtros, children }: Props) {
  const [vista, setVista] = useState<"resultados" | "filtros">("resultados");
  const id = useId();
  const pestana = (clave: "resultados" | "filtros", texto: string) => (
    <button
      type="button"
      role="tab"
      id={`${id}-${clave}`}
      aria-selected={vista === clave}
      aria-controls={`${id}-panel-${clave}`}
      onClick={() => setVista(clave)}
      className={`min-h-11 rounded-full px-4 py-2 text-sm ${vista === clave ? "bg-acento font-medium text-acento-texto" : "border border-borde text-tinta"}`}
    >
      {texto}
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label="Resultados y filtros" className="flex flex-wrap items-center gap-2">
        {pestana("resultados", `Resultados (${total})`)}
        {pestana("filtros", activos > 0 ? `Filtros (${activos})` : "Filtros")}
        {activos > 0 && (
          <Link href={limpiar} className="min-h-11 px-2 py-2.5 text-sm text-verde-700">
            Quitar filtros
          </Link>
        )}
      </div>
      <div role="tabpanel" id={`${id}-panel-resultados`} aria-labelledby={`${id}-resultados`} hidden={vista !== "resultados"}>
        {children}
      </div>
      <div role="tabpanel" id={`${id}-panel-filtros`} aria-labelledby={`${id}-filtros`} hidden={vista !== "filtros"}>
        <div className="flex flex-col gap-3">
          {filtros}
          <button type="button" onClick={() => setVista("resultados")} className="self-start text-sm font-medium text-verde-700">
            {total === 1 ? "Ver el resultado →" : `Ver los ${total} resultados →`}
          </button>
        </div>
      </div>
    </div>
  );
}
