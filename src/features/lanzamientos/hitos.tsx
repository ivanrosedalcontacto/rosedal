import { formatearFecha } from "@/shared/lib/fechas";
import { botonDiscreto } from "@/shared/components/estilos";
import { alternarHito, borrarHito } from "./acciones";
import { FormularioEditarHito, FormularioHito } from "./formularios";
import { ETIQUETA_FASE, type Fase, type Hito } from "./esquemas";

export function Hitos({ lanzamientoId, hitos, fases }: { lanzamientoId: string; hitos: Hito[]; fases: Fase[] }) {
  const fasePorId = new Map(fases.map((f) => [f.id, f]));
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">Hitos</h2>
      {hitos.length === 0 ? (
        <p className="rounded-tarjeta bg-fondo-suave px-4 py-5 text-sm text-tinta-suave">
          Todavía no hay hitos. Añade fechas que no quieras perderte: abrir inscripciones, un directo, el cierre.
        </p>
      ) : (
        <ul className="overflow-hidden rounded-tarjeta border border-borde">
          {hitos.map((hito) => {
            const fase = hito.fase_id ? fasePorId.get(hito.fase_id) : undefined;
            return (
              <li key={hito.id} className={`flex flex-wrap items-center gap-3 border-b border-borde px-4 py-3 last:border-b-0 ${hito.hecho ? "opacity-60" : ""}`}>
                <form action={alternarHito.bind(null, lanzamientoId, hito.id, !hito.hecho)}>
                  <button
                    type="submit"
                    aria-pressed={hito.hecho}
                    aria-label={hito.hecho ? `Marcar «${hito.titulo}» como pendiente` : `Marcar «${hito.titulo}» como hecho`}
                    className={`grid h-6 w-6 place-items-center rounded border ${hito.hecho ? "border-verde-700 bg-verde-700 text-white" : "border-borde bg-fondo"}`}
                  >
                    {hito.hecho ? "✓" : ""}
                  </button>
                </form>
                <div className="min-w-0 flex-1">
                  <p className={`font-medium ${hito.hecho ? "line-through" : ""}`}>{hito.titulo}</p>
                  <p className="text-xs text-tinta-suave">
                    {formatearFecha(hito.fecha)}
                    {fase ? ` · ${ETIQUETA_FASE[fase.tipo]}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <details>
                    <summary className={botonDiscreto}>Editar</summary>
                    <div className="mt-2 min-w-[280px]">
                      <FormularioEditarHito lanzamientoId={lanzamientoId} hito={hito} fases={fases} />
                    </div>
                  </details>
                  <form action={borrarHito.bind(null, lanzamientoId, hito.id)}>
                    <button type="submit" className={botonDiscreto}>Quitar</button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <details className="rounded-tarjeta border border-borde p-4">
        <summary className="cursor-pointer text-sm font-medium text-verde-700">+ Añadir hito</summary>
        <div className="mt-3"><FormularioHito lanzamientoId={lanzamientoId} fases={fases} /></div>
      </details>
    </section>
  );
}
