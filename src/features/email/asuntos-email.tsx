"use client";

import { useActionState, useState } from "react";
import { Etiqueta } from "@/shared/components/etiquetas";
import { botonDiscreto, botonPrincipal, campo } from "@/shared/components/estilos";
import { MensajeResultado, type Resultado } from "@/shared/components/mensaje-resultado";
import { borrarAsunto, crearAsunto, elegirAsunto, guardarAsunto } from "./acciones";
import type { Asunto } from "./esquemas";

const inicial: Resultado = { error: null };

export function AsuntosEmail({ piezaId, asuntos, bloqueado }: { piezaId: string; asuntos: Asunto[]; bloqueado: boolean }) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-xl font-semibold">Asuntos</h2>
        <p className="text-sm text-tinta-suave">Prueba varias líneas y elige la que vas a enviar.</p>
      </div>
      {asuntos.length === 0 && <p className="rounded-tarjeta bg-verde-50 p-4 text-sm text-tinta-suave">Todavía no hay asuntos. Añade el primero y quedará elegido.</p>}
      <ul className="flex flex-col gap-3">
        {asuntos.map((asunto) => (
          <FilaAsunto key={asunto.id} piezaId={piezaId} asunto={asunto} bloqueado={bloqueado} />
        ))}
      </ul>
      {!bloqueado && (
        <details className="rounded-tarjeta border border-borde p-3">
          <summary className="cursor-pointer text-sm font-medium text-verde-700">Añadir otro asunto</summary>
          <div className="mt-3">
            <FormularioNuevoAsunto piezaId={piezaId} />
          </div>
        </details>
      )}
    </section>
  );
}

function FilaAsunto({ piezaId, asunto, bloqueado }: { piezaId: string; asunto: Asunto; bloqueado: boolean }) {
  const [texto, setTexto] = useState(asunto.asunto);
  const [r, accion, pendiente] = useActionState(guardarAsunto.bind(null, piezaId, asunto.id), inicial);
  return (
    <li>
      <form action={accion} className="flex flex-col gap-2 rounded-tarjeta border border-borde p-3">
        <input
          name="asunto"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={200}
          disabled={bloqueado}
          aria-label="Asunto del correo"
          className="w-full rounded-boton border border-borde bg-fondo px-3 py-2.5"
        />
        <div className="flex flex-wrap items-center gap-2 text-xs text-tinta-suave">
          <span>{texto.length}/50 caracteres</span>
          {asunto.elegida ? <Etiqueta tono="verde">Elegido</Etiqueta> : !bloqueado && <span>Sin elegir</span>}
          <span className="flex-1" />
          {!bloqueado && !asunto.elegida && (
            <button formAction={elegirAsunto.bind(null, piezaId, asunto.id)} className={botonDiscreto}>Elegir este</button>
          )}
          {!bloqueado && <button type="submit" disabled={pendiente} className={botonDiscreto}>{pendiente ? "Guardando…" : "Guardar"}</button>}
          {!bloqueado && <button formAction={borrarAsunto.bind(null, piezaId, asunto.id)} className={botonDiscreto}>Quitar</button>}
        </div>
        <MensajeResultado r={r} />
      </form>
    </li>
  );
}

function FormularioNuevoAsunto({ piezaId }: { piezaId: string }) {
  const [r, accion, pendiente] = useActionState(crearAsunto.bind(null, piezaId), inicial);
  return (
    <form action={accion} className="flex flex-col gap-2">
      <label className="text-sm font-medium">Nuevo asunto<input name="asunto" required maxLength={200} className={campo} /></label>
      <MensajeResultado r={r} />
      <button type="submit" disabled={pendiente} className={botonPrincipal}>Añadir asunto</button>
    </form>
  );
}
