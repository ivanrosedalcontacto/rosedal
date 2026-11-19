"use client";

import { useActionState } from "react";
import { MensajeResultado, type Resultado } from "@/shared/components/mensaje-resultado";
import { botonPrincipal, campo } from "@/shared/components/estilos";
import { guardarRitmo } from "./acciones-extra";

const inicial: Resultado = { error: null };

/** Ritmo semanal (B2): cuánto quiere publicar por semana. Solo informa. */
export function RitmoSemanal({ ritmo }: { ritmo: { reels: number; correos: number; posts: number } }) {
  const [r, accion, pendiente] = useActionState(guardarRitmo, inicial);
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-semibold">Ritmo semanal</h2>
        <p className="mt-1 text-sm text-tinta-suave">
          Opcional. Si lo dejas vacío, la app no dice nada. Con ello, Hoy y el calendario muestran el avance.
        </p>
      </div>
      <form action={accion} className="grid gap-3 rounded-tarjeta border border-borde bg-fondo-suave p-3 sm:grid-cols-[repeat(3,1fr)_auto] sm:items-end">
        <label className="text-sm font-medium">
          Reels por semana
          <input name="reels" type="number" min={0} max={50} defaultValue={ritmo.reels} className={campo} />
        </label>
        <label className="text-sm font-medium">
          Correos por semana
          <input name="correos" type="number" min={0} max={50} defaultValue={ritmo.correos} className={campo} />
        </label>
        <label className="text-sm font-medium">
          Publicaciones por semana
          <input name="posts" type="number" min={0} max={50} defaultValue={ritmo.posts} className={campo} />
        </label>
        <button type="submit" disabled={pendiente} className={botonPrincipal}>
          Guardar
        </button>
      </form>
      <MensajeResultado r={r} />
    </section>
  );
}
