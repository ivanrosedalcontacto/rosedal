"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useCaptura } from "./almacen";
import { INFO_CAPTURA, TIPOS_CAPTURA } from "./tipos";

/** Menú con las tres capturas. `movil` es el «+» central; `lateral` el botón de la barra lateral. */
export function MenuCaptura({ variante }: { variante: "movil" | "lateral" }) {
  const [abierto, setAbierto] = useState(false);
  const abrir = useCaptura((s) => s.abrir);

  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [abierto]);

  const movil = variante === "movil";

  return (
    <div className={movil ? "relative flex justify-center" : "relative"}>
      {abierto && <div className="fixed inset-0 z-30" onClick={() => setAbierto(false)} aria-hidden />}
      {abierto && (
        <ul
          className={`absolute z-40 w-60 overflow-hidden rounded-tarjeta border border-borde bg-fondo shadow-lg ${
            movil ? "bottom-[4.5rem] left-1/2 -translate-x-1/2" : "left-0 top-full mt-2"
          }`}
        >
          {TIPOS_CAPTURA.map((t) => (
            <li key={t} className="border-b border-borde last:border-b-0">
              <button
                type="button"
                className="min-h-11 w-full px-4 py-3 text-left hover:bg-verde-50"
                onClick={() => {
                  setAbierto(false);
                  abrir(t);
                }}
              >
                {INFO_CAPTURA[t].boton}
              </button>
            </li>
          ))}
        </ul>
      )}
      {movil ? (
        <button
          type="button"
          aria-label="Capturar"
          aria-expanded={abierto}
          onClick={() => setAbierto((v) => !v)}
          className="relative z-40 -mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-verde-700 text-white shadow-md"
        >
          <Plus className="h-7 w-7" aria-hidden />
        </button>
      ) : (
        <button
          type="button"
          aria-expanded={abierto}
          onClick={() => setAbierto((v) => !v)}
          className="relative z-40 flex min-h-11 w-full items-center justify-center gap-2 rounded-boton bg-verde-700 px-3 py-2 font-medium text-white"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Capturar
        </button>
      )}
    </div>
  );
}
