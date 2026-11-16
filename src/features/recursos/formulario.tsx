"use client";

import { useActionState } from "react";
import { MensajeResultado, type Resultado } from "@/shared/components/mensaje-resultado";
import { botonPrincipal, campo } from "@/shared/components/estilos";
import { crearRecurso } from "./acciones";
import { INFO_TIPO, type TipoRecurso } from "./esquemas";

const inicial: Resultado = { error: null };

export function FormularioRecurso({ tipo }: { tipo: TipoRecurso }) {
  const [r, accion, pendiente] = useActionState(crearRecurso, inicial);
  const info = INFO_TIPO[tipo];
  return (
    <form action={accion} className="flex flex-col gap-3" key={`${tipo}-${r.ok ? "ok" : "nuevo"}`}>
      <input type="hidden" name="tipo" value={tipo} />
      <label className="text-sm font-medium">
        Título (opcional)
        <input name="titulo" className={campo} />
      </label>
      <label className="text-sm font-medium">
        Texto
        <textarea name="texto" rows={4} required className={campo} />
      </label>
      {tipo === "testimonio" && (
        <>
          <label className="text-sm font-medium">
            De quién es
            <input name="autor" className={campo} />
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input type="checkbox" name="autorizado" className="h-5 w-5" />
            Tengo autorización para usarlo
          </label>
        </>
      )}
      {tipo === "enlace_venta" && (
        <label className="text-sm font-medium">
          Enlace
          <input name="url" inputMode="url" className={campo} />
        </label>
      )}
      <MensajeResultado r={r} />
      <button type="submit" disabled={pendiente} className={botonPrincipal}>
        Añadir {info.singular}
      </button>
    </form>
  );
}
