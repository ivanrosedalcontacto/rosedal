"use client";

import { useActionState } from "react";
import { botonPrincipal, campo } from "@/shared/components/estilos";
import { MensajeResultado, type Resultado } from "@/shared/components/mensaje-resultado";
import { crearSecuenciaDesdePlantilla, crearSecuencia, guardarComoTemplate, guardarSecuencia } from "./acciones-secuencias";
import {
  ETIQUETA_PROGRAMACION,
  ETIQUETA_TIPO_SECUENCIA,
  PROGRAMACIONES,
  TIPOS_SECUENCIA,
  type Secuencia,
} from "./esquemas";

const inicial: Resultado = { error: null };
type Opcion = { id: string; nombre: string };

function CamposSecuencia({ secuencia }: { secuencia?: Secuencia }) {
  return (
    <>
      <label className="text-sm font-medium">Nombre<input name="nombre" defaultValue={secuencia?.nombre} required className={campo} /></label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">Tipo<select name="tipo" defaultValue={secuencia?.tipo ?? "otra"} className={campo}>{TIPOS_SECUENCIA.map((t) => <option key={t} value={t}>{ETIQUETA_TIPO_SECUENCIA[t]}</option>)}</select></label>
        <label className="text-sm font-medium">Programación<select name="programacion" defaultValue={secuencia?.programacion ?? "relativa"} className={campo}>{PROGRAMACIONES.map((p) => <option key={p} value={p}>{ETIQUETA_PROGRAMACION[p]}</option>)}</select></label>
      </div>
      <label className="text-sm font-medium">A quién va dirigida<textarea name="audiencia" defaultValue={secuencia?.audiencia} rows={2} placeholder="Quien acaba de comprar el curso" className={campo} /></label>
      <label className="text-sm font-medium">Qué la inicia<input name="disparador" defaultValue={secuencia?.disparador} placeholder="La compra del curso" className={campo} /></label>
      <label className="text-sm font-medium">Qué busca conseguir<textarea name="objetivo" defaultValue={secuencia?.objetivo} rows={3} placeholder="Que empiecen el curso y conozcan la asesoría" className={campo} /></label>
    </>
  );
}

export function FormularioNuevaSecuencia({ ofertas }: { ofertas: Opcion[] }) {
  const [r, accion, pendiente] = useActionState(crearSecuencia, inicial);
  return (
    <form action={accion} className="flex flex-col gap-3 rounded-tarjeta border border-borde bg-fondo-suave p-4">
      <CamposSecuencia />
      <label className="text-sm font-medium">Oferta (opcional)<select name="oferta_id" defaultValue="" className={campo}><option value="">Sin oferta</option>{ofertas.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}</select></label>
      <MensajeResultado r={r} />
      <button type="submit" disabled={pendiente} className={botonPrincipal}>{pendiente ? "Creando…" : "Crear secuencia"}</button>
    </form>
  );
}

export function FormularioEditarSecuencia({ secuencia, ofertas }: { secuencia: Secuencia; ofertas: Opcion[] }) {
  const [r, accion, pendiente] = useActionState(guardarSecuencia.bind(null, secuencia.id), inicial);
  return (
    <form action={accion} className="flex flex-col gap-3">
      <CamposSecuencia secuencia={secuencia} />
      <label className="text-sm font-medium">Oferta (opcional)<select name="oferta_id" defaultValue={secuencia.oferta_id ?? ""} className={campo}><option value="">Sin oferta</option>{ofertas.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}</select></label>
      <MensajeResultado r={r} />
      <button type="submit" disabled={pendiente} className={botonPrincipal}>{pendiente ? "Guardando…" : "Guardar secuencia"}</button>
    </form>
  );
}

export function FormularioDesdePlantilla({ plantillas }: { plantillas: { id: string; nombre: string; descripcion: string }[] }) {
  const [r, accion, pendiente] = useActionState(crearSecuenciaDesdePlantilla, inicial);
  return (
    <details className="rounded-tarjeta border border-borde p-4">
      <summary className="cursor-pointer font-medium text-verde-700">Nueva secuencia desde plantilla</summary>
      {plantillas.length === 0 ? (
        <p className="mt-3 text-sm text-tinta-suave">Todavía no hay plantillas. Abre una secuencia y pulsa «Guardar como plantilla» para conservar su estructura sin los textos.</p>
      ) : (
        <form action={accion} className="mt-3 flex flex-col gap-3">
          <label className="text-sm font-medium">Plantilla<select name="plantilla_id" required className={campo}>{plantillas.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select></label>
          {plantillas.map((p) => p.descripcion ? <p key={p.id} className="text-xs text-tinta-suave">{p.nombre}: {p.descripcion}</p> : null)}
          <label className="text-sm font-medium">Nombre de la nueva secuencia<input name="nombre" required className={campo} /></label>
          <MensajeResultado r={r} />
          <button type="submit" disabled={pendiente} className={botonPrincipal}>{pendiente ? "Creando…" : "Crear desde plantilla"}</button>
        </form>
      )}
    </details>
  );
}

export function FormularioComoTemplate({ secuenciaId }: { secuenciaId: string }) {
  const [r, accion, pendiente] = useActionState(guardarComoTemplate.bind(null, secuenciaId), inicial);
  return (
    <details className="rounded-tarjeta border border-borde p-4">
      <summary className="cursor-pointer text-sm font-medium text-verde-700">Guardar como plantilla</summary>
      <form action={accion} className="mt-3 flex flex-col gap-2">
        <p className="text-sm text-tinta-suave">Conserva el número de pasos, los plazos, la finalidad y el propósito. No guarda los textos.</p>
        <label className="text-sm font-medium">Nombre<input name="nombre" required className={campo} /></label>
        <label className="text-sm font-medium">Descripción (opcional)<input name="descripcion" className={campo} /></label>
        <MensajeResultado r={r} />
        <button type="submit" disabled={pendiente} className={botonPrincipal}>{pendiente ? "Guardando…" : "Guardar plantilla"}</button>
      </form>
    </details>
  );
}
