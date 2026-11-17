"use client";

import { useEffect, useRef, useState } from "react";
import { botonPrincipal, campo } from "@/shared/components/estilos";
import type { Resultado } from "@/shared/components/mensaje-resultado";
import type { Pilar } from "@/features/ajustes/esquemas";
import type { Oferta } from "@/features/ofertas/esquemas";
import { guardarIdea } from "./acciones";
import {
  ATAJOS_MINUTOS,
  ESTADOS_IDEA,
  ETIQUETA_ESTADO,
  ETIQUETA_TIPO,
  NIVELES,
  TIPOS_IDEA,
  type Idea,
} from "./esquemas";

type Props = {
  idea: Idea;
  pilares: Pilar[];
  ofertas: Oferta[];
  lanzamientos: { id: string; nombre: string }[];
  temas: string[];
  problemas: string[];
};

const NIVELES_LISTA = [1, 2, 3] as const;

/**
 * Ficha editable de una idea. Se guarda sola tras 800 ms sin teclear;
 * el botón «Guardar» está por si el autoguardado no llega a dispararse.
 */
export function FormularioIdea({ idea, pilares, ofertas, lanzamientos, temas, problemas }: Props) {
  const [r, setR] = useState<Resultado>({ error: null });
  const [pendiente, setPendiente] = useState(false);
  const ref = useRef<HTMLFormElement>(null);
  const reloj = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [sucio, setSucio] = useState(false);
  /** Cambios tecleados; permite saber si quedó algo sin guardar durante el envío. */
  const edicion = useRef(0);

  useEffect(() => () => clearTimeout(reloj.current), []);

  function programar() {
    edicion.current += 1;
    setSucio(true);
    clearTimeout(reloj.current);
    reloj.current = setTimeout(() => ref.current?.requestSubmit(), 800);
  }

  /** Al enviarse el formulario se cancela el temporizador para no duplicar el envío. */
  function cancelarReloj() {
    clearTimeout(reloj.current);
  }

  /**
   * Guarda el formulario. Se envuelve en una función asíncrona para poder leer
   * el resultado sin un efecto: la regla `react-hooks/set-state-in-effect`
   * prohíbe sincronizar el estado desde `useEffect`.
   */
  async function guardar(formData: FormData) {
    const marca = edicion.current;
    setPendiente(true);
    setR({ error: null });
    try {
      const res = await guardarIdea(idea.id, { error: null }, formData);
      setR(res);
      // Cada guardado bueno borra la marca de «Sin guardar», salvo que se haya
      // tecleado algo mientras esperábamos.
      if (res.ok && edicion.current === marca) setSucio(false);
    } catch {
      setR({ error: "No se pudo guardar. Tu texto sigue aquí; inténtalo de nuevo." });
    } finally {
      setPendiente(false);
    }
  }

  function atajo(minutos: number) {
    const campoMinutos = ref.current?.elements.namedItem("minutos_preparacion");
    if (campoMinutos instanceof HTMLInputElement) {
      campoMinutos.value = String(minutos);
      programar();
    }
  }

  const indicador = pendiente
    ? { texto: "Guardando…", clase: "text-tinta-suave" }
    : r.error
      ? { texto: r.error, clase: "text-error" }
      : sucio
        ? { texto: "Sin guardar", clase: "text-aviso" }
        : r.ok
          ? { texto: "Guardado ✓", clase: "text-verde-700" }
          : { texto: "Se guarda solo", clase: "text-tinta-suave" };

  return (
    <form ref={ref} action={guardar} onChange={programar} onSubmit={cancelarReloj} className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">La idea</h2>
        <label className="text-sm font-medium">
          Texto
          <textarea
            name="texto"
            defaultValue={idea.texto}
            rows={6}
            className={`${campo} text-[17px] leading-[1.6]`}
          />
        </label>
        <p aria-live="polite" className={`text-sm ${indicador.clase}`}>
          {indicador.texto}
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Clasificación</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Tipo
            <select name="tipo" defaultValue={idea.tipo} className={campo}>
              {TIPOS_IDEA.map((t) => (
                <option key={t} value={t}>
                  {ETIQUETA_TIPO[t]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Estado
            <select name="estado" defaultValue={idea.estado} className={campo}>
              {ESTADOS_IDEA.map((e) => (
                <option key={e} value={e}>
                  {ETIQUETA_ESTADO[e]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Pilar
            <select name="pilar_id" defaultValue={idea.pilar_id ?? ""} className={campo}>
              <option value="">Sin pilar</option>
              {pilares.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                  {p.archivado ? " (archivada)" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Oferta
            <select name="oferta_id" defaultValue={idea.oferta_id ?? ""} className={campo}>
              <option value="">Sin oferta</option>
              {ofertas.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nombre}
                  {o.archivada ? " (archivada)" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Lanzamiento
            <select name="lanzamiento_id" defaultValue={idea.lanzamiento_id ?? ""} className={campo}>
              <option value="">Sin lanzamiento</option>
              {lanzamientos.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Tema
            <input name="tema" list="lista-temas" defaultValue={idea.tema ?? ""} className={campo} />
            <datalist id="lista-temas">
              {temas.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </label>
          <label className="text-sm font-medium">
            Problema de la audiencia
            <input name="problema_audiencia" list="lista-problemas" defaultValue={idea.problema_audiencia ?? ""} className={campo} />
            <datalist id="lista-problemas">
              {problemas.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            Procedencia (opcional)
            <input
              name="procedencia"
              defaultValue={idea.procedencia ?? ""}
              placeholder="Mensaje privado de Instagram, llamada con clienta…"
              className={campo}
            />
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Prioridad y tiempo</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Relevancia
            <select name="relevancia" defaultValue={idea.relevancia?.toString() ?? ""} className={campo}>
              <option value="">Sin definir</option>
              {NIVELES_LISTA.map((n) => (
                <option key={n} value={n}>
                  {NIVELES[n]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Demanda
            <select name="demanda" defaultValue={idea.demanda?.toString() ?? ""} className={campo}>
              <option value="">Sin definir</option>
              {NIVELES_LISTA.map((n) => (
                <option key={n} value={n}>
                  {NIVELES[n]}
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">
              Tiempo estimado de preparación (minutos)
              <input name="minutos_preparacion" type="number" min={0} max={10000} defaultValue={idea.minutos_preparacion ?? ""} className={campo} />
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {ATAJOS_MINUTOS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => atajo(m)}
                  className="min-h-9 rounded-full border border-borde px-3 py-1 text-sm text-verde-700"
                >
                  {m} min
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Notas</h2>
        <textarea name="notas" defaultValue={idea.notas} rows={3} className={campo} />
      </section>

      <div>
        <button type="submit" disabled={pendiente} className={botonPrincipal}>
          Guardar
        </button>
      </div>
    </form>
  );
}
