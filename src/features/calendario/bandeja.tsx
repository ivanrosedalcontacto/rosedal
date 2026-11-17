import Link from "next/link";
import { ETIQUETA_ESTADO, ETIQUETA_FINALIDAD, ETIQUETA_FORMATO, type EstadoPieza, type Finalidad, type FormatoPieza } from "@/features/piezas/esquemas";
import { Etiqueta } from "@/shared/components/etiquetas";
import { CambiarFecha } from "./cambiar-fecha";
import type { EntradaPieza, FiltrosCalendario } from "./esquemas";

type Props = {
  piezas: EntradaPieza[];
  filtros: FiltrosCalendario;
  vista: string;
  fecha: string;
  dias: string[];
  nombreLanzamiento: Map<string, string>;
};

/** Bandeja «Sin fecha»: piezas sin fecha prevista y sin publicar. */
export function BandejaSinFecha({ piezas, filtros, vista, fecha, dias, nombreLanzamiento }: Props) {
  return (
    <details className="rounded-tarjeta border border-borde bg-fondo-suave p-4">
      <summary className="cursor-pointer font-medium">
        Sin fecha
        <span className="ml-2 text-sm font-normal text-tinta-suave">
          {piezas.length === 1 ? "1 pieza sin fecha" : `${piezas.length} piezas sin fecha`}
        </span>
      </summary>
      <div className="mt-3 flex flex-col gap-3">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="vista" value={vista} />
          <input type="hidden" name="fecha" value={fecha} />
          {(["formato", "canal", "finalidad", "estado", "pilar", "oferta", "lanzamiento"] as const).map((clave) =>
            filtros[clave] ? <input key={clave} type="hidden" name={clave} value={filtros[clave]} /> : null,
          )}
          <label className="flex-1 text-sm font-medium">
            Buscar en la bandeja
            <input name="q" defaultValue={filtros.q} placeholder="Título o texto" className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2" />
          </label>
          <button className="rounded-boton bg-verde-700 px-4 py-2 text-sm font-medium text-white">Buscar</button>
          <Link href={`/calendario?vista=${vista}&fecha=${fecha}`} className="py-2 text-sm text-verde-700">
            Limpiar
          </Link>
        </form>

        {piezas.length === 0 ? (
          <p className="text-sm text-tinta-suave">No hay piezas sin fecha. Todo está colocado en algún día.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {piezas.map((pieza) => (
              <li key={pieza.id} className="rounded-boton border border-borde bg-fondo p-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Etiqueta tono="gris">{ETIQUETA_FORMATO[pieza.formato as FormatoPieza] ?? pieza.formato}</Etiqueta>
                  {pieza.finalidad && <Etiqueta>{ETIQUETA_FINALIDAD[pieza.finalidad as Finalidad]}</Etiqueta>}
                  <Etiqueta tono="neutro">{ETIQUETA_ESTADO[pieza.estado as EstadoPieza] ?? pieza.estado}</Etiqueta>
                </div>
                <Link href={`/piezas/${pieza.id}`} className="mt-1 block font-medium hover:text-verde-700">
                  {pieza.titulo}
                </Link>
                {pieza.lanzamiento_id && (
                  <p className="text-xs text-tinta-suave">{nombreLanzamiento.get(pieza.lanzamiento_id)}</p>
                )}
                <div className="mt-2 max-w-[220px]">
                  <CambiarFecha piezaId={pieza.id} fechaActual={null} dias={dias} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
