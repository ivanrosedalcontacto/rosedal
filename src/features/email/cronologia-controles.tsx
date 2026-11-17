"use client";

import { useActionState } from "react";
import { botonPrincipal, campo } from "@/shared/components/estilos";
import { MensajeResultado, type Resultado } from "@/shared/components/mensaje-resultado";
import { guardarFechaPaso, guardarPlazoPaso } from "./acciones-secuencias";

const inicial: Resultado = { error: null };

export function FormularioPlazo({
  secuenciaId,
  pasoId,
  cantidad,
  unidad,
}: {
  secuenciaId: string;
  pasoId: string;
  cantidad: number | null;
  unidad: "horas" | "dias" | null;
}) {
  const [r, accion, pendiente] = useActionState(guardarPlazoPaso.bind(null, secuenciaId, pasoId), inicial);
  return (
    <form action={accion} className="flex flex-wrap items-end gap-2">
      <label className="text-sm font-medium">
        Espera
        <input name="plazo_cantidad" type="number" min={0} max={10000} defaultValue={cantidad ?? 0} className={`${campo} w-24`} />
      </label>
      <label className="text-sm font-medium">
        Unidad
        <select name="plazo_unidad" defaultValue={unidad ?? "dias"} className={`${campo} w-28`}>
          <option value="dias">días</option>
          <option value="horas">horas</option>
        </select>
      </label>
      <button type="submit" disabled={pendiente} className={botonPrincipal}>{pendiente ? "Guardando…" : "Guardar plazo"}</button>
      <MensajeResultado r={r} />
    </form>
  );
}

export function FormularioFechaPaso({
  secuenciaId,
  pasoId,
  fecha,
}: {
  secuenciaId: string;
  pasoId: string;
  fecha: string | null;
}) {
  const [r, accion, pendiente] = useActionState(guardarFechaPaso.bind(null, secuenciaId, pasoId), inicial);
  return (
    <form action={accion} className="flex flex-wrap items-end gap-2">
      <label className="text-sm font-medium">
        Fecha del paso
        <input name="fecha_prevista" type="date" defaultValue={fecha ?? ""} className={campo} />
      </label>
      <button type="submit" disabled={pendiente} className={botonPrincipal}>{pendiente ? "Guardando…" : "Guardar fecha"}</button>
      <MensajeResultado r={r} />
    </form>
  );
}
