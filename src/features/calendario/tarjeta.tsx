import Link from "next/link";
import {
  ETIQUETA_ESTADO,
  ETIQUETA_FINALIDAD,
  ETIQUETA_FORMATO,
  type EstadoPieza,
  type Finalidad,
  type FormatoPieza,
} from "@/features/piezas/esquemas";
import { formatearFechaCorta } from "@/shared/lib/fechas";
import { CambiarFecha } from "./cambiar-fecha";
import { notaPrevista, type EntradaPieza, type PilarCalendario } from "./esquemas";

type Contexto = {
  pieza: EntradaPieza;
  dias: string[];
  pilar?: PilarCalendario;
  lanzamiento?: string;
  compacta?: boolean;
};

/**
 * Tarjeta de una pieza en el calendario: banda con el color del pilar, título y,
 * debajo, la finalidad. El pilar también va escrito: el color nunca va solo.
 */
export function TarjetaPieza({ pieza, dias, pilar, lanzamiento, compacta }: Contexto) {
  const publicada = pieza.estado === "publicado";
  const prevista = notaPrevista(pieza);
  const color = pilar?.color ?? "var(--color-borde)";
  return (
    <article className={`rounded-boton border border-borde border-l-[6px] bg-fondo p-2 ${compacta ? "text-xs" : "text-sm"}`} style={{ borderLeftColor: color }}>
      <Link href={`/piezas/${pieza.id}`} className="block font-medium leading-snug hover:text-verde-700">
        {pieza.titulo}
      </Link>
      <p className={compacta ? "text-[11px]" : "text-xs font-medium"}>
        {pieza.finalidad ? ETIQUETA_FINALIDAD[pieza.finalidad as Finalidad] : "Sin finalidad"}
      </p>
      {!compacta && (
        <p className="mt-1 text-xs text-tinta-suave">
          {pilar?.nombre ?? "Sin pilar"} · {ETIQUETA_FORMATO[pieza.formato as FormatoPieza] ?? pieza.formato}
          {publicada ? ` · ${ETIQUETA_ESTADO[pieza.estado as EstadoPieza]}` : ""}
        </p>
      )}
      {pieza.tarjetas > 1 && <p className="text-xs text-tinta-suave">Stories · {pieza.tarjetas}</p>}
      {lanzamiento && !compacta && <p className="text-xs text-tinta-suave">{lanzamiento}</p>}
      {prevista && <p className="text-xs text-tinta-suave">Prevista: {formatearFechaCorta(prevista)}</p>}
      {!publicada && !compacta && (
        <div className="mt-2">
          <CambiarFecha piezaId={pieza.id} fechaActual={pieza.fecha_prevista} dias={dias} />
        </div>
      )}
    </article>
  );
}

/** Un hito de lanzamiento se ve distinto de una pieza: con su propio color. */
export function TarjetaHito({ titulo, hecho }: { titulo: string; hecho: boolean }) {
  return (
    <p className={`rounded-boton border border-dashed border-aviso bg-aviso-fondo px-2 py-1 text-xs ${hecho ? "line-through opacity-70" : ""}`}>
      {titulo}
    </p>
  );
}
