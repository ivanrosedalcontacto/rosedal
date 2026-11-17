"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";
import { botonPrincipal, botonSecundario, campo } from "@/shared/components/estilos";
import { capturar } from "./acciones";
import { useCaptura } from "./almacen";
import { encolar } from "./cola";
import { INFO_CAPTURA, type TipoCaptura } from "./tipos";

const clave = (tipo: TipoCaptura) => `rosedal-borrador-${tipo}`;

function leerBorrador(tipo: TipoCaptura): string {
  try {
    return localStorage.getItem(clave(tipo)) ?? "";
  } catch {
    return "";
  }
}

function guardarBorrador(tipo: TipoCaptura, texto: string) {
  try {
    if (texto) localStorage.setItem(clave(tipo), texto);
    else localStorage.removeItem(clave(tipo));
  } catch {
    // Sin almacenamiento local: la captura sigue funcionando sin borrador.
  }
}

/** Hoja de captura: un campo de texto y dos botones. Nada más es obligatorio. */
export function HojaCaptura() {
  const tipo = useCaptura((s) => s.abierta);
  if (!tipo) return null;
  return <Contenido key={tipo} tipo={tipo} />;
}

function Contenido({ tipo }: { tipo: TipoCaptura }) {
  const cerrar = useCaptura((s) => s.cerrar);
  const info = INFO_CAPTURA[tipo];
  const [texto, setTexto] = useState(() => leerBorrador(tipo));
  const [error, setError] = useState<string | null>(null);
  const [guardadas, setGuardadas] = useState(0);
  const [guardadoFinal, setGuardadoFinal] = useState(false);
  const [pendienteDeGuardar, setPendienteDeGuardar] = useState(false);
  const [pendiente, empezar] = useTransition();
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    areaRef.current?.focus();
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && cerrar();
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [cerrar]);

  function cambiar(valor: string) {
    setTexto(valor);
    setError(null);
    guardarBorrador(tipo, valor);
  }

  function guardar(otra: boolean) {
    empezar(async () => {
      const r = await capturar(tipo, texto);
      if (r.error) {
        // Si no hay red, la captura se guarda en el dispositivo y se envía al recuperar la conexión.
        if (typeof navigator !== "undefined" && !navigator.onLine) {
          encolar(tipo, texto);
          guardarBorrador(tipo, "");
          setTexto("");
          setError(null);
          setPendienteDeGuardar(true);
          return;
        }
        setError(r.error);
        return;
      }
      guardarBorrador(tipo, "");
      setTexto("");
      if (otra) {
        setGuardadas((n) => n + 1);
        areaRef.current?.focus();
      } else {
        setGuardadoFinal(true);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-tinta/30 md:items-center" onClick={cerrar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={info.titulo}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-2xl bg-fondo p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl md:rounded-tarjeta"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl">{info.titulo}</h2>
          <button type="button" onClick={cerrar} aria-label="Cerrar" className="flex h-11 w-11 items-center justify-center">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {guardadoFinal ? (
          <div className="mt-4 flex flex-col gap-4">
            <p role="status" className="rounded-boton bg-verde-100 px-3 py-3 text-verde-700">
              Guardado en {info.destino} ✓
            </p>
            <div className="flex gap-2">
              <Link href={info.enlace} onClick={cerrar} className={`${botonSecundario} flex-1 text-center`}>
                Ver {info.destino}
              </Link>
              <button type="button" onClick={cerrar} className={`${botonPrincipal} flex-1`}>
                Listo
              </button>
            </div>
          </div>
        ) : pendienteDeGuardar ? (
          <div className="mt-4 flex flex-col gap-4">
            <p role="status" className="rounded-boton bg-aviso-fondo px-3 py-3 text-aviso">
              Pendiente de guardar: se enviará en cuanto vuelvas a tener conexión.
            </p>
            <button type="button" onClick={cerrar} className={`${botonPrincipal} w-full`}>
              Entendido
            </button>
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-tinta-suave">{info.ayuda}</p>
            <textarea
              ref={areaRef}
              value={texto}
              onChange={(e) => cambiar(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) guardar(false);
              }}
              rows={6}
              aria-label={info.titulo}
              className={`${campo} resize-none text-[17px] leading-relaxed`}
            />
            {guardadas > 0 && (
              <p role="status" className="mt-2 text-sm text-verde-700">
                {guardadas === 1 ? "1 guardada" : `${guardadas} guardadas`} ✓
              </p>
            )}
            {error && (
              <p role="alert" className="mt-2 rounded-boton bg-error-fondo px-3 py-2 text-sm text-error">
                {error}
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <button type="button" disabled={pendiente} onClick={() => guardar(true)} className={`${botonSecundario} flex-1`}>
                Guardar y escribir otra
              </button>
              <button type="button" disabled={pendiente} onClick={() => guardar(false)} className={`${botonPrincipal} flex-1`}>
                {pendiente ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
