"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { MensajeResultado, type Resultado } from "@/shared/components/mensaje-resultado";
import { botonPrincipal, botonSecundario } from "@/shared/components/estilos";
import { actuarEnGrupo } from "./acciones-grupo";
import { EtiquetasPieza } from "./etiquetas-piezas";
import type { EstadoPieza, Finalidad, FormatoPieza } from "./esquemas";

export type PiezaDeLista = {
  id: string;
  titulo: string;
  formato: FormatoPieza;
  estado: EstadoPieza;
  finalidad: Finalidad | null;
};

/** Piezas pendientes de un pilar, con selección para moverlas a «Ya grabadas» o a la papelera. */
export function ListaPendientes({ piezas }: { piezas: PiezaDeLista[] }) {
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());
  const [resultado, setResultado] = useState<Resultado>({ error: null });
  const [pendiente, iniciar] = useTransition();
  const todas = piezas.length > 0 && seleccion.size === piezas.length;

  function alternar(id: string) {
    setSeleccion((antes) => {
      const nueva = new Set(antes);
      if (nueva.has(id)) nueva.delete(id);
      else nueva.add(id);
      return nueva;
    });
  }

  function actuar(accion: "grabadas" | "papelera") {
    const n = seleccion.size;
    if (accion === "papelera" && !window.confirm(`¿Enviar ${n === 1 ? "1 pieza" : `${n} piezas`} a la papelera? Podrás restaurarlas desde Ajustes.`)) return;
    iniciar(async () => {
      const r = await actuarEnGrupo([...seleccion], accion);
      setResultado(r);
      if (!r.error) setSeleccion(new Set());
    });
  }

  if (piezas.length === 0) {
    return <p className="rounded-tarjeta bg-fondo-suave px-5 py-8 text-center text-tinta-suave">No te queda nada por grabar en este pilar.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3 rounded-tarjeta bg-fondo-suave px-3 py-2">
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={todas} onChange={() => setSeleccion(todas ? new Set() : new Set(piezas.map((p) => p.id)))} className="h-5 w-5" />
          {seleccion.size === 0 ? "Seleccionar todas" : `${seleccion.size} seleccionada${seleccion.size === 1 ? "" : "s"}`}
        </label>
        {seleccion.size > 0 && (
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={pendiente} onClick={() => actuar("grabadas")} className={botonPrincipal}>Pasar a Ya grabadas</button>
            <button type="button" disabled={pendiente} onClick={() => actuar("papelera")} className={botonSecundario}>Enviar a la papelera</button>
          </div>
        )}
        <MensajeResultado r={resultado} />
      </div>
      <ul className="flex flex-col gap-2">
        {piezas.map((pieza) => (
          <li key={pieza.id} className="flex items-start gap-3 rounded-tarjeta border border-borde bg-fondo p-3">
            <input
              type="checkbox"
              aria-label={`Seleccionar «${pieza.titulo}»`}
              checked={seleccion.has(pieza.id)}
              onChange={() => alternar(pieza.id)}
              className="mt-1 h-5 w-5 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <Link href={`/piezas/${pieza.id}`} className="font-semibold hover:text-verde-700">{pieza.titulo}</Link>
              <div className="mt-2"><EtiquetasPieza formato={pieza.formato} estado={pieza.estado} finalidad={pieza.finalidad} /></div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
