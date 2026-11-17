"use client";

import { useActionState, useState } from "react";
import { publicarPieza } from "@/features/piezas/acciones";
import { MensajeResultado, type Resultado } from "@/shared/components/mensaje-resultado";
import { botonDiscreto, botonPrincipal, campo } from "@/shared/components/estilos";

const inicial: Resultado = { error: null };

/** Publicar desde Hoy: solo la fecha real y, si quieres, el enlace. */
export function PublicarAhora({ piezaId, esCorreo, fechaPorDefecto }: { piezaId: string; esCorreo: boolean; fechaPorDefecto: string }) {
  const [r, accion, pendiente] = useActionState(publicarPieza.bind(null, piezaId), inicial);
  const [abierto, setAbierto] = useState(false);
  const texto = esCorreo ? "Marcar enviado" : "Marcar publicado";
  if (!abierto) {
    return (
      <button type="button" onClick={() => setAbierto(true)} className={botonDiscreto}>
        {texto}
      </button>
    );
  }
  return (
    <form action={accion} className="flex flex-col gap-2 rounded-boton bg-fondo-suave p-2">
      <label className="text-xs font-medium">
        Fecha real
        <input name="fecha_real" type="date" defaultValue={fechaPorDefecto} required className={campo} />
      </label>
      <label className="text-xs font-medium">
        Enlace (opcional)
        <input name="url_publicada" inputMode="url" placeholder="https://" className={campo} />
      </label>
      <MensajeResultado r={r} />
      <div className="flex gap-2">
        <button type="submit" disabled={pendiente} className={botonPrincipal}>
          {pendiente ? "Guardando…" : texto}
        </button>
        <button type="button" onClick={() => setAbierto(false)} className={botonDiscreto}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
