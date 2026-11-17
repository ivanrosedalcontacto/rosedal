"use client";

import { useState } from "react";
import { cambiarEstadoPieza, moverPiezaEnTablero } from "./acciones";
import { ETIQUETA_ESTADO, type EstadoPieza, type VersionPieza } from "./esquemas";

/** Mover desde el tablero sin permitir saltarse fecha prevista o publicación. */
export function SelectorEstadoTablero({ piezaId, estado }: { piezaId: string; estado: EstadoPieza }) {
  async function mover(formData: FormData) {
    const destino = (formData.get("estado") ?? "").toString();
    if (destino === "borrador" || destino === "en_preparacion" || destino === "listo") {
      await moverPiezaEnTablero(piezaId, destino);
    }
  }

  return <form action={mover} className="mt-2">
    <label className="sr-only" htmlFor={`estado-${piezaId}`}>Mover a estado</label>
    <select id={`estado-${piezaId}`} name="estado" defaultValue={estado} onChange={(e) => e.currentTarget.form?.requestSubmit()} className="w-full rounded-lg border border-borde bg-fondo px-2 py-1 text-xs">
      {(["borrador", "en_preparacion", "listo"] as const).map((e) => <option key={e} value={e}>{ETIQUETA_ESTADO[e]}</option>)}
      {estado === "planificado" && <option value="planificado">Planificado · usa la ficha</option>}
      {estado === "publicado" && <option value="publicado">Publicado · usa la ficha</option>}
    </select>
  </form>;
}

/** Comparación local de dos guiones sin alterar cuál es la versión elegida. */
export function ComparadorVersiones({ versiones }: { versiones: VersionPieza[] }) {
  const [izquierda, setIzquierda] = useState(versiones[0]?.id ?? "");
  const [derecha, setDerecha] = useState(versiones[1]?.id ?? versiones[0]?.id ?? "");
  if (versiones.length < 2) return null;
  const a = versiones.find((v) => v.id === izquierda) ?? versiones[0];
  const b = versiones.find((v) => v.id === derecha) ?? versiones[1];
  return <section className="rounded-tarjeta border border-borde p-4">
    <h3 className="font-semibold">Comparar versiones</h3>
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <SelectorVersion etiqueta="Izquierda" valor={izquierda} versiones={versiones} cambiar={setIzquierda} />
      <SelectorVersion etiqueta="Derecha" valor={derecha} versiones={versiones} cambiar={setDerecha} />
    </div>
    <div className="mt-3 grid gap-4 md:grid-cols-2"><GuionComparado version={a} /><GuionComparado version={b} /></div>
  </section>;
}

function SelectorVersion({ etiqueta, valor, versiones, cambiar }: { etiqueta: string; valor: string; versiones: VersionPieza[]; cambiar: (valor: string) => void }) {
  return <label className="text-sm font-medium">{etiqueta}<select value={valor} onChange={(e) => cambiar(e.target.value)} className="mt-1 w-full rounded-lg border border-borde bg-fondo px-2 py-1">{versiones.map((v) => <option key={v.id} value={v.id}>{v.nombre}</option>)}</select></label>;
}

function GuionComparado({ version }: { version: VersionPieza }) {
  return <article className="rounded-lg bg-fondo-suave p-3 text-sm"><h4 className="font-semibold">{version.nombre}</h4><p className="mt-2 whitespace-pre-wrap"><strong>Gancho</strong>{"\n"}{version.gancho || "—"}{"\n\n"}<strong>Desarrollo</strong>{"\n"}{version.desarrollo || "—"}{"\n\n"}<strong>Cierre</strong>{"\n"}{version.cierre || "—"}</p></article>;
}

/** La confirmación evita deshacer por error una publicación y su congelado. */
export function BotonDeshacerPublicacion({ piezaId }: { piezaId: string }) {
  const [pendiente, setPendiente] = useState(false);
  async function deshacer() {
    if (!window.confirm("¿Deshacer la publicación? La pieza volverá a estar editable y se conservará la fecha real.")) return;
    setPendiente(true);
    try {
      await cambiarEstadoPieza(piezaId, "listo");
    } finally {
      setPendiente(false);
    }
  }
  return <button type="button" disabled={pendiente} onClick={deshacer} className="rounded-lg border border-borde px-3 py-1.5 text-sm text-tinta-suave">{pendiente ? "Deshaciendo…" : "Deshacer publicación"}</button>;
}
