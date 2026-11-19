"use client";

import { useState } from "react";
import { botonDiscreto } from "@/shared/components/estilos";
import { alternarPerenne } from "./acciones-extra";

/** Marca una pieza como perenne (B5). */
export function MarcaPerenne({ piezaId, perenne }: { piezaId: string; perenne: boolean }) {
  return (
    <form action={alternarPerenne.bind(null, piezaId, !perenne)} className="flex items-center gap-2">
      <button
        type="submit"
        aria-pressed={perenne}
        className={`grid h-6 w-6 place-items-center rounded border ${perenne ? "border-verde-700 bg-verde-700 text-white" : "border-borde bg-fondo"}`}
        aria-label={perenne ? "Quitar la marca de perenne" : "Marcar como perenne"}
      >
        {perenne ? "✓" : ""}
      </button>
      <span className="text-sm">Es contenido perenne</span>
    </form>
  );
}

/** Contador de caracteres (A6). */
export function ContadorDeTexto({ texto, maximo }: { texto: string; maximo: number }) {
  const largo = texto.length;
  const tono = largo > maximo ? "text-aviso" : "text-tinta-suave";
  return (
    <p className={`text-xs ${tono}`}>
      {largo} de {maximo} caracteres
    </p>
  );
}

/** Modo concentración (B10): deja solo el texto. */
export function BotonConcentracion() {
  const [activo, setActivo] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={() => {
        const nuevo = !activo;
        setActivo(nuevo);
        document.documentElement.dataset.concentracion = nuevo ? "1" : "0";
      }}
      className={botonDiscreto}
    >
      {activo ? "Salir del modo concentración" : "Modo concentración"}
    </button>
  );
}
