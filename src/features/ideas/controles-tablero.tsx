"use client";

import { useState } from "react";
import { crearIdeaEnColumna, moverIdea } from "./acciones";
import type { Dimension } from "./esquemas";

/**
 * Controles del tablero de brainstorming: crear una columna (tema o problema),
 * añadir una idea a una columna y mover una idea a otra columna.
 *
 * Los formularios envuelven la acción en una función asíncrona para poder leer
 * el resultado sin un efecto: la regla `react-hooks/set-state-in-effect`
 * prohíbe sincronizar el estado desde `useEffect`.
 */

/** Una columna del tablero: el valor con el que se agrupa y su título. */
export type Columna = { valor: string; nombre: string };

const inicialError = "";

/** «+ Nueva idea» dentro de una columna del tablero. */
export function FormularioColumna({ por, valor, nombre }: { por: Dimension; valor: string; nombre: string }) {
  const [abierto, setAbierto] = useState(false);

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="min-h-11 rounded-lg border border-dashed border-borde px-3 py-1.5 text-sm text-tinta-suave transition hover:border-verde-300 hover:text-verde-700"
      >
        + Nueva idea{valor ? ` en «${nombre}»` : ""}
      </button>
    );
  }

  return <FormularioNuevaIdea por={por} valor={valor} alCancelar={() => setAbierto(false)} />;
}

function FormularioNuevaIdea({
  por,
  valor,
  alCancelar,
}: {
  por: Dimension;
  valor: string;
  alCancelar: () => void;
}) {
  const [texto, setTexto] = useState("");
  const [pendiente, setPendiente] = useState(false);
  const [error, setError] = useState(inicialError);

  async function enviar(formData: FormData) {
    setPendiente(true);
    setError(inicialError);
    try {
      const r = await crearIdeaEnColumna({ error: null }, formData);
      if (!r.ok) {
        setError(r.error ?? "No se ha guardado. Inténtalo otra vez.");
        return;
      }
      setTexto("");
      alCancelar();
    } catch {
      setError("No se ha guardado. Inténtalo otra vez.");
    } finally {
      setPendiente(false);
    }
  }

  return (
    <form action={enviar} className="flex flex-col gap-2">
      <input type="hidden" name="por" value={por} />
      <input type="hidden" name="valor" value={valor} />
      <input
        autoFocus
        name="texto"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Una idea concreta…"
        className="min-h-11 rounded-lg border border-borde bg-fondo px-3 py-2 text-sm focus:border-verde-400 focus:outline-none"
      />
      {error && <p className="text-xs text-error">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pendiente || texto.trim() === ""}
          className="rounded-lg bg-verde-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-verde-700 disabled:opacity-50"
        >
          {pendiente ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={alCancelar}
          className="rounded-lg border border-borde px-3 py-1.5 text-sm text-tinta-suave transition hover:bg-fondo"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

/**
 * «Nueva columna» (solo para tema y problema): pide el nombre de la columna y
 * una primera idea, porque las columnas se derivan de las ideas guardadas.
 */
export function FormularioNuevaColumna({ por }: { por: "tema" | "problema" }) {
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [texto, setTexto] = useState("");
  const [pendiente, setPendiente] = useState(false);
  const [error, setError] = useState(inicialError);

  async function enviar(formData: FormData) {
    setPendiente(true);
    setError(inicialError);
    try {
      const r = await crearIdeaEnColumna({ error: null }, formData);
      if (!r.ok) {
        setError(r.error ?? "No se ha guardado. Inténtalo otra vez.");
        return;
      }
      setNombre("");
      setTexto("");
      setAbierto(false);
    } catch {
      setError("No se ha guardado. Inténtalo otra vez.");
    } finally {
      setPendiente(false);
    }
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="min-h-11 rounded-full border border-borde px-4 py-2.5 text-sm text-tinta transition hover:bg-fondo"
      >
        + Nueva columna
      </button>
    );
  }

  return (
    <form action={enviar} className="flex w-full flex-col gap-2 rounded-tarjeta border border-borde bg-fondo p-3 sm:w-auto">
      <input type="hidden" name="por" value={por} />
      <input type="hidden" name="valor" value={nombre.trim()} />
      <label className="text-sm font-medium">
        Nombre de la columna
        <input
          autoFocus
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder={por === "tema" ? "Ej. Preparación del parto" : "Ej. Miedo a no estar a la altura"}
          className="mt-1 w-full rounded-lg border border-borde bg-fondo px-3 py-2 text-sm focus:border-verde-400 focus:outline-none"
        />
      </label>
      <label className="text-sm font-medium">
        Una idea para empezar
        <input
          name="texto"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Una idea concreta…"
          className="mt-1 w-full rounded-lg border border-borde bg-fondo px-3 py-2 text-sm focus:border-verde-400 focus:outline-none"
        />
      </label>
      {error && <p className="text-xs text-error">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pendiente || nombre.trim() === "" || texto.trim() === ""}
          className="rounded-lg bg-verde-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-verde-700 disabled:opacity-50"
        >
          {pendiente ? "Creando…" : "Crear columna"}
        </button>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="rounded-lg border border-borde px-3 py-1.5 text-sm text-tinta-suave transition hover:bg-fondo"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

/** Cambia la columna de una idea: al elegir opción se envía solo. */
export function SelectorMover({
  ideaId,
  por,
  valorActual,
  columnas,
}: {
  ideaId: string;
  por: Dimension;
  valorActual: string;
  columnas: Columna[];
}) {
  async function mover(formData: FormData) {
    const valor = (formData.get("valor") ?? "").toString();
    await moverIdea(ideaId, por, valor);
  }

  return (
    <form action={mover} className="flex items-center gap-2">
      <label className="text-xs text-tinta-suave" htmlFor={`mover-${ideaId}`}>
        Mover a…
      </label>
      <select
        id={`mover-${ideaId}`}
        name="valor"
        defaultValue={valorActual}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="min-h-9 flex-1 rounded-lg border border-borde bg-fondo px-2 py-1 text-xs focus:border-verde-400 focus:outline-none"
      >
        <option value="">Sin asignar</option>
        {columnas.map((c) => (
          <option key={c.valor} value={c.valor}>
            {c.nombre}
          </option>
        ))}
      </select>
    </form>
  );
}
