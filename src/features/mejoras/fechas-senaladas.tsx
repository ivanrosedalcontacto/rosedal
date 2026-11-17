"use client";

import { useActionState } from "react";
import { MensajeResultado, type Resultado } from "@/shared/components/mensaje-resultado";
import { botonDiscreto, botonPrincipal, campo } from "@/shared/components/estilos";
import { formatearFechaCorta } from "@/shared/lib/fechas";
import { borrarFechaSenalada, guardarFechaSenalada } from "./acciones-extra";

const inicial: Resultado = { error: null };

type FechaSenalada = { id: string; titulo: string; fecha_inicio: string; fecha_fin: string | null; nota: string };

/** Fechas señaladas (B1): días que condicionan la planificación. */
export function FechasSenaladas({ fechas }: { fechas: FechaSenalada[] }) {
  const [r, accion, pendiente] = useActionState(guardarFechaSenalada, inicial);
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-semibold">Fechas señaladas</h2>
        <p className="mt-1 text-sm text-tinta-suave">
          Días que condicionan tu plan (vacaciones, una feria, un Black Friday). En el calendario se ven como marcas, no
          como piezas.
        </p>
      </div>
      {fechas.length > 0 && (
        <ul className="overflow-hidden rounded-tarjeta border border-borde">
          {fechas.map((fecha) => (
            <li key={fecha.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-borde px-4 py-3 last:border-b-0">
              <div>
                <p className="text-sm font-medium">{fecha.titulo}</p>
                <p className="text-xs text-tinta-suave">
                  {formatearFechaCorta(fecha.fecha_inicio)}
                  {fecha.fecha_fin ? ` – ${formatearFechaCorta(fecha.fecha_fin)}` : ""}
                  {fecha.nota && ` · ${fecha.nota}`}
                </p>
              </div>
              <form action={borrarFechaSenalada.bind(null, fecha.id)}>
                <button type="submit" className={botonDiscreto}>
                  Quitar
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
      <form action={accion} className="grid gap-2 rounded-tarjeta border border-borde bg-fondo-suave p-3 sm:grid-cols-[1fr_150px_150px_auto] sm:items-end">
        <label className="text-sm font-medium">
          Título
          <input name="titulo" required placeholder="Black Friday" className={campo} />
        </label>
        <label className="text-sm font-medium">
          Empieza
          <input name="fecha_inicio" type="date" required className={campo} />
        </label>
        <label className="text-sm font-medium">
          Termina
          <input name="fecha_fin" type="date" className={campo} />
        </label>
        <button type="submit" disabled={pendiente} className={botonPrincipal}>
          Añadir
        </button>
      </form>
      <MensajeResultado r={r} />
    </section>
  );
}
