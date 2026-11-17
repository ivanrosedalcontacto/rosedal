"use client";

import { useActionState, useState } from "react";
import { FINALIDADES, ETIQUETA_FINALIDAD, type Finalidad } from "@/features/piezas/esquemas";
import { MensajeResultado, type Resultado } from "@/shared/components/mensaje-resultado";
import { botonDiscreto, botonPrincipal, campo } from "@/shared/components/estilos";
import { guardarPlantillaSecuencia, guardarPlantillaStories } from "./acciones";
import type { PasoSecuencia, TarjetaStories } from "./esquemas";

const inicial: Resultado = { error: null };

/** Editor de una plantilla de secuencia de correo: pasos, plazos y finalidad. */
export function EditorPlantillaSecuencia({
  plantilla,
}: {
  plantilla?: { id: string; nombre: string; descripcion: string; contenido: { tipo: string; programacion: string; pasos: PasoSecuencia[] } };
}) {
  const [r, accion, pendiente] = useActionState(guardarPlantillaSecuencia.bind(null, plantilla?.id ?? null), inicial);
  const [contenido, setContenido] = useState(() => ({
    tipo: plantilla?.contenido.tipo ?? "bienvenida",
    programacion: plantilla?.contenido.programacion ?? "relativa",
    pasos: plantilla?.contenido.pasos ?? [],
  }));

  function cambiarPaso(indice: number, cambio: Partial<PasoSecuencia>) {
    setContenido((actual) => ({
      ...actual,
      pasos: actual.pasos.map((paso, i) => (i === indice ? { ...paso, ...cambio } : paso)),
    }));
  }

  return (
    <form action={accion} className="flex flex-col gap-4 rounded-tarjeta border border-borde p-4">
      <input type="hidden" name="contenido" value={JSON.stringify(contenido)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Nombre de la plantilla
          <input name="nombre" defaultValue={plantilla?.nombre} required className={campo} />
        </label>
        <label className="text-sm font-medium">
          Descripción
          <input name="descripcion" defaultValue={plantilla?.descripcion} className={campo} />
        </label>
        <label className="text-sm font-medium">
          Tipo
          <select
            name="tipo"
            value={contenido.tipo}
            onChange={(e) => setContenido((a) => ({ ...a, tipo: e.target.value }))}
            className={campo}
          >
            <option value="bienvenida">Bienvenida</option>
            <option value="lanzamiento">Lanzamiento</option>
            <option value="poscompra">Poscompra</option>
            <option value="upsell">Upsell</option>
            <option value="otra">Otra</option>
          </select>
        </label>
        <label className="text-sm font-medium">
          Programación
          <select
            name="programacion"
            value={contenido.programacion}
            onChange={(e) => setContenido((a) => ({ ...a, programacion: e.target.value }))}
            className={campo}
          >
            <option value="relativa">Plazos relativos</option>
            <option value="fechas">Fechas fijas</option>
          </select>
        </label>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold">Pasos</legend>
        {contenido.pasos.map((paso, i) => (
          <div key={`paso-${i}`} className="grid gap-2 rounded-boton bg-fondo-suave p-2 sm:grid-cols-[1fr_150px_90px_110px_auto] sm:items-end">
            <label className="text-xs">
              Para qué
              <input value={paso.proposito} onChange={(e) => cambiarPaso(i, { proposito: e.target.value })} className={campo} />
            </label>
            <label className="text-xs">
              Finalidad
              <select
                value={paso.finalidad ?? ""}
                onChange={(e) => cambiarPaso(i, { finalidad: e.target.value === "" ? null : (e.target.value as Finalidad) })}
                className={campo}
              >
                <option value="">Sin finalidad</option>
                {FINALIDADES.map((f) => (
                  <option key={f} value={f}>
                    {ETIQUETA_FINALIDAD[f].split(" · ")[0]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs">
              Días
              <input
                type="number"
                value={paso.plazo_cantidad ?? ""}
                onChange={(e) => cambiarPaso(i, { plazo_cantidad: e.target.value === "" ? null : Number(e.target.value) })}
                className={campo}
              />
            </label>
            <label className="text-xs">
              Unidad
              <select
                value={paso.plazo_unidad ?? ""}
                onChange={(e) => cambiarPaso(i, { plazo_unidad: e.target.value === "" ? null : (e.target.value as "horas" | "dias") })}
                className={campo}
              >
                <option value="">Fecha fija</option>
                <option value="horas">Horas</option>
                <option value="dias">Días</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => setContenido((a) => ({ ...a, pasos: a.pasos.filter((_, j) => j !== i) }))}
              className={botonDiscreto}
            >
              Quitar
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setContenido((a) => ({
              ...a,
              pasos: [...a.pasos, { finalidad: "nurture", plazo_cantidad: 3, plazo_unidad: "dias", proposito: "Nuevo paso" }],
            }))
          }
          className={botonDiscreto}
        >
          + Añadir paso
        </button>
      </fieldset>

      <MensajeResultado r={r} />
      <button type="submit" disabled={pendiente} className={botonPrincipal}>
        {pendiente ? "Guardando…" : "Guardar plantilla"}
      </button>
    </form>
  );
}

/** Editor de una plantilla de stories: sus tarjetas. */
export function EditorPlantillaStories({
  plantilla,
}: {
  plantilla?: { id: string; nombre: string; descripcion: string; contenido: { tarjetas: TarjetaStories[] } };
}) {
  const [r, accion, pendiente] = useActionState(guardarPlantillaStories.bind(null, plantilla?.id ?? null), inicial);
  const [contenido, setContenido] = useState(() => ({ tarjetas: plantilla?.contenido.tarjetas ?? [] }));

  function cambiarTarjeta(indice: number, cambio: Partial<TarjetaStories>) {
    setContenido((actual) => ({
      ...actual,
      tarjetas: actual.tarjetas.map((t, i) => (i === indice ? { ...t, ...cambio } : t)),
    }));
  }

  return (
    <form action={accion} className="flex flex-col gap-4 rounded-tarjeta border border-borde p-4">
      <input type="hidden" name="contenido" value={JSON.stringify(contenido)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Nombre de la plantilla
          <input name="nombre" defaultValue={plantilla?.nombre} required className={campo} />
        </label>
        <label className="text-sm font-medium">
          Descripción
          <input name="descripcion" defaultValue={plantilla?.descripcion} className={campo} />
        </label>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold">Tarjetas</legend>
        {contenido.tarjetas.map((tarjeta, i) => (
          <div key={`tarjeta-${i}`} className="grid gap-2 rounded-boton bg-fondo-suave p-2 sm:grid-cols-[1fr_1fr_1fr_130px_auto] sm:items-end">
            <label className="text-xs">
              Título
              <input value={tarjeta.titulo} onChange={(e) => cambiarTarjeta(i, { titulo: e.target.value })} className={campo} />
            </label>
            <label className="text-xs">
              Qué digo
              <input value={tarjeta.que_digo} onChange={(e) => cambiarTarjeta(i, { que_digo: e.target.value })} className={campo} />
            </label>
            <label className="text-xs">
              Texto en pantalla
              <input
                value={tarjeta.texto_pantalla}
                onChange={(e) => cambiarTarjeta(i, { texto_pantalla: e.target.value })}
                className={campo}
              />
            </label>
            <label className="text-xs">
              Elemento
              <select
                value={tarjeta.interaccion}
                onChange={(e) => cambiarTarjeta(i, { interaccion: e.target.value as TarjetaStories["interaccion"] })}
                className={campo}
              >
                <option value="ninguna">Ninguno</option>
                <option value="encuesta">Encuesta</option>
                <option value="pregunta">Pregunta</option>
                <option value="enlace">Enlace</option>
                <option value="cta">CTA</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => setContenido((a) => ({ ...a, tarjetas: a.tarjetas.filter((_, j) => j !== i) }))}
              className={botonDiscreto}
            >
              Quitar
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setContenido((a) => ({
              ...a,
              tarjetas: [...a.tarjetas, { titulo: "Nueva tarjeta", que_digo: "", texto_pantalla: "", interaccion: "ninguna", interaccion_detalle: "" }],
            }))
          }
          className={botonDiscreto}
        >
          + Añadir tarjeta
        </button>
      </fieldset>

      <MensajeResultado r={r} />
      <button type="submit" disabled={pendiente} className={botonPrincipal}>
        {pendiente ? "Guardando…" : "Guardar plantilla"}
      </button>
    </form>
  );
}
