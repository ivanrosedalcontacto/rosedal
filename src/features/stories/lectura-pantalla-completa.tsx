"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { botonDiscreto, botonPrincipal } from "@/shared/components/estilos";
import type { StoryTarjeta } from "./editor-stories";

const ETIQUETA_INTERACCION: Record<StoryTarjeta["interaccion"], string> = {
  ninguna: "",
  encuesta: "Encuesta",
  pregunta: "Pregunta",
  enlace: "Enlace",
  cta: "Llamada a la acción",
};

/** Una story cada vez, a pantalla completa y con letra grande. Es solo texto: no graba ni reproduce nada. */
export function LecturaPantallaCompleta({ tarjetas }: { tarjetas: StoryTarjeta[] }) {
  const [abierta, setAbierta] = useState(false);
  const [indice, setIndice] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const abridor = useRef<HTMLButtonElement>(null);

  const cerrar = useCallback(() => {
    setAbierta(false);
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    abridor.current?.focus();
  }, []);

  const mover = useCallback(
    (paso: number) => setIndice((actual) => Math.min(Math.max(actual + paso, 0), tarjetas.length - 1)),
    [tarjetas.length],
  );

  function abrir() {
    setIndice(0);
    setAbierta(true);
    // La pantalla completa del navegador es un extra: si no existe (p. ej. en algunos móviles), basta con la capa.
    void document.documentElement.requestFullscreen?.().catch(() => undefined);
  }

  useEffect(() => {
    if (!abierta) return;
    panel.current?.focus();
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = antes;
    };
  }, [abierta]);

  // Si el usuario sale de la pantalla completa con Esc, el navegador la cierra; la capa se cierra con ella.
  useEffect(() => {
    if (!abierta) return;
    function alCambiar() {
      if (!document.fullscreenElement) setAbierta(false);
    }
    document.addEventListener("fullscreenchange", alCambiar);
    return () => document.removeEventListener("fullscreenchange", alCambiar);
  }, [abierta]);

  // En el documento y no en el panel: al desactivarse un botón (primera o última story) el foco se pierde.
  useEffect(() => {
    if (!abierta) return;
    function alPulsarTecla(e: KeyboardEvent) {
      if (e.key === "Escape") cerrar();
      else if (e.key === "ArrowRight" || e.key === "PageDown") mover(1);
      else if (e.key === "ArrowLeft" || e.key === "PageUp") mover(-1);
    }
    document.addEventListener("keydown", alPulsarTecla);
    return () => document.removeEventListener("keydown", alPulsarTecla);
  }, [abierta, cerrar, mover]);

  const tarjeta = tarjetas[indice];
  const hayInteraccion = tarjeta && tarjeta.interaccion !== "ninguna";

  return (
    <>
      <button ref={abridor} type="button" onClick={abrir} className={botonDiscreto}>
        Leer a pantalla completa
      </button>
      {abierta && tarjeta && (
        <div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label="Lectura de la secuencia de stories"
          tabIndex={-1}
          className="fixed inset-0 z-50 flex h-dvh flex-col bg-fondo text-tinta outline-none"
        >
          <header className="flex items-center justify-between gap-3 border-b border-borde px-5 py-3">
            <p className="text-sm text-tinta-suave" aria-live="polite">
              Story {indice + 1} de {tarjetas.length}
            </p>
            <button type="button" onClick={cerrar} className={botonDiscreto}>
              Cerrar
            </button>
          </header>
          <article className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 overflow-y-auto px-6 py-8">
            <h2 className="font-serif text-3xl text-verde-700 sm:text-4xl">{tarjeta.titulo || "Sin título"}</h2>
            {tarjeta.que_digo && <p className="whitespace-pre-wrap text-2xl leading-relaxed sm:text-3xl">{tarjeta.que_digo}</p>}
            {tarjeta.texto_pantalla && (
              <section className="rounded-tarjeta bg-verde-50 p-5">
                <h3 className="text-sm font-medium text-tinta-suave">Texto en pantalla</h3>
                <p className="mt-1 whitespace-pre-wrap text-xl sm:text-2xl">{tarjeta.texto_pantalla}</p>
              </section>
            )}
            {tarjeta.visual && (
              <section>
                <h3 className="text-sm font-medium text-tinta-suave">Imagen o plano</h3>
                <p className="mt-1 whitespace-pre-wrap text-lg">{tarjeta.visual}</p>
              </section>
            )}
            {hayInteraccion && (
              <section>
                <h3 className="text-sm font-medium text-tinta-suave">{ETIQUETA_INTERACCION[tarjeta.interaccion]}</h3>
                {tarjeta.interaccion_detalle && <p className="mt-1 whitespace-pre-wrap text-lg">{tarjeta.interaccion_detalle}</p>}
              </section>
            )}
          </article>
          <footer className="flex items-center justify-between gap-3 border-t border-borde px-5 py-4">
            <button type="button" onClick={() => mover(-1)} disabled={indice === 0} className={`${botonDiscreto} min-h-12 min-w-28 disabled:opacity-40`}>
              Anterior
            </button>
            <button type="button" onClick={() => mover(1)} disabled={indice === tarjetas.length - 1} className={`${botonPrincipal} min-h-12 min-w-28 disabled:opacity-40`}>
              Siguiente
            </button>
          </footer>
        </div>
      )}
    </>
  );
}
