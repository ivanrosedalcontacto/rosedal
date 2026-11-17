"use client";

import { useActionState } from "react";
import { botonPrincipal, campo } from "@/shared/components/estilos";
import { MensajeResultado, type Resultado } from "@/shared/components/mensaje-resultado";
import { anadirPasoExistente } from "./acciones-secuencias";
import type { Programacion } from "./esquemas";

const inicial: Resultado = { error: null };
type CorreoOpcion = { id: string; titulo: string; estado: string };

export function FormularioPasoExistente({
  secuenciaId,
  correos,
  programacion,
}: {
  secuenciaId: string;
  correos: CorreoOpcion[];
  programacion: Programacion;
}) {
  const [r, accion, pendiente] = useActionState(anadirPasoExistente.bind(null, secuenciaId), inicial);
  if (correos.length === 0) {
    return <p className="text-sm text-tinta-suave">No hay correos libres para incorporar. Escribe uno nuevo.</p>;
  }
  const relativa = programacion === "relativa";
  return (
    <form action={accion} className="flex flex-col gap-3">
      <label className="text-sm font-medium">
        Correo existente
        <select name="pieza_id" required className={campo}>
          {correos.map((c) => <option key={c.id} value={c.id}>{c.titulo} · {c.estado}</option>)}
        </select>
      </label>
      {!relativa && (
        <label className="text-sm font-medium">
          Fecha del paso (opcional)
          <input name="fecha_prevista" type="date" className={campo} />
        </label>
      )}
      <p className="rounded-boton bg-verde-50 px-3 py-2 text-sm text-tinta-suave">
        {relativa
          ? "En una secuencia de plazos relativos se crea una copia enlazada: un correo fechado o enviado no puede ser también un paso automático."
          : "En una secuencia de fechas fijas se enlaza el mismo correo. Al editarlo en un sitio se ve en el otro."}
      </p>
      <MensajeResultado r={r} />
      <button type="submit" disabled={pendiente} className={botonPrincipal}>{pendiente ? "Incorporando…" : "Incorporar correo existente"}</button>
    </form>
  );
}
