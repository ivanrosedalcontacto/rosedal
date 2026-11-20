import Link from "next/link";
import { ETIQUETA_FINALIDAD, ETIQUETA_FORMATO, type Finalidad, type FormatoPieza } from "@/features/piezas/esquemas";
import { formatearFechaCorta } from "@/shared/lib/fechas";
import { programarPieza } from "./acciones";
import type { EntradaPieza, PilarCalendario } from "./esquemas";

export const SIN_PILAR = "sin-pilar";

type Props = {
  dia: string;
  pilarElegido: string;
  /** Piezas Editadas sin día y sin publicar: las que se pueden programar. */
  candidatas: EntradaPieza[];
  pilares: PilarCalendario[];
  /** Vista del calendario a la que se vuelve al cerrar o al programar. */
  volver: string;
};

const claveDe = (pieza: EntradaPieza) => pieza.pilar_id ?? SIN_PILAR;

/** Panel para programar un día: primero el pilar, después una de sus piezas editadas. */
export function ProgramarDia({ dia, pilarElegido, candidatas, pilares, volver }: Props) {
  const conPiezas = new Set(candidatas.map(claveDe));
  const opciones = [
    ...pilares.filter((p) => !p.archivado || conPiezas.has(p.id)),
    ...(conPiezas.has(SIN_PILAR) ? [{ id: SIN_PILAR, nombre: "Sin pilar", color: "var(--color-borde)", archivado: false }] : []),
  ];
  const pilar = opciones.find((p) => p.id === pilarElegido);
  const base = `${volver}${volver.includes("?") ? "&" : "?"}programar=${dia}`;
  const piezas = pilar ? candidatas.filter((p) => claveDe(p) === pilar.id) : [];
  const nueva = `/piezas/nueva?fecha=${dia}${pilar && pilar.id !== SIN_PILAR ? `&pilar=${pilar.id}` : ""}`;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-tinta/40 p-0 md:items-center md:p-6">
      <section role="dialog" aria-modal="true" aria-labelledby="titulo-programar" className="max-h-[85vh] w-full overflow-y-auto rounded-t-tarjeta bg-fondo p-5 shadow-lg md:max-w-lg md:rounded-tarjeta">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-tinta-suave">{formatearFechaCorta(dia)}</p>
            <h2 id="titulo-programar" className="font-serif text-xl">{pilar ? pilar.nombre : "¿De qué pilar?"}</h2>
          </div>
          <Link href={volver} className="min-h-11 px-2 py-2 text-sm text-verde-700">Cerrar</Link>
        </div>

        {!pilar ? (
          <ul className="mt-4 flex flex-col gap-2">
            {opciones.map((p) => {
              const n = candidatas.filter((c) => claveDe(c) === p.id).length;
              return (
                <li key={p.id}>
                  <Link href={`${base}&pilar=${p.id}`} className="flex min-h-11 items-center gap-3 rounded-tarjeta border border-borde border-l-8 px-3 py-2 hover:bg-fondo-suave" style={{ borderLeftColor: p.color }}>
                    <span className="flex-1 font-medium">{p.nombre}</span>
                    <span className="text-sm text-tinta-suave">{n === 1 ? "1 lista" : `${n} listas`}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            <Link href={base} className="text-sm text-verde-700">← Otro pilar</Link>
            {piezas.length === 0 ? (
              <p className="rounded-tarjeta bg-fondo-suave px-4 py-6 text-center text-sm text-tinta-suave">No tienes piezas editadas sin día en este pilar.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {piezas.map((p) => (
                  <li key={p.id}>
                    <form action={programarPieza.bind(null, p.id, dia, volver)}>
                      <button type="submit" className="w-full rounded-tarjeta border border-borde px-3 py-2 text-left hover:bg-fondo-suave">
                        <span className="block font-medium">{p.titulo}</span>
                        <span className="block text-sm text-tinta-suave">
                          {p.finalidad ? ETIQUETA_FINALIDAD[p.finalidad as Finalidad] : "Sin finalidad"} · {ETIQUETA_FORMATO[p.formato as FormatoPieza] ?? p.formato}
                        </span>
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
            <Link href={nueva} className="text-sm text-verde-700">o crea una pieza nueva para este día</Link>
          </div>
        )}
      </section>
    </div>
  );
}
