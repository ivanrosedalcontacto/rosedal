"use client";

import { useActionState } from "react";
import { MensajeResultado, type Resultado } from "@/shared/components/mensaje-resultado";
import { botonPrincipal, campo } from "@/shared/components/estilos";
import { crearSesion } from "@/features/stories/acciones";

const inicial: Resultado = { error: null };
type PiezaElegible = { id: string; titulo: string; formato: string; duracion_seg: number | null };

export function FormularioSesion({ piezas }: { piezas: PiezaElegible[] }) {
  const [r, accion, pendiente] = useActionState(crearSesion, inicial);
  return <form action={accion} className="flex flex-col gap-3 rounded-tarjeta border border-borde bg-fondo-suave p-4">
    <label className="text-sm font-medium">Nombre<input name="nombre" required placeholder="Grabación de reels" className={campo} /></label>
    <label className="text-sm font-medium">Fecha (opcional)<input name="fecha" type="date" className={campo} /></label>
    <label className="text-sm font-medium">Notas<textarea name="notas" rows={2} className={campo} /></label>
    <fieldset><legend className="text-sm font-medium">Piezas con guion pendientes de grabar</legend>{piezas.length === 0 ? <p className="mt-2 text-sm text-tinta-suave">No hay piezas disponibles.</p> : <div className="mt-2 max-h-56 space-y-2 overflow-y-auto">{piezas.map((p) => <label key={p.id} className="flex gap-2 text-sm"><input type="checkbox" name="pieza_ids" value={p.id} /><span>{p.titulo} · {p.formato}{p.duracion_seg ? ` · ${p.duracion_seg} s` : ""}</span></label>)}</div>}</fieldset>
    <MensajeResultado r={r} /><button disabled={pendiente} className={botonPrincipal}>{pendiente ? "Creando…" : "Crear sesión"}</button>
  </form>;
}
