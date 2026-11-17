"use client";

import Link from "next/link";
import { useActionState } from "react";
import { botonPrincipal, campo } from "@/shared/components/estilos";
import { MensajeResultado, type Resultado } from "@/shared/components/mensaje-resultado";
import { convertirIdeaEnPaso } from "./acciones";

const inicial: Resultado = { error: null };

export function FormularioPasoEmail({
  ideaId,
  secuencias,
}: {
  ideaId: string;
  secuencias: { id: string; nombre: string }[];
}) {
  const [r, accion, pendiente] = useActionState(convertirIdeaEnPaso.bind(null, ideaId), inicial);
  if (secuencias.length === 0) {
    return (
      <p className="text-sm text-tinta-suave">
        Para convertirla en paso, crea antes una <Link href="/email?vista=secuencias" className="text-verde-700">secuencia</Link>.
      </p>
    );
  }
  return (
    <form action={accion} className="flex flex-col gap-2 rounded-tarjeta bg-fondo-suave p-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_120px]">
        <label className="text-sm font-medium">
          Secuencia
          <select name="secuencia_id" required className={campo}>
            {secuencias.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">
          Posición
          <input name="posicion" type="number" min={1} max={100} defaultValue={1} className={campo} />
        </label>
      </div>
      <MensajeResultado r={r} />
      <button type="submit" disabled={pendiente} className={botonPrincipal}>
        {pendiente ? "Creando el paso…" : "Convertir en paso de secuencia"}
      </button>
    </form>
  );
}
