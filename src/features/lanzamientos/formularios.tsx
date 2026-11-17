"use client";

import { useActionState } from "react";
import { botonPrincipal, campo } from "@/shared/components/estilos";
import { MensajeResultado, type Resultado } from "@/shared/components/mensaje-resultado";
import { asignarPieza, cambiarEstadoLanzamiento, crearHito, crearLanzamiento, eliminarLanzamiento, guardarFase, guardarHito, guardarLanzamiento } from "./acciones";
import {
  ESTADOS_LANZAMIENTO,
  ETIQUETA_ESTADO_LANZAMIENTO,
  ETIQUETA_FASE,
  type EstadoLanzamiento,
  type Fase,
  type Hito,
  type Lanzamiento,
} from "./esquemas";

const inicial: Resultado = { error: null };
type Opcion = { id: string; nombre: string };

function CamposLanzamiento({ lanzamiento, ofertas }: { lanzamiento?: Lanzamiento; ofertas: Opcion[] }) {
  return (
    <>
      <label className="text-sm font-medium">Nombre<input name="nombre" defaultValue={lanzamiento?.nombre} required className={campo} /></label>
      <label className="text-sm font-medium">
        Oferta
        <select name="oferta_id" defaultValue={lanzamiento?.oferta_id ?? ""} className={campo}>
          <option value="">Sin oferta</option>
          {ofertas.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
        </select>
      </label>
      <label className="text-sm font-medium">Objetivo<textarea name="objetivo" defaultValue={lanzamiento?.objetivo} rows={2} placeholder="Vender 20 plazas del curso" className={campo} /></label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">Inicio<input name="fecha_inicio" type="date" defaultValue={lanzamiento?.fecha_inicio ?? ""} className={campo} /></label>
        <label className="text-sm font-medium">Fin<input name="fecha_fin" type="date" defaultValue={lanzamiento?.fecha_fin ?? ""} className={campo} /></label>
      </div>
      <label className="text-sm font-medium">
        Estado
        <select name="estado" defaultValue={lanzamiento?.estado ?? "en_preparacion"} className={campo}>
          {ESTADOS_LANZAMIENTO.map((e) => <option key={e} value={e}>{ETIQUETA_ESTADO_LANZAMIENTO[e]}</option>)}
        </select>
      </label>
    </>
  );
}

export function FormularioNuevoLanzamiento({ ofertas }: { ofertas: Opcion[] }) {
  const [r, accion, pendiente] = useActionState(crearLanzamiento, inicial);
  return (
    <form action={accion} className="flex flex-col gap-3 rounded-tarjeta border border-borde bg-fondo-suave p-4">
      <CamposLanzamiento ofertas={ofertas} />
      <MensajeResultado r={r} />
      <button type="submit" disabled={pendiente} className={botonPrincipal}>{pendiente ? "Creando…" : "Crear lanzamiento"}</button>
    </form>
  );
}

export function FormularioEditarLanzamiento({ lanzamiento, ofertas }: { lanzamiento: Lanzamiento; ofertas: Opcion[] }) {
  const [r, accion, pendiente] = useActionState(guardarLanzamiento.bind(null, lanzamiento.id), inicial);
  return (
    <form action={accion} className="flex flex-col gap-3">
      <CamposLanzamiento lanzamiento={lanzamiento} ofertas={ofertas} />
      <MensajeResultado r={r} />
      <button type="submit" disabled={pendiente} className={botonPrincipal}>{pendiente ? "Guardando…" : "Guardar lanzamiento"}</button>
    </form>
  );
}

export function FormularioFase({ lanzamientoId, fase }: { lanzamientoId: string; fase: Fase }) {
  const [r, accion, pendiente] = useActionState(guardarFase.bind(null, lanzamientoId, fase.id), inicial);
  return (
    <form action={accion} className="mt-3 flex flex-col gap-2">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-sm font-medium">Nombre<input name="nombre" defaultValue={fase.nombre} required className={campo} /></label>
        <label className="text-sm font-medium">Qué se busca<textarea name="notas" defaultValue={fase.notas} rows={1} className={campo} /></label>
        <label className="text-sm font-medium">Empieza<input name="fecha_inicio" type="date" defaultValue={fase.fecha_inicio ?? ""} className={campo} /></label>
        <label className="text-sm font-medium">Termina<input name="fecha_fin" type="date" defaultValue={fase.fecha_fin ?? ""} className={campo} /></label>
      </div>
      <MensajeResultado r={r} />
      <button type="submit" disabled={pendiente} className={botonPrincipal}>{pendiente ? "Guardando…" : "Guardar fase"}</button>
    </form>
  );
}

export function FormularioHito({ lanzamientoId, fases }: { lanzamientoId: string; fases: Fase[] }) {
  const [r, accion, pendiente] = useActionState(crearHito.bind(null, lanzamientoId), inicial);
  return (
    <form action={accion} className="grid gap-2 sm:grid-cols-[1fr_150px_150px_auto] sm:items-end">
      <label className="text-sm font-medium">Hito<input name="titulo" required placeholder="Abrir inscripciones" className={campo} /></label>
      <label className="text-sm font-medium">Fecha<input name="fecha" type="date" required className={campo} /></label>
      <label className="text-sm font-medium">
        Fase
        <select name="fase_id" defaultValue="" className={campo}>
          <option value="">Sin fase</option>
          {fases.map((f) => <option key={f.id} value={f.id}>{ETIQUETA_FASE[f.tipo]}</option>)}
        </select>
      </label>
      <button type="submit" disabled={pendiente} className={botonPrincipal}>{pendiente ? "Añadiendo…" : "Añadir hito"}</button>
      {r.error && <div className="sm:col-span-4"><MensajeResultado r={r} /></div>}
    </form>
  );
}

export function FormularioPiezaExistente({
  lanzamientoId,
  fases,
  piezas,
}: {
  lanzamientoId: string;
  fases: Fase[];
  piezas: { id: string; titulo: string; formato: string; fecha_prevista: string | null }[];
}) {
  const [r, accion, pendiente] = useActionState(
    (_p: Resultado, d: FormData) => asignarPieza(lanzamientoId, (d.get("fase_id") ?? "").toString(), _p, d),
    inicial,
  );
  if (piezas.length === 0) {
    return <p className="text-sm text-tinta-suave">No hay piezas libres. Las que ya están en un lanzamiento se cambian desde su ficha.</p>;
  }
  return (
    <form action={accion} className="flex flex-col gap-3">
      <label className="text-sm font-medium">
        Pieza
        <select name="pieza_id" required className={campo}>
          {piezas.map((p) => <option key={p.id} value={p.id}>{p.titulo} · {p.formato}</option>)}
        </select>
      </label>
      <label className="text-sm font-medium">
        Fase
        <select name="fase_id" required className={campo} defaultValue={fases[0]?.id ?? ""}>
          {fases.map((f) => <option key={f.id} value={f.id}>{ETIQUETA_FASE[f.tipo]}</option>)}
        </select>
      </label>
      <label className="text-sm font-medium">Fecha dentro de la fase (opcional)<input name="fecha_prevista" type="date" className={campo} /></label>
      <MensajeResultado r={r} />
      <button type="submit" disabled={pendiente} className={botonPrincipal}>{pendiente ? "Añadiendo…" : "Añadir al lanzamiento"}</button>
    </form>
  );
}

export function FormularioEditarHito({ lanzamientoId, hito, fases }: { lanzamientoId: string; hito: Hito; fases: Fase[] }) {
  const [r, accion, pendiente] = useActionState(guardarHito.bind(null, lanzamientoId, hito.id), inicial);
  return (
    <form action={accion} className="grid gap-2 sm:grid-cols-[1fr_150px_150px_auto] sm:items-end">
      <label className="text-sm font-medium">Título<input name="titulo" defaultValue={hito.titulo} required className={campo} /></label>
      <label className="text-sm font-medium">Fecha<input name="fecha" type="date" defaultValue={hito.fecha} required className={campo} /></label>
      <label className="text-sm font-medium">
        Fase
        <select name="fase_id" defaultValue={hito.fase_id ?? ""} className={campo}>
          <option value="">Sin fase</option>
          {fases.map((f) => <option key={f.id} value={f.id}>{ETIQUETA_FASE[f.tipo]}</option>)}
        </select>
      </label>
      <button type="submit" disabled={pendiente} className={botonPrincipal}>{pendiente ? "Guardando…" : "Guardar hito"}</button>
      {r.error && <div className="sm:col-span-4"><MensajeResultado r={r} /></div>}
    </form>
  );
}

export function SelectorEstadoLanzamiento({ lanzamientoId, estado }: { lanzamientoId: string; estado: EstadoLanzamiento }) {
  return (
    <form
      action={async (d) => {
        await cambiarEstadoLanzamiento(lanzamientoId, (d.get("estado") ?? "").toString());
      }}
    >
      <label className="text-sm font-medium">
        Estado
        <select
          name="estado"
          defaultValue={estado}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className={campo}
        >
          {ESTADOS_LANZAMIENTO.map((e) => <option key={e} value={e}>{ETIQUETA_ESTADO_LANZAMIENTO[e]}</option>)}
        </select>
      </label>
      <noscript><button type="submit" className={botonPrincipal}>Cambiar estado</button></noscript>
    </form>
  );
}

export function BotonEliminarLanzamiento({ lanzamientoId, nombre }: { lanzamientoId: string; nombre: string }) {
  return (
    <form
      action={async () => {
        if (window.confirm(`¿Eliminar «${nombre}»? Sus piezas se quedan en la biblioteca, sin lanzamiento.`)) {
          await eliminarLanzamiento(lanzamientoId);
        }
      }}
    >
      <button type="submit" className="min-h-11 px-2 text-sm text-error">Eliminar lanzamiento</button>
    </form>
  );
}
