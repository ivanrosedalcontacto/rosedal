"use client";

import { useCaptura } from "./almacen";
import { INFO_CAPTURA, TIPOS_CAPTURA } from "./tipos";

/** Los tres accesos de captura de la pantalla Hoy. */
export function BotonesCaptura() {
  const abrir = useCaptura((s) => s.abrir);
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {TIPOS_CAPTURA.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => abrir(t)}
          className="min-h-14 rounded-tarjeta border border-verde-200 bg-verde-50 px-4 py-3 text-left font-medium text-verde-700 hover:bg-verde-100"
        >
          {INFO_CAPTURA[t].boton}
        </button>
      ))}
    </div>
  );
}
