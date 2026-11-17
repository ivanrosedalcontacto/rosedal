"use client";

import { useActionState } from "react";
import { botonPrincipal, campo } from "@/shared/components/estilos";
import { MensajeResultado } from "@/shared/components/mensaje-resultado";
import { crearPregunta } from "./acciones";

type Opcion = { id: string; nombre: string };

/** Alta de preguntas y objeciones con las palabras de la audiencia. */
export function FormularioPregunta({ ofertas }: { ofertas: Opcion[] }) {
  const [r, accion, pendiente] = useActionState(crearPregunta, { error: null });
  return (
    <form action={accion} className="flex flex-col gap-3">
      <label className="text-sm font-medium">
        Tipo
        <select name="tipo" defaultValue="pregunta" className={campo}>
          <option value="pregunta">Pregunta</option>
          <option value="objecion">Objeción</option>
        </select>
      </label>
      <label className="text-sm font-medium">
        Sus palabras, tal como te las dijeron
        <textarea name="palabras" rows={2} placeholder="¿Cómo sé si me basta con el curso o necesito una asesoría?" className={campo} />
      </label>
      <label className="text-sm font-medium">
        Procedencia (opcional)
        <input name="procedencia" placeholder="Mensaje privado de Instagram, llamada con clienta…" className={campo} />
      </label>
      <label className="text-sm font-medium">
        Oferta relacionada (opcional)
        <select name="oferta_id" defaultValue="" className={campo}>
          <option value="">Ninguna</option>
          {ofertas.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nombre}
            </option>
          ))}
        </select>
      </label>
      <MensajeResultado r={r} />
      <button type="submit" disabled={pendiente} className={botonPrincipal}>
        Guardar
      </button>
    </form>
  );
}
