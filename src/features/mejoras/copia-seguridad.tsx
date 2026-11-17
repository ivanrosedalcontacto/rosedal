"use client";

import { useActionState, useRef, useState } from "react";
import { MensajeResultado, type Resultado } from "@/shared/components/mensaje-resultado";
import { botonDiscreto, botonPrincipal, campo } from "@/shared/components/estilos";
import { exportarPiezasCsv, generarCopia, restaurarCopia } from "./acciones-extra";

const inicial: Resultado = { error: null };

/** Copia de seguridad: descargar todo, restaurarlo o exportar las piezas en CSV. */
export function CopiaDeSeguridad() {
  const [r, accion, pendiente] = useActionState(restaurarCopia, inicial);
  const [contenido, setContenido] = useState("");
  const entrada = useRef<HTMLInputElement>(null);

  async function descargar(tipo: "json" | "csv") {
    const texto = tipo === "json" ? await generarCopia() : await exportarPiezasCsv();
    const blob = new Blob([texto], { type: tipo === "json" ? "application/json" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = tipo === "json" ? "rosedal-copia.json" : "rosedal-piezas.csv";
    enlace.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-semibold">Copia de seguridad</h2>
        <p className="mt-1 text-sm text-tinta-suave">
          Descarga una copia con todo lo tuyo. Restaurarla solo es posible en una cuenta vacía.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => descargar("json")} className={botonPrincipal}>
          Descargar copia (JSON)
        </button>
        <button type="button" onClick={() => descargar("csv")} className={botonDiscreto}>
          Exportar piezas (CSV)
        </button>
      </div>
      <details className="rounded-tarjeta border border-borde p-4">
        <summary className="cursor-pointer text-sm font-medium text-verde-700">Restaurar una copia</summary>
        <div className="mt-3 flex flex-col gap-2">
          <input
            ref={entrada}
            type="file"
            accept="application/json,.json"
            onChange={async (e) => {
              const archivo = e.target.files?.[0];
              if (!archivo) return;
              setContenido(await archivo.text());
            }}
            className={campo}
          />
          <form action={accion} className="flex flex-col gap-2">
            <input type="hidden" name="copia" value={contenido} />
            <button type="submit" disabled={pendiente || contenido === ""} className={botonPrincipal}>
              {pendiente ? "Restaurando…" : "Restaurar la copia"}
            </button>
          </form>
          <MensajeResultado r={r} />
        </div>
      </details>
    </section>
  );
}
