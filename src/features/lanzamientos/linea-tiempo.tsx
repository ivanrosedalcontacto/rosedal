import { formatearFechaCorta, hoyMadrid } from "@/shared/lib/fechas";
import { ETIQUETA_FINALIDAD, FINALIDADES, type Finalidad } from "@/features/piezas/esquemas";
import { ETIQUETA_FASE, type Fase, type Hito } from "./esquemas";

const TONO_FASE: Record<string, string> = {
  expectacion: "border-t-verde-200 bg-verde-50",
  apertura: "border-t-verde-300 bg-verde-100",
  venta: "border-t-menta-100 bg-menta-100/40",
  cierre: "border-t-rosa-200 bg-rosa-50",
  seguimiento: "border-t-borde bg-fondo-suave",
};

/** Cinco tramos consecutivos con sus fechas; el que contiene hoy se marca. */
export function LineaTiempo({ fases, hitos }: { fases: Fase[]; hitos: Hito[] }) {
  const hoy = hoyMadrid();
  return (
    <div className="md:-mx-0 md:overflow-x-auto">
      <ol className="flex flex-col gap-1 md:min-w-[680px] md:flex-row">
        {fases.map((fase) => {
          const contieneHoy = Boolean(fase.fecha_inicio && fase.fecha_fin && fase.fecha_inicio <= hoy && fase.fecha_fin >= hoy);
          const susHitos = hitos.filter((h) => h.fase_id === fase.id);
          return (
            <li key={fase.id} className={`flex-1 rounded-tarjeta border-t-4 px-3 py-3 ${TONO_FASE[fase.tipo] ?? "border-t-borde bg-fondo-suave"}`}>
              <div className="flex items-center justify-between gap-1">
                <p className="text-sm font-semibold">{ETIQUETA_FASE[fase.tipo]}</p>
                {contieneHoy && <span className="rounded-full bg-verde-700 px-2 py-0.5 text-[10px] font-medium text-white">Hoy</span>}
              </div>
              <p className="mt-1 text-xs text-tinta-suave">
                {fase.fecha_inicio ? formatearFechaCorta(fase.fecha_inicio) : "Sin fecha"}
                {" – "}
                {fase.fecha_fin ? formatearFechaCorta(fase.fecha_fin) : "sin fecha"}
              </p>
              {fase.notas && <p className="mt-1 line-clamp-2 text-xs text-tinta-suave">{fase.notas}</p>}
              {susHitos.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1">
                  {susHitos.map((hito) => (
                    <li key={hito.id} className="rounded-full bg-fondo px-2 py-0.5 text-[11px] text-tinta-suave">
                      {hito.fecha ? formatearFechaCorta(hito.fecha) : ""} · {hito.titulo}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Tabla pequeña de piezas por fase y finalidad: informa, no juzga. */
export function ResumenFinalidades({
  fases,
  piezas,
}: {
  fases: Fase[];
  piezas: { fase_id: string | null; finalidad: string | null }[];
}) {
  return (
    <div className="overflow-x-auto rounded-tarjeta border border-borde">
      <table className="w-full min-w-[560px] text-sm">
        <caption className="sr-only">Piezas por finalidad en cada fase</caption>
        <thead className="bg-fondo-suave text-left">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium">Fase</th>
            {FINALIDADES.map((f) => <th key={f} scope="col" className="px-3 py-2 font-medium">{ETIQUETA_FINALIDAD[f].split(" · ")[0]}</th>)}
            <th scope="col" className="px-3 py-2 font-medium">Sin finalidad</th>
          </tr>
        </thead>
        <tbody>
          {fases.map((fase) => {
            const suyas = piezas.filter((p) => p.fase_id === fase.id);
            return (
              <tr key={fase.id} className="border-t border-borde">
                <th scope="row" className="px-3 py-2 text-left font-medium">{ETIQUETA_FASE[fase.tipo]}</th>
                {FINALIDADES.map((f) => <td key={f} className="px-3 py-2">{suyas.filter((p) => p.finalidad === (f as Finalidad)).length}</td>)}
                <td className="px-3 py-2">{suyas.filter((p) => !p.finalidad).length}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
