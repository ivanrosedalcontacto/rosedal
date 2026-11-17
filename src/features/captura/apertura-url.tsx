"use client";

import { useEffect } from "react";
import { useCaptura } from "./almacen";
import { TIPOS_CAPTURA, type TipoCaptura } from "./tipos";

/** Abre la hoja de captura si la dirección pide una (?captura=idea). */
export function AperturaPorUrl() {
  const abrir = useCaptura((s) => s.abrir);
  useEffect(() => {
    const parametro = new URLSearchParams(window.location.search).get("captura");
    if (parametro && (TIPOS_CAPTURA as string[]).includes(parametro)) {
      abrir(parametro as TipoCaptura);
      const url = new URL(window.location.href);
      url.searchParams.delete("captura");
      window.history.replaceState({}, "", url.toString());
    }
  }, [abrir]);
  return null;
}
