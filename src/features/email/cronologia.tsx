import Link from "next/link";
import { ETIQUETA_ESTADO, ETIQUETA_FINALIDAD, type EstadoPieza, type Finalidad } from "@/features/piezas/esquemas";
import { Etiqueta } from "@/shared/components/etiquetas";
import { botonDiscreto, botonPrincipal } from "@/shared/components/estilos";
import { duplicarPaso, moverPaso, quitarPaso } from "./acciones-secuencias";
import { FormularioFechaPaso, FormularioPlazo } from "./cronologia-controles";
import { acumuladoPlazo, textoPlazo, type Secuencia } from "./esquemas";
import { formatearFecha } from "@/shared/lib/fechas";

export type PiezaPaso = {
  id: string;
  titulo: string;
  estado: string;
  finalidad: string | null;
  fecha_prevista: string | null;
  email_preview: string | null;
};

export type FilaPaso = {
  id: string;
  pieza_id: string;
  orden: number;
  plazo_cantidad: number | null;
  plazo_unidad: "horas" | "dias" | null;
  piezas: PiezaPaso | PiezaPaso[] | null;
};

export type PasoConPieza = FilaPaso & { pieza: PiezaPaso };

export function piezaDelPaso(fila: FilaPaso): PiezaPaso | null {
  return Array.isArray(fila.piezas) ? fila.piezas[0] ?? null : fila.piezas;
}

function etiquetaEstado(estado: string, enMarcha: boolean): string {
  if (estado === "publicado") return enMarcha ? "En marcha" : "Enviado";
  return ETIQUETA_ESTADO[estado as EstadoPieza] ?? estado;
}

function plazoDelPaso(pasos: FilaPaso[], indice: number): string {
  const paso = pasos[indice];
  if (!paso) return "Sin plazo";
  if (indice === 0) {
    if (paso.plazo_cantidad == null) return "Sin plazo";
    if (paso.plazo_cantidad === 0) return "Inmediatamente";
    return textoPlazo(paso.plazo_cantidad, paso.plazo_unidad).replace("después del anterior", "después del disparador");
  }
  return textoPlazo(paso.plazo_cantidad, paso.plazo_unidad);
}

export function Cronologia({
  secuencia,
  pasos,
  asuntoPorPieza,
}: {
  secuencia: Secuencia;
  pasos: PasoConPieza[];
  asuntoPorPieza: Map<string, string>;
}) {
  if (pasos.length === 0) {
    return <p className="rounded-tarjeta bg-verde-50 p-5 text-tinta-suave">Todavía no hay pasos. Añade el primero debajo.</p>;
  }
  return (
    <ol className="flex flex-col gap-0 border-l-2 border-borde pl-5">
      {pasos.map((paso, i) => (
        <Paso
          key={paso.id}
          secuencia={secuencia}
          pasos={pasos}
          paso={paso}
          indice={i}
          asunto={asuntoPorPieza.get(paso.pieza_id) ?? ""}
        />
      ))}
    </ol>
  );
}

function Paso({
  secuencia,
  pasos,
  paso,
  indice,
  asunto,
}: {
  secuencia: Secuencia;
  pasos: PasoConPieza[];
  paso: PasoConPieza;
  indice: number;
  asunto: string;
}) {
  const pieza = paso.pieza;
  const relativa = secuencia.programacion === "relativa";
  const enMarcha = relativa && pieza.estado === "publicado";
  const acumulado = relativa
    ? acumuladoPlazo(pasos, indice).replace("tras el disparador", secuencia.disparador ? `tras «${secuencia.disparador}»` : "tras el disparador")
    : "";
  return (
    <li className="relative pb-6">
      <span aria-hidden className="absolute -left-[27px] top-2 h-3 w-3 rounded-full border-2 border-fondo bg-verde-300" />
      <article className="rounded-tarjeta border border-borde p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-tinta-suave">Paso {indice + 1}</p>
            <p className="mt-1 font-medium">{asunto || "Sin asunto"}</p>
            <p className="text-sm text-tinta-suave">{pieza.titulo}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {pieza.finalidad && <Etiqueta>{ETIQUETA_FINALIDAD[pieza.finalidad as Finalidad]}</Etiqueta>}
            <Etiqueta tono={pieza.estado === "publicado" ? "verde" : "neutro"}>{etiquetaEstado(pieza.estado, enMarcha)}</Etiqueta>
          </div>
        </div>
        {pieza.email_preview && <p className="mt-2 line-clamp-1 text-sm text-tinta-suave">{pieza.email_preview}</p>}
        <div className="mt-3 rounded-boton bg-fondo-suave p-3">
          {relativa ? (
            <>
              <p className="text-sm font-medium">{plazoDelPaso(pasos, indice)}</p>
              <p className="text-xs text-tinta-suave">{acumulado}</p>
              <div className="mt-2"><FormularioPlazo secuenciaId={secuencia.id} pasoId={paso.id} cantidad={paso.plazo_cantidad} unidad={paso.plazo_unidad} /></div>
            </>
          ) : (
            <>
              <p className="text-sm font-medium">{pieza.fecha_prevista ? formatearFecha(pieza.fecha_prevista) : "Sin fecha todavía"}</p>
              <div className="mt-2"><FormularioFechaPaso secuenciaId={secuencia.id} pasoId={paso.id} fecha={pieza.fecha_prevista} /></div>
            </>
          )}
        </div>
        <AccionesPaso secuenciaId={secuencia.id} pasoId={paso.id} piezaId={paso.pieza_id} primera={indice === 0} ultima={indice === pasos.length - 1} />
      </article>
    </li>
  );
}

function AccionesPaso({
  secuenciaId,
  pasoId,
  piezaId,
  primera,
  ultima,
}: {
  secuenciaId: string;
  pasoId: string;
  piezaId: string;
  primera: boolean;
  ultima: boolean;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1">
      <Link href={`/piezas/${piezaId}`} className={botonPrincipal}>Abrir correo</Link>
      <form action={moverPaso.bind(null, secuenciaId, pasoId, "subir")}><button disabled={primera} className={botonDiscreto}>Subir</button></form>
      <form action={moverPaso.bind(null, secuenciaId, pasoId, "bajar")}><button disabled={ultima} className={botonDiscreto}>Bajar</button></form>
      <form action={duplicarPaso.bind(null, secuenciaId, pasoId)}><button className={botonDiscreto}>Duplicar paso</button></form>
      <form action={quitarPaso.bind(null, secuenciaId, pasoId)}><button className={botonDiscreto}>Quitar de la secuencia</button></form>
    </div>
  );
}
