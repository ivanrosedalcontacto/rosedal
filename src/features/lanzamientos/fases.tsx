import Link from "next/link";
import { ETIQUETA_ESTADO, ETIQUETA_FINALIDAD, ETIQUETA_FORMATO, FORMATOS_PIEZA, type Finalidad, type FormatoPieza } from "@/features/piezas/esquemas";
import { Etiqueta } from "@/shared/components/etiquetas";
import { botonDiscreto, botonPrincipal } from "@/shared/components/estilos";
import { formatearFechaCorta } from "@/shared/lib/fechas";
import { quitarPiezaDelLanzamiento } from "./acciones";
import { FormularioFase, FormularioPiezaExistente } from "./formularios";
import { ETIQUETA_FASE, type Fase, type FilaPieza } from "./esquemas";

type PiezaLibre = { id: string; titulo: string; formato: string; fecha_prevista: string | null };

function Pieza({ lanzamientoId, pieza }: { lanzamientoId: string; pieza: FilaPieza }) {
  const porEscribir = ["borrador", "en_preparacion"].includes(pieza.estado);
  return (
    <li className="flex flex-wrap items-start justify-between gap-2 rounded-boton border border-borde px-3 py-2">
      <div className="min-w-0">
        <Link href={`/piezas/${pieza.id}`} className="font-medium hover:text-verde-700">{pieza.titulo}</Link>
        <p className="text-xs text-tinta-suave">
          {pieza.fecha_prevista ? formatearFechaCorta(pieza.fecha_prevista) : "Sin fecha"}
          {pieza.finalidad ? ` · ${ETIQUETA_FINALIDAD[pieza.finalidad as Finalidad]}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Etiqueta tono={porEscribir ? "aviso" : "verde"}>{porEscribir ? "Por escribir" : ETIQUETA_ESTADO[pieza.estado as keyof typeof ETIQUETA_ESTADO]}</Etiqueta>
        <form action={quitarPiezaDelLanzamiento.bind(null, lanzamientoId, pieza.id)}>
          <button type="submit" className={botonDiscreto}>Quitar del lanzamiento</button>
        </form>
      </div>
    </li>
  );
}

function BloqueFase({
  lanzamientoId,
  fase,
  piezas,
  piezasLibres,
}: {
  lanzamientoId: string;
  fase: Fase;
  piezas: FilaPieza[];
  piezasLibres: PiezaLibre[];
}) {
  const porEscribir = piezas.filter((p) => ["borrador", "en_preparacion"].includes(p.estado)).length;
  const fechaNueva = fase.fecha_inicio ?? "";
  const hrefNueva = `/piezas/nueva?lanzamiento=${lanzamientoId}&fase=${fase.id}${fechaNueva ? `&fecha=${fechaNueva}` : ""}`;
  return (
    <details className="rounded-tarjeta border border-borde">
      <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 p-4">
        <div>
          <p className="font-semibold">{ETIQUETA_FASE[fase.tipo]}</p>
          <p className="text-sm text-tinta-suave">
            {fase.fecha_inicio ? formatearFechaCorta(fase.fecha_inicio) : "Sin fecha"}
            {" – "}
            {fase.fecha_fin ? formatearFechaCorta(fase.fecha_fin) : "sin fecha"}
          </p>
        </div>
        <p className="text-sm text-tinta-suave">
          {piezas.length} {piezas.length === 1 ? "pieza" : "piezas"}
          {porEscribir > 0 ? ` · ${porEscribir} por escribir` : piezas.length > 0 ? " · todo escrito" : ""}
        </p>
      </summary>

      <div className="flex flex-col gap-3 border-t border-borde p-4">
        {fase.notas && <p className="text-sm text-tinta-suave">Qué se busca: {fase.notas}</p>}
        <details className="rounded-boton bg-fondo-suave p-3">
          <summary className="cursor-pointer text-sm font-medium text-verde-700">Editar la fase</summary>
          <FormularioFase lanzamientoId={lanzamientoId} fase={fase} />
        </details>

        {piezas.length === 0 ? (
          <p className="text-sm text-tinta-suave">Todavía no hay piezas en esta fase.</p>
        ) : (
          FORMATOS_PIEZA.map((formato) => {
            const delFormato = piezas.filter((p) => p.formato === formato);
            if (delFormato.length === 0) return null;
            return (
              <section key={formato}>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-tinta-suave">{ETIQUETA_FORMATO[formato as FormatoPieza]}</h3>
                <ul className="flex flex-col gap-2">
                  {delFormato.map((pieza) => <Pieza key={pieza.id} lanzamientoId={lanzamientoId} pieza={pieza} />)}
                </ul>
              </section>
            );
          })
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Link href={hrefNueva} className={botonPrincipal}>Añadir pieza nueva</Link>
        </div>
        <details className="rounded-boton bg-fondo-suave p-3">
          <summary className="cursor-pointer text-sm font-medium text-verde-700">Añadir pieza existente</summary>
          <div className="mt-3"><FormularioPiezaExistente lanzamientoId={lanzamientoId} fases={[fase]} piezas={piezasLibres} /></div>
        </details>
      </div>
    </details>
  );
}

export function Fases({
  lanzamientoId,
  fases,
  piezas,
  piezasLibres,
}: {
  lanzamientoId: string;
  fases: Fase[];
  piezas: FilaPieza[];
  piezasLibres: PiezaLibre[];
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">Fases</h2>
      {fases.map((fase) => (
        <BloqueFase
          key={fase.id}
          lanzamientoId={lanzamientoId}
          fase={fase}
          piezas={piezas.filter((p) => p.fase_id === fase.id)}
          piezasLibres={piezasLibres}
        />
      ))}
      {piezas.some((p) => !p.fase_id) && (
        <details className="rounded-tarjeta border border-borde p-4">
          <summary className="cursor-pointer font-medium">Piezas sin fase</summary>
          <ul className="mt-2 flex flex-col gap-2">
            {piezas.filter((p) => !p.fase_id).map((pieza) => <Pieza key={pieza.id} lanzamientoId={lanzamientoId} pieza={pieza} />)}
          </ul>
        </details>
      )}
    </section>
  );
}
