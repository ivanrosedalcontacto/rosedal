"use client";

import { useActionState, useState } from "react";
import { MensajeResultado, type Resultado } from "@/shared/components/mensaje-resultado";
import { botonDiscreto, botonPrincipal, campo } from "@/shared/components/estilos";
import { guardarAprendizaje, guardarMetricas, retomarPieza } from "./acciones";
import {
  CATALOGO_METRICAS,
  ETIQUETA_ATRIBUCION,
  ETIQUETA_METRICA,
  METRICAS_CON_ATRIBUCION,
  metricasPropuestas,
  type MetricaPieza,
} from "./esquemas";

const inicial: Resultado = { error: null };

type Fila = { clave: string; valor: string; atribucion: string };

/**
 * Métricas de una pieza. Cada una está en uno de los tres estados:
 * campo vacío (pendiente), un número (registrado, también el 0) o fuera de la
 * lista (no la sigo).
 */
export function FormularioMetricas({
  piezaId,
  metricas,
  finalidad,
  esCorreo,
}: {
  piezaId: string;
  metricas: MetricaPieza[];
  finalidad: string | null;
  esCorreo: boolean;
}) {
  const [r, accion, pendiente] = useActionState(guardarMetricas.bind(null, piezaId), inicial);
  const [filas, setFilas] = useState<Fila[]>(() =>
    metricas.map((m) => ({
      clave: m.clave,
      valor: m.valor === null ? "" : String(m.valor),
      atribucion: m.atribucion ?? "",
    })),
  );
  const [elegida, setElegida] = useState("");

  const propuestas = metricasPropuestas(finalidad as never, esCorreo);
  const disponibles = CATALOGO_METRICAS.filter((c) => !filas.some((f) => f.clave === c));

  function cambiarValor(indice: number, valor: string) {
    setFilas((actual) => actual.map((fila, i) => (i === indice ? { ...fila, valor } : fila)));
  }

  function quitar(clave: string) {
    setFilas((actuales) => actuales.filter((f) => f.clave !== clave));
  }

  function anadir() {
    if (!elegida) return;
    setFilas((actuales) => [...actuales, { clave: elegida, valor: "", atribucion: "" }]);
    setElegida("");
  }

  return (
    <form action={accion} className="flex flex-col gap-2">
      <input type="hidden" name="claves" value={filas.map((f) => f.clave).join(",")} />
      {filas.length === 0 ? (
        <p className="text-xs text-tinta-suave">
          Sin métricas. Añade las que te interesen
          {propuestas.length > 0 && ` (${propuestas.map((p) => ETIQUETA_METRICA[p]).join(", ")})`}.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filas.map((fila, i) => (
            <li key={fila.clave} className="flex flex-wrap items-end gap-2">
              <label className="flex-1 text-xs font-medium">
                {ETIQUETA_METRICA[fila.clave] ?? fila.clave}
                <input
                  name={`valor_${fila.clave}`}
                  inputMode="decimal"
                  value={fila.valor}
                  onChange={(e) => cambiarValor(i, e.target.value)}
                  placeholder="Pendiente"
                  className={`${campo} mt-1`}
                />
              </label>
              {METRICAS_CON_ATRIBUCION.includes(fila.clave) && (
                <label className="text-xs font-medium">
                  Atribución
                  <select name={`atribucion_${fila.clave}`} defaultValue={fila.atribucion} className={`${campo} mt-1`}>
                    <option value="">Sin anotar</option>
                    <option value="confirmada">{ETIQUETA_ATRIBUCION.confirmada}</option>
                    <option value="sin_atribuir">{ETIQUETA_ATRIBUCION.sin_atribuir}</option>
                  </select>
                </label>
              )}
              <button type="button" onClick={() => quitar(fila.clave)} className={botonDiscreto}>
                Dejar de seguir
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex-1 text-xs font-medium">
          Añadir métrica
          <select value={elegida} onChange={(e) => setElegida(e.target.value)} className={`${campo} mt-1`}>
            <option value="">Elige una</option>
            {disponibles.map((c) => (
              <option key={c} value={c}>
                {ETIQUETA_METRICA[c] ?? c}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={anadir} className={botonDiscreto}>
          Añadir
        </button>
      </div>
      <MensajeResultado r={r} />
      <button type="submit" disabled={pendiente} className={botonPrincipal}>
        {pendiente ? "Guardando…" : "Guardar métricas"}
      </button>
    </form>
  );
}

/** «Qué aprendí» de la pieza. */
export function FormularioAprendizaje({ piezaId, aprendizaje }: { piezaId: string; aprendizaje: string | null }) {
  const [r, accion, pendiente] = useActionState(guardarAprendizaje.bind(null, piezaId), inicial);
  return (
    <form action={accion} className="flex items-end gap-2">
      <label className="flex-1 text-xs font-medium">
        Qué aprendiste
        <input name="aprendizaje" defaultValue={aprendizaje ?? ""} placeholder="Una línea" className={`${campo} mt-1`} />
      </label>
      <button type="submit" disabled={pendiente} className={botonDiscreto}>
        Guardar
      </button>
      {r.error && <MensajeResultado r={r} />}
    </form>
  );
}

/** «Retomar el…»: el día en que la pieza vuelve a salir en Hoy. */
export function FormularioRetomar({
  piezaId,
  retomarEl,
  nota,
}: {
  piezaId: string;
  retomarEl: string | null;
  nota: string | null;
}) {
  const [r, accion, pendiente] = useActionState(retomarPieza.bind(null, piezaId), inicial);
  return (
    <form action={accion} className="flex flex-wrap items-end gap-2">
      <label className="text-xs font-medium">
        Retomar el
        <input name="retomar_el" type="date" defaultValue={retomarEl ?? ""} className={`${campo} mt-1`} />
      </label>
      <label className="flex-1 text-xs font-medium">
        Nota
        <input name="nota_retomar" defaultValue={nota ?? ""} placeholder="Funcionó bien: retómala" className={`${campo} mt-1`} />
      </label>
      <button type="submit" disabled={pendiente} className={botonDiscreto}>
        Guardar
      </button>
      {r.error && <MensajeResultado r={r} />}
    </form>
  );
}
