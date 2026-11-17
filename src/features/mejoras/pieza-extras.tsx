"use client";

import { useActionState, useState } from "react";
import { MensajeResultado, type Resultado } from "@/shared/components/mensaje-resultado";
import { botonDiscreto, botonPrincipal, campo } from "@/shared/components/estilos";
import { aplicarPasosPorDefecto, alternarPaso, alternarPerenne, borrarPaso, crearPaso } from "./acciones-extra";
import { enlaceConCampana } from "./enlace";

const inicial: Resultado = { error: null };

type Paso = { id: string; texto: string; hecho: boolean; orden: number };

/** Lista de pasos de una pieza (B3): lo que hay que tener listo. */
export function PasosPieza({
  piezaId,
  pasos,
  pasosPorFormato,
}: {
  piezaId: string;
  pasos: Paso[];
  pasosPorFormato: string[];
}) {
  const [r, accion, pendiente] = useActionState(crearPaso.bind(null, piezaId), inicial);
  const [texto, setTexto] = useState("");
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Pasos</h2>
      {pasos.length === 0 ? (
        <p className="text-sm text-tinta-suave">
          Sin pasos. {pasosPorFormato.length > 0 ? "Puedes añadir los de partida." : "Añade los que te pide tu formato."}
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {pasos.map((paso) => (
            <li key={paso.id} className="flex items-center gap-2">
              <form action={alternarPaso.bind(null, piezaId, paso.id, !paso.hecho)}>
                <button
                  type="submit"
                  aria-pressed={paso.hecho}
                  aria-label={paso.hecho ? `Marcar «${paso.texto}» como pendiente` : `Marcar «${paso.texto}» como hecho`}
                  className={`grid h-6 w-6 place-items-center rounded border ${paso.hecho ? "border-verde-700 bg-verde-700 text-white" : "border-borde bg-fondo"}`}
                >
                  {paso.hecho ? "✓" : ""}
                </button>
              </form>
              <span className={`flex-1 text-sm ${paso.hecho ? "line-through opacity-70" : ""}`}>{paso.texto}</span>
              <form action={borrarPaso.bind(null, piezaId, paso.id)}>
                <button type="submit" className={botonDiscreto}>
                  Quitar
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
      <form action={accion} className="flex items-end gap-2">
        <label className="flex-1 text-sm font-medium">
          Nuevo paso
          <input
            name="texto"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Grabar el reel"
            className={campo}
          />
        </label>
        <button type="submit" disabled={pendiente} className={botonPrincipal}>
          Añadir
        </button>
      </form>
      {pasosPorFormato.length > 0 && (
        <form action={aplicarPasosPorDefecto.bind(null, piezaId)}>
          <button type="submit" className={botonDiscreto}>
            Añadir los pasos de partida de este formato
          </button>
        </form>
      )}
      <MensajeResultado r={r} />
    </section>
  );
}

/** Marca una pieza como perenne (B5). */
export function MarcaPerenne({ piezaId, perenne }: { piezaId: string; perenne: boolean }) {
  return (
    <form action={alternarPerenne.bind(null, piezaId, !perenne)} className="flex items-center gap-2">
      <button
        type="submit"
        aria-pressed={perenne}
        className={`grid h-6 w-6 place-items-center rounded border ${perenne ? "border-verde-700 bg-verde-700 text-white" : "border-borde bg-fondo"}`}
        aria-label={perenne ? "Quitar la marca de perenne" : "Marcar como perenne"}
      >
        {perenne ? "✓" : ""}
      </button>
      <span className="text-sm">Es contenido perenne</span>
    </form>
  );
}

/** Ayudante para añadir etiquetas de campaña al enlace (B9). */
export function EnlaceConCampana({
  nombre,
  valor,
}: {
  nombre: string;
  valor: string;
}) {
  const [url, setUrl] = useState(valor);
  const [origen, setOrigen] = useState("rosedal");
  const [medio, setMedio] = useState("social");
  const [campana, setCampana] = useState("");
  const [listo, setListo] = useState<string | null>(null);

  function calcular() {
    const resultado = enlaceConCampana(url, origen, medio, campana);
    setListo(resultado);
    setUrl(resultado);
  }

  return (
    <div className="flex flex-col gap-2 rounded-boton bg-fondo-suave p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-tinta-suave">Enlace con seguimiento</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="text-xs">
          Origen
          <input value={origen} onChange={(e) => setOrigen(e.target.value)} className={campo} />
        </label>
        <label className="text-xs">
          Medio
          <input value={medio} onChange={(e) => setMedio(e.target.value)} className={campo} />
        </label>
        <label className="text-xs">
          Campaña
          <input value={campana} onChange={(e) => setCampana(e.target.value)} placeholder="lanzamiento-otono" className={campo} />
        </label>
      </div>
      <button type="button" onClick={calcular} className={botonDiscreto}>
        Añadir las etiquetas
      </button>
      {listo && (
        <p className="break-all text-xs text-tinta-suave">
          Copia este enlace en «{nombre}»: {listo}
        </p>
      )}
    </div>
  );
}

/** Contador de caracteres (A6). */
export function ContadorDeTexto({ texto, maximo }: { texto: string; maximo: number }) {
  const largo = texto.length;
  const tono = largo > maximo ? "text-aviso" : "text-tinta-suave";
  return (
    <p className={`text-xs ${tono}`}>
      {largo} de {maximo} caracteres
    </p>
  );
}

/** Modo concentración (B10): deja solo el texto. */
export function BotonConcentracion() {
  const [activo, setActivo] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={() => {
        const nuevo = !activo;
        setActivo(nuevo);
        document.documentElement.dataset.concentracion = nuevo ? "1" : "0";
      }}
      className={botonDiscreto}
    >
      {activo ? "Salir del modo concentración" : "Modo concentración"}
    </button>
  );
}
