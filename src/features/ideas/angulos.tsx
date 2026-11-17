"use client";

import { useState } from "react";
import { botonDiscreto, botonPrincipal, botonSecundario, campo } from "@/shared/components/estilos";
import { MensajeResultado, type Resultado } from "@/shared/components/mensaje-resultado";
import { guardarAngulo, quitarAngulo } from "./acciones";
import { ETIQUETA_ANGULO, TIPOS_ANGULO, type TipoAngulo } from "./esquemas";

type AnguloGuardado = { tipo: TipoAngulo; nota: string };

const inicial: Resultado = { error: null };

/** Los siete ángulos de una idea: cada uno con su nota, editable y quitable. */
export function Angulos({ ideaId, angulos }: { ideaId: string; angulos: AnguloGuardado[] }) {
  const mapa = new Map(angulos.map((a) => [a.tipo, a.nota]));
  return (
    <ul className="flex flex-col gap-2">
      {TIPOS_ANGULO.map((tipo) => (
        <FilaAngulo key={tipo} ideaId={ideaId} tipo={tipo} nota={mapa.get(tipo) ?? ""} />
      ))}
    </ul>
  );
}

function FilaAngulo({ ideaId, tipo, nota }: { ideaId: string; tipo: TipoAngulo; nota: string }) {
  const [abierto, setAbierto] = useState(false);
  const [r, setR] = useState<Resultado>(inicial);
  const [pendiente, setPendiente] = useState(false);

  /** Guarda la nota y, si sale bien, cierra el editor para mostrarla. */
  async function guardar(formData: FormData) {
    setPendiente(true);
    try {
      const res = await guardarAngulo(ideaId, tipo, inicial, formData);
      setR(res);
      if (res.ok) setAbierto(false);
    } catch {
      setR({ error: "No se pudo guardar el ángulo. Inténtalo de nuevo." });
    } finally {
      setPendiente(false);
    }
  }

  if (!abierto) {
    return (
      <li className="rounded-tarjeta border border-borde px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium">{ETIQUETA_ANGULO[tipo]}</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setR(inicial);
                setAbierto(true);
              }}
              className={botonDiscreto}
            >
              {nota ? "Editar" : "Anotar"}
            </button>
            {nota && (
              <form action={quitarAngulo.bind(null, ideaId, tipo)}>
                <button type="submit" className={botonDiscreto}>
                  Quitar
                </button>
              </form>
            )}
          </div>
        </div>
        {nota && <p className="mt-2 whitespace-pre-wrap text-sm text-tinta-suave">{nota}</p>}
      </li>
    );
  }

  return (
    <li className="rounded-tarjeta border border-verde-200 bg-verde-50 px-4 py-3">
      <form action={guardar} className="flex flex-col gap-2">
        <span className="text-sm font-medium">{ETIQUETA_ANGULO[tipo]}</span>
        <textarea
          name="nota"
          defaultValue={nota}
          rows={3}
          placeholder="Cómo lo contarías desde este ángulo"
          className={campo}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" disabled={pendiente} className={botonPrincipal}>
            Guardar ángulo
          </button>
          <button type="button" onClick={() => setAbierto(false)} className={botonSecundario}>
            Cancelar
          </button>
          <MensajeResultado r={r} />
        </div>
      </form>
    </li>
  );
}
