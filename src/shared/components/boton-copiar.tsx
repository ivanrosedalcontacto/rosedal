"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { botonSecundario } from "./estilos";

/** Copia exactamente el texto recibido, sin recortar ni normalizar. */
export function BotonCopiar({ texto, etiqueta = "Copiar" }: { texto: string; etiqueta?: string }) {
  const [estado, setEstado] = useState<"reposo" | "copiado" | "fallo">("reposo");

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setEstado("copiado");
    } catch {
      setEstado("fallo");
    }
    setTimeout(() => setEstado("reposo"), 2000);
  }

  return (
    <button type="button" onClick={copiar} className={`${botonSecundario} inline-flex items-center gap-2`}>
      {estado === "copiado" ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
      <span aria-live="polite">
        {estado === "copiado" ? "Copiado ✓" : estado === "fallo" ? "No se pudo copiar" : etiqueta}
      </span>
    </button>
  );
}
