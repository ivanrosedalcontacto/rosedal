"use client";

import { useActionState } from "react";
import { MensajeResultado, type Resultado } from "@/shared/components/mensaje-resultado";
import { botonPrincipal, campo } from "@/shared/components/estilos";
import { crearPilar, editarPilar, guardarMarca } from "./acciones";
import { COLORES_PILAR, type Pilar } from "./esquemas";

const inicial: Resultado = { error: null };

function CamposPilar({ pilar }: { pilar?: Pilar }) {
  return (
    <>
      <label className="text-sm font-medium">
        Nombre
        <input name="nombre" defaultValue={pilar?.nombre} required className={campo} />
      </label>
      <label className="text-sm font-medium">
        De qué habla este pilar
        <textarea name="descripcion" defaultValue={pilar?.descripcion} rows={2} className={campo} />
      </label>
      <label className="text-sm font-medium">
        Color
        <select name="color" defaultValue={pilar?.color ?? "verde"} className={campo}>
          {COLORES_PILAR.map((c) => (
            <option key={c} value={c}>
              {c[0]?.toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}

export function FormularioPilar() {
  const [r, accion, pendiente] = useActionState(crearPilar, inicial);
  return (
    <form action={accion} className="flex flex-col gap-3">
      <CamposPilar />
      <MensajeResultado r={r} />
      <button type="submit" disabled={pendiente} className={botonPrincipal}>
        Añadir pilar
      </button>
    </form>
  );
}

export function FormularioEditarPilar({ pilar }: { pilar: Pilar }) {
  const [r, accion, pendiente] = useActionState(editarPilar.bind(null, pilar.id), inicial);
  return (
    <form action={accion} className="flex flex-col gap-3 pb-3">
      <CamposPilar pilar={pilar} />
      <MensajeResultado r={r} />
      <button type="submit" disabled={pendiente} className={botonPrincipal}>
        Guardar cambios
      </button>
    </form>
  );
}

type Marca = { nombre_marca: string; audiencia_general: string; tono_general: string };

export function FormularioMarca({ marca }: { marca: Marca }) {
  const [r, accion, pendiente] = useActionState(guardarMarca, inicial);
  return (
    <form action={accion} className="flex flex-col gap-3">
      <label className="text-sm font-medium">
        Nombre de marca
        <input name="nombre_marca" defaultValue={marca.nombre_marca} required className={campo} />
      </label>
      <label className="text-sm font-medium">
        Mi audiencia
        <textarea name="audiencia_general" defaultValue={marca.audiencia_general} rows={3} className={campo} />
      </label>
      <label className="text-sm font-medium">
        Mi tono
        <textarea name="tono_general" defaultValue={marca.tono_general} rows={3} className={campo} />
      </label>
      <MensajeResultado r={r} />
      <button type="submit" disabled={pendiente} className={botonPrincipal}>
        Guardar
      </button>
    </form>
  );
}
