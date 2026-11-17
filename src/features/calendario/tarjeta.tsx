import Link from "next/link";
import {
  ETIQUETA_ESTADO,
  ETIQUETA_FINALIDAD,
  ETIQUETA_FORMATO,
  type EstadoPieza,
  type Finalidad,
  type FormatoPieza,
} from "@/features/piezas/esquemas";
import { Etiqueta } from "@/shared/components/etiquetas";
import { formatearFechaCorta } from "@/shared/lib/fechas";
import { CambiarFecha } from "./cambiar-fecha";
import { notaPrevista, type EntradaPieza } from "./esquemas";

type Contexto = {
  pieza: EntradaPieza;
  dias: string[];
  lanzamiento?: string;
  compacta?: boolean;
};

/** Tarjeta de una pieza en el calendario: formato, título, finalidad, estado y fecha. */
export function TarjetaPieza({ pieza, dias, lanzamiento, compacta }: Contexto) {
  const publicada = pieza.estado === "publicado";
  const prevista = notaPrevista(pieza);
  return (
    <article className={`rounded-boton border border-borde bg-fondo p-2 ${compacta ? "text-xs" : "text-sm"}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        <Etiqueta tono="gris">{ETIQUETA_FORMATO[pieza.formato as FormatoPieza] ?? pieza.formato}</Etiqueta>
        {pieza.finalidad && <Etiqueta>{ETIQUETA_FINALIDAD[pieza.finalidad as Finalidad]}</Etiqueta>}
        <Etiqueta tono={publicada ? "verde" : "neutro"}>{ETIQUETA_ESTADO[pieza.estado as EstadoPieza] ?? pieza.estado}</Etiqueta>
      </div>
      <Link href={`/piezas/${pieza.id}`} className="mt-1 block font-medium hover:text-verde-700">
        {pieza.titulo}
      </Link>
      {pieza.tarjetas > 1 && <p className="text-xs text-tinta-suave">Stories · {pieza.tarjetas}</p>}
      {lanzamiento && <p className="text-xs text-tinta-suave">{lanzamiento}</p>}
      {prevista && (
        <p className="text-xs text-tinta-suave">
          Prevista: {formatearFechaCorta(prevista)}
        </p>
      )}
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
