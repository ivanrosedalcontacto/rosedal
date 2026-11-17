"use client";

import { useActionState } from "react";
import { MensajeResultado, type Resultado } from "@/shared/components/mensaje-resultado";
import { botonPrincipal, campo } from "@/shared/components/estilos";
import { crearPiezaDesdePlantillaStories } from "./acciones";

const inicial: Resultado = { error: null };

/** Crear una pieza de stories a partir de una plantilla. */
export function FormularioDesdePlantillaStories({
  plantillas,
}: {
  plantillas: { id: string; nombre: string; descripcion: string }[];
}) {
  const [r, accion, pendiente] = useActionState(crearPiezaDesdePlantillaStories, inicial);
  if (plantillas.length === 0) {
    return <p className="text-sm text-tinta-suave">No hay plantillas de stories.</p>;
  }
  return (
    <form action={accion} className="flex flex-col gap-3 rounded-tarjeta border border-borde bg-fondo-suave p-4">
      <label className="text-sm font-medium">
        Plantilla
        <select name="plantilla_id" required className={campo}>
          {plantillas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium">
        Título de la pieza
        <input name="titulo" required placeholder="Curso o asesoría: os leo" className={campo} />
      </label>
      <MensajeResultado r={r} />
      <button type="submit" disabled={pendiente} className={botonPrincipal}>
        {pendiente ? "Creando…" : "Crear desde la plantilla"}
      </button>
    </form>
  );
}
