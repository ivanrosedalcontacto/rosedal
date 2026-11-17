"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { buscarGlobal, type ResultadoBusqueda } from "./acciones";

type Accion = { titulo: string; detalle: string; href: string };

const ACCIONES: Accion[] = [
  { titulo: "Nueva idea", detalle: "Captura rápida", href: "/hoy" },
  { titulo: "Nueva frase", detalle: "Captura rápida", href: "/hoy" },
  { titulo: "Ir al calendario", detalle: "Planificar", href: "/calendario" },
  { titulo: "Ir a la biblioteca", detalle: "Contenido", href: "/biblioteca" },
  { titulo: "Ir a los lanzamientos", detalle: "Planificar", href: "/lanzamientos" },
  { titulo: "Revisión semanal", detalle: "Revisar", href: "/revision" },
];

/** Buscador global: Ctrl + K en ordenador y una lupa en móvil. */
export function BuscadorGlobal() {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([]);
  const entrada = useRef<HTMLInputElement>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    function alPulsar(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAbierto((v) => !v);
      }
      if (e.key === "Escape") setAbierto(false);
    }
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, []);

  useEffect(() => {
    if (abierto) entrada.current?.focus();
  }, [abierto]);

  useEffect(() => {
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(async () => {
      if (texto.trim().length < 2) {
        setResultados([]);
        return;
      }
      setResultados(await buscarGlobal(texto));
    }, 250);
    return () => clearTimeout(temporizador.current);
  }, [texto]);

  function ir(href: string) {
    setAbierto(false);
    setTexto("");
    router.push(href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="flex min-h-11 items-center gap-2 rounded-full border border-borde px-3 text-sm text-tinta-suave"
        aria-label="Buscar en la app"
      >
        <Search className="h-4 w-4" aria-hidden />
        <span className="hidden md:inline">Buscar</span>
        <kbd className="hidden rounded bg-fondo-suave px-1 text-[10px] md:inline">Ctrl K</kbd>
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-tinta/30 p-4 pt-[10vh]">
          <div className="w-full max-w-xl overflow-hidden rounded-tarjeta border border-borde bg-fondo shadow-lg">
            <input
              ref={entrada}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Busca ideas, piezas, frases, correos, ofertas…"
              className="w-full border-b border-borde px-4 py-3 text-[17px]"
              aria-label="Buscar"
            />
            <div className="max-h-[60vh] overflow-y-auto">
              {texto.trim().length >= 2 && resultados.length === 0 && (
                <p className="px-4 py-4 text-sm text-tinta-suave">No hay nada con «{texto.trim()}».</p>
              )}
              <ul className="flex flex-col">
                {resultados.map((r) => (
                  <li key={`${r.tipo}-${r.id}`}>
                    <button type="button" onClick={() => ir(r.href)} className="flex w-full flex-col gap-0.5 px-4 py-2 text-left hover:bg-verde-50">
                      <span className="text-sm font-medium">{r.titulo}</span>
                      <span className="text-xs text-tinta-suave">{r.detalle}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="px-4 pt-2 text-xs font-semibold uppercase tracking-wide text-tinta-suave">Acciones</p>
              <ul className="flex flex-col">
                {ACCIONES.filter((a) => a.titulo.toLowerCase().includes(texto.trim().toLowerCase())).map((a) => (
                  <li key={a.titulo}>
                    <button type="button" onClick={() => ir(a.href)} className="flex w-full items-baseline justify-between gap-3 px-4 py-2 text-left hover:bg-verde-50">
                      <span className="text-sm">{a.titulo}</span>
                      <span className="text-xs text-tinta-suave">{a.detalle}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
