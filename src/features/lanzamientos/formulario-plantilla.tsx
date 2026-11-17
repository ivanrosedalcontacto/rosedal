"use client";

import { useActionState, useState } from "react";
import { FINALIDADES, FORMATOS_PIEZA, ETIQUETA_FINALIDAD, ETIQUETA_FORMATO } from "@/features/piezas/esquemas";
import { botonDiscreto, botonPrincipal, campo } from "@/shared/components/estilos";
import { MensajeResultado, type Resultado } from "@/shared/components/mensaje-resultado";
import { esFecha, formatearFecha, sumarDias } from "@/shared/lib/fechas";
import { aplicarPlantilla, guardarPlantillaLanzamiento } from "./acciones-plantillas";
import {
  AYUDA_FASE,
  ETIQUETA_FASE,
  TIPOS_FASE,
  type ContenidoPlantillaLanzamiento,
  type PlantillaLanzamiento,
  type TipoFase,
} from "./esquemas";

const inicial: Resultado = { error: null };
type Opcion = { id: string; nombre: string };

type HitoEditable = ContenidoPlantillaLanzamiento["hitos"][number];
type PiezaEditable = ContenidoPlantillaLanzamiento["piezas"][number];

function contenidoInicial(plantilla?: PlantillaLanzamiento): ContenidoPlantillaLanzamiento {
  const fases = TIPOS_FASE.map((tipo) => {
    const guardada = plantilla?.contenido.fases.find((f) => f.tipo === tipo);
    return {
      tipo,
      nombre: guardada?.nombre ?? ETIQUETA_FASE[tipo],
      inicio_dias: guardada?.inicio_dias ?? 0,
      fin_dias: guardada?.fin_dias ?? 0,
      notas: guardada?.notas ?? AYUDA_FASE[tipo],
    };
  });
  return { fases, hitos: plantilla?.contenido.hitos ?? [], piezas: plantilla?.contenido.piezas ?? [] };
}

export function EditorPlantilla({ plantilla }: { plantilla?: PlantillaLanzamiento }) {
  const [contenido, setContenido] = useState<ContenidoPlantillaLanzamiento>(() => contenidoInicial(plantilla));
  const [r, accion, pendiente] = useActionState(guardarPlantillaLanzamiento.bind(null, plantilla?.id ?? null), inicial);

  function cambiarFase(indice: number, cambio: Partial<ContenidoPlantillaLanzamiento["fases"][number]>) {
    setContenido((actual) => ({
      ...actual,
      fases: actual.fases.map((fase, i) => (i === indice ? { ...fase, ...cambio } : fase)),
    }));
  }

  function cambiarHito(indice: number, cambio: Partial<HitoEditable>) {
    setContenido((actual) => ({ ...actual, hitos: actual.hitos.map((h, i) => (i === indice ? { ...h, ...cambio } : h)) }));
  }

  function cambiarPieza(indice: number, cambio: Partial<PiezaEditable>) {
    setContenido((actual) => ({ ...actual, piezas: actual.piezas.map((p, i) => (i === indice ? { ...p, ...cambio } : p)) }));
  }

  return (
    <form action={accion} className="flex flex-col gap-4 rounded-tarjeta border border-borde p-4">
      <input type="hidden" name="contenido" value={JSON.stringify(contenido)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">Nombre de la plantilla<input name="nombre" defaultValue={plantilla?.nombre} required className={campo} /></label>
        <label className="text-sm font-medium">Descripción<input name="descripcion" defaultValue={plantilla?.descripcion} className={campo} /></label>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-semibold">Fases</legend>
        <p className="text-xs text-tinta-suave">Los días se cuentan desde la apertura: el día 0 es el día en que abres.</p>
        {contenido.fases.map((fase, i) => (
          <div key={fase.tipo} className="grid gap-2 rounded-boton bg-fondo-suave p-3 sm:grid-cols-[130px_1fr_90px_90px]">
            <p className="self-center text-sm font-medium">{ETIQUETA_FASE[fase.tipo]}</p>
            <label className="text-xs">Nombre<input value={fase.nombre} onChange={(e) => cambiarFase(i, { nombre: e.target.value })} className={campo} /></label>
            <label className="text-xs">Desde (día)<input type="number" value={fase.inicio_dias} onChange={(e) => cambiarFase(i, { inicio_dias: Number(e.target.value) })} className={campo} /></label>
            <label className="text-xs">Hasta (día)<input type="number" value={fase.fin_dias} onChange={(e) => cambiarFase(i, { fin_dias: Number(e.target.value) })} className={campo} /></label>
            <label className="text-xs sm:col-span-4">Qué se busca<input value={fase.notas} onChange={(e) => cambiarFase(i, { notas: e.target.value })} className={campo} /></label>
          </div>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold">Hitos</legend>
        {contenido.hitos.map((hito, i) => (
          <div key={`hito-${i}`} className="grid gap-2 sm:grid-cols-[1fr_90px_130px_auto] sm:items-end">
            <label className="text-xs">Título<input value={hito.titulo} onChange={(e) => cambiarHito(i, { titulo: e.target.value })} className={campo} /></label>
            <label className="text-xs">Día<input type="number" value={hito.dias} onChange={(e) => cambiarHito(i, { dias: Number(e.target.value) })} className={campo} /></label>
            <label className="text-xs">Fase<select value={hito.fase} onChange={(e) => cambiarHito(i, { fase: e.target.value as TipoFase })} className={campo}>{TIPOS_FASE.map((t) => <option key={t} value={t}>{ETIQUETA_FASE[t]}</option>)}</select></label>
            <button type="button" onClick={() => setContenido((a) => ({ ...a, hitos: a.hitos.filter((_, j) => j !== i) }))} className={botonDiscreto}>Quitar</button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setContenido((a) => ({ ...a, hitos: [...a.hitos, { titulo: "Nuevo hito", dias: 0, fase: "apertura" }] }))}
          className={botonDiscreto}
        >
          + Añadir hito
        </button>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold">Piezas sugeridas</legend>
        {contenido.piezas.map((pieza, i) => (
          <div key={`pieza-${i}`} className="grid gap-2 rounded-boton bg-fondo-suave p-2 sm:grid-cols-[1fr_120px_140px_70px_120px_auto] sm:items-end">
            <label className="text-xs">Título<input value={pieza.titulo} onChange={(e) => cambiarPieza(i, { titulo: e.target.value })} className={campo} /></label>
            <label className="text-xs">Formato<select value={pieza.formato} onChange={(e) => cambiarPieza(i, { formato: e.target.value as PiezaEditable["formato"] })} className={campo}>{FORMATOS_PIEZA.map((f) => <option key={f} value={f}>{ETIQUETA_FORMATO[f]}</option>)}</select></label>
            <label className="text-xs">Finalidad<select value={pieza.finalidad ?? ""} onChange={(e) => cambiarPieza(i, { finalidad: e.target.value === "" ? null : (e.target.value as PiezaEditable["finalidad"]) })} className={campo}><option value="">Sin finalidad</option>{FINALIDADES.map((f) => <option key={f} value={f}>{ETIQUETA_FINALIDAD[f]}</option>)}</select></label>
            <label className="text-xs">Día<input type="number" value={pieza.dias} onChange={(e) => cambiarPieza(i, { dias: Number(e.target.value) })} className={campo} /></label>
            <label className="text-xs">Fase<select value={pieza.fase} onChange={(e) => cambiarPieza(i, { fase: e.target.value as TipoFase })} className={campo}>{TIPOS_FASE.map((t) => <option key={t} value={t}>{ETIQUETA_FASE[t]}</option>)}</select></label>
            <button type="button" onClick={() => setContenido((a) => ({ ...a, piezas: a.piezas.filter((_, j) => j !== i) }))} className={botonDiscreto}>Quitar</button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setContenido((a) => ({ ...a, piezas: [...a.piezas, { titulo: "Nueva pieza", formato: "reel", finalidad: "attract", dias: 0, fase: "apertura" }] }))}
          className={botonDiscreto}
        >
          + Añadir pieza sugerida
        </button>
      </fieldset>

      <MensajeResultado r={r} />
      <button type="submit" disabled={pendiente} className={botonPrincipal}>{pendiente ? "Guardando…" : "Guardar plantilla"}</button>
    </form>
  );
}

export function FormularioAplicarPlantilla({
  plantillas,
  ofertas,
}: {
  plantillas: PlantillaLanzamiento[];
  ofertas: Opcion[];
}) {
  const [r, accion, pendiente] = useActionState(aplicarPlantilla, inicial);
  const [plantillaId, setPlantillaId] = useState(plantillas[0]?.id ?? "");
  const [apertura, setApertura] = useState("");
  const elegida = plantillas.find((p) => p.id === plantillaId);

  if (plantillas.length === 0) {
    return <p className="text-sm text-tinta-suave">No hay plantillas de lanzamiento.</p>;
  }

  return (
    <form action={accion} className="flex flex-col gap-3">
      <label className="text-sm font-medium">
        Plantilla
        <select name="plantilla_id" value={plantillaId} onChange={(e) => setPlantillaId(e.target.value)} className={campo}>
          {plantillas.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
      </label>
      {elegida && <p className="text-sm text-tinta-suave">{elegida.descripcion}</p>}
      <label className="text-sm font-medium">Nombre del lanzamiento<input name="nombre" required defaultValue={elegida?.nombre} key={plantillaId} className={campo} /></label>
      <label className="text-sm font-medium">
        Oferta
        <select name="oferta_id" defaultValue="" className={campo}>
          <option value="">Sin oferta</option>
          {ofertas.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
        </select>
      </label>
      <label className="text-sm font-medium">Fecha de apertura<input name="fecha_apertura" type="date" required value={apertura} onChange={(e) => setApertura(e.target.value)} className={campo} /></label>

      {elegida && apertura && esFecha(apertura) && (
        <div className="rounded-boton bg-fondo-suave p-3 text-sm">
          <p className="font-medium">Así quedarán las fechas</p>
          <ul className="mt-2 flex flex-col gap-1">
            {elegida.contenido.fases.map((fase) => (
              <li key={fase.tipo} className="flex flex-wrap justify-between gap-2">
                <span>{fase.nombre}</span>
                <span className="text-tinta-suave">{formatearFecha(sumarDias(apertura, fase.inicio_dias))} – {formatearFecha(sumarDias(apertura, fase.fin_dias))}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-tinta-suave">Se crearán {elegida.contenido.hitos.length} hitos y {elegida.contenido.piezas.length} piezas en borrador. Todo se puede editar después.</p>
        </div>
      )}

      <MensajeResultado r={r} />
      <button type="submit" disabled={pendiente} className={botonPrincipal}>{pendiente ? "Creando…" : "Crear lanzamiento desde plantilla"}</button>
    </form>
  );
}
