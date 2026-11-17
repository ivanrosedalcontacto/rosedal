"use client";

import { useActionState, useState } from "react";
import { MensajeResultado, type Resultado } from "@/shared/components/mensaje-resultado";
import { botonDiscreto, botonPrincipal } from "@/shared/components/estilos";
import { borrarEjemplo, cargarEjemplo } from "./acciones";

const inicial: Resultado = { error: null };

export type ConteoEjemplo = { piezas: number; ideas: number; frases: number; ofertas: number; hitos: number };

/** Datos de ejemplo: cargar y quitar sin tocar nada de la usuaria. */
export function DatosDeEjemplo({ conteo }: { conteo: ConteoEjemplo }) {
  const [rCargar, accionCargar, cargando] = useActionState(cargarEjemplo, inicial);
  const [rBorrar, accionBorrar, borrando] = useActionState(borrarEjemplo, inicial);
  const [confirmando, setConfirmando] = useState(false);
  const hayEjemplo = conteo.piezas > 0;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Datos de ejemplo</h2>
      <p className="text-sm text-tinta-suave">
        Un caso completo para entender la app en dos minutos: una mentora, su curso, su lanzamiento y todo lo que
        cuelga de ahí. Está marcado como ejemplo y se puede quitar sin tocar nada tuyo.
      </p>

      {hayEjemplo ? (
        <>
          <p className="rounded-boton bg-fondo-suave p-3 text-sm">
            Ahora mismo hay {conteo.piezas} piezas, {conteo.ideas} ideas, {conteo.frases} frases, {conteo.ofertas} ofertas
            y {conteo.hitos} hitos de ejemplo.
          </p>
          {!confirmando ? (
            <button type="button" onClick={() => setConfirmando(true)} className={botonDiscreto}>
              Quitar ejemplo
            </button>
          ) : (
            <div className="flex flex-col gap-2 rounded-tarjeta border border-borde bg-aviso-fondo p-3">
              <p className="text-sm">
                Se borrarán {conteo.piezas} piezas, {conteo.ideas} ideas, {conteo.frases} frases, {conteo.ofertas} ofertas
                y {conteo.hitos} hitos de ejemplo. Lo que hayas creado tú no se toca.
              </p>
              <div className="flex gap-2">
                <form action={accionBorrar}>
                  <button type="submit" disabled={borrando} className={botonPrincipal}>
                    {borrando ? "Quitando…" : "Sí, quitar el ejemplo"}
                  </button>
                </form>
                <button type="button" onClick={() => setConfirmando(false)} className={botonDiscreto}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
          <MensajeResultado r={rBorrar} />
        </>
      ) : (
        <form action={accionCargar} className="flex flex-col gap-2">
          <button type="submit" disabled={cargando} className={botonPrincipal}>
            {cargando ? "Cargando…" : "Cargar ejemplo"}
          </button>
          <MensajeResultado r={rCargar} />
        </form>
      )}
      {hayEjemplo && <MensajeResultado r={rCargar} />}
    </section>
  );
}
