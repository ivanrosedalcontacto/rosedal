import Link from "next/link";
import { ETIQUETA_FINALIDAD, ETIQUETA_FORMATO, type Finalidad, type FormatoPieza } from "@/features/piezas/esquemas";
import { CambiarFecha } from "./cambiar-fecha";
import type { EntradaPieza, PilarCalendario } from "./esquemas";

type Props = {
  piezas: EntradaPieza[];
  dias: string[];
  pilares: Map<string, PilarCalendario>;
};

/** Piezas Editadas que aún no tienen día: lo que está listo para publicar. */
export function BandejaSinFecha({ piezas, dias, pilares }: Props) {
  return (
    <details className="rounded-tarjeta border border-borde bg-fondo-suave p-4">
      <summary className="cursor-pointer font-medium">
        Listas sin día
        <span className="ml-2 text-sm font-normal text-tinta-suave">
          {piezas.length === 1 ? "1 pieza editada" : `${piezas.length} piezas editadas`}
        </span>
      </summary>
      {piezas.length === 0 ? (
        <p className="mt-3 text-sm text-tinta-suave">No hay piezas editadas sin día.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {piezas.map((pieza) => {
            const pilar = pieza.pilar_id ? pilares.get(pieza.pilar_id) : undefined;
            return (
              <li key={pieza.id} className="rounded-boton border border-borde border-l-[6px] bg-fondo p-2" style={{ borderLeftColor: pilar?.color ?? "var(--color-borde)" }}>
                <Link href={`/piezas/${pieza.id}`} className="block font-medium hover:text-verde-700">{pieza.titulo}</Link>
                <p className="text-xs text-tinta-suave">
                  {pilar?.nombre ?? "Sin pilar"} · {pieza.finalidad ? ETIQUETA_FINALIDAD[pieza.finalidad as Finalidad] : "Sin finalidad"} · {ETIQUETA_FORMATO[pieza.formato as FormatoPieza] ?? pieza.formato}
                </p>
                <div className="mt-2 max-w-[220px]">
                  <CambiarFecha piezaId={pieza.id} fechaActual={null} dias={dias} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </details>
  );
}
