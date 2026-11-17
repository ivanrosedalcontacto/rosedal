"use client";

import { useActionState } from "react";
import { MensajeResultado, type Resultado } from "@/shared/components/mensaje-resultado";
import { formatearFechaCorta } from "@/shared/lib/fechas";
import { moverPiezaAFecha } from "./acciones";

const inicial: Resultado = { error: null };

/**
 * Cambiar fecha: en móvil es la forma de mover una pieza (el arrastre en ordenador
 * se declara pendiente). La lista son los días que se están viendo.
 */
export function CambiarFecha({
  piezaId,
  fechaActual,
  dias,
}: {
  piezaId: string;
  fechaActual: string | null;
  dias: string[];
}) {
  const [r, accion, pendiente] = useActionState(moverPiezaAFecha, inicial);
  return (
    <form action={accion} className="flex flex-col gap-1">
      <input type="hidden" name="pieza_id" value={piezaId} />
      <label className="sr-only" htmlFor={`fecha-${piezaId}`}>
        Fecha prevista
      </label>
      <select
        id={`fecha-${piezaId}`}
        name="fecha_prevista"
        defaultValue={fechaActual ?? ""}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        disabled={pendiente}
        className="min-h-9 rounded-boton border border-borde bg-fondo px-2 py-1 text-xs"
      >
        <option value="">Sin fecha</option>
        {dias.map((d) => (
          <option key={d} value={d}>
            {formatearFechaCorta(d)}
          </option>
        ))}
      </select>
      {r.error && <MensajeResultado r={r} />}
    </form>
  );
}
