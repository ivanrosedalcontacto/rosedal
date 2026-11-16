"use client";

import { useActionState } from "react";
import { MensajeResultado, type Resultado } from "@/shared/components/mensaje-resultado";
import { botonPrincipal, campo } from "@/shared/components/estilos";
import { actualizarOferta, crearObjecion, crearOferta } from "./acciones";
import type { Oferta } from "./esquemas";

const inicial: Resultado = { error: null };

function CamposOferta({ oferta }: { oferta?: Oferta }) {
  return (
    <>
      <label className="text-sm font-medium">
        Nombre
        <input name="nombre" defaultValue={oferta?.nombre} required className={campo} />
      </label>
      <label className="text-sm font-medium">
        Tipo
        <select name="tipo" defaultValue={oferta?.tipo ?? "producto"} className={campo}>
          <option value="producto">Producto</option>
          <option value="servicio">Servicio</option>
        </select>
      </label>
      <label className="text-sm font-medium">
        Para quién es
        <textarea name="publico" defaultValue={oferta?.publico} rows={2} className={campo} />
      </label>
      <label className="text-sm font-medium">
        Qué problema resuelve
        <textarea name="problema" defaultValue={oferta?.problema} rows={2} className={campo} />
      </label>
      <label className="text-sm font-medium">
        Propuesta de valor
        <textarea name="propuesta_valor" defaultValue={oferta?.propuesta_valor} rows={2} className={campo} />
      </label>
      <label className="text-sm font-medium">
        Vía de compra o reserva
        <input
          name="via_compra"
          defaultValue={oferta?.via_compra}
          placeholder="Compra en este enlace · Escríbeme SESIÓN por privado"
          className={campo}
        />
      </label>
      <label className="text-sm font-medium">
        Enlace (opcional)
        <input name="via_compra_url" defaultValue={oferta?.via_compra_url ?? ""} inputMode="url" className={campo} />
      </label>
      <label className="text-sm font-medium">
        Precio (opcional)
        <input name="precio" defaultValue={oferta?.precio ?? ""} className={campo} />
      </label>
    </>
  );
}

export function FormularioNuevaOferta() {
  const [r, accion, pendiente] = useActionState(crearOferta, inicial);
  return (
    <form action={accion} className="flex flex-col gap-3">
      <CamposOferta />
      <MensajeResultado r={r} />
      <button type="submit" disabled={pendiente} className={botonPrincipal}>
        Crear oferta
      </button>
    </form>
  );
}

export function FormularioOferta({ oferta }: { oferta: Oferta }) {
  const [r, accion, pendiente] = useActionState(actualizarOferta.bind(null, oferta.id), inicial);
  return (
    <form action={accion} className="flex flex-col gap-3">
      <CamposOferta oferta={oferta} />
      <MensajeResultado r={r} />
      <button type="submit" disabled={pendiente} className={botonPrincipal}>
        Guardar cambios
      </button>
    </form>
  );
}

export function FormularioObjecion({ ofertaId }: { ofertaId: string }) {
  const [r, accion, pendiente] = useActionState(crearObjecion.bind(null, ofertaId), inicial);
  return (
    <form action={accion} className="flex flex-col gap-3" key={r.ok ? "ok" : "nueva"}>
      <label className="text-sm font-medium">
        Objeción, con sus palabras
        <input name="objecion" required className={campo} />
      </label>
      <label className="text-sm font-medium">
        Cómo respondo (opcional)
        <textarea name="respuesta" rows={2} className={campo} />
      </label>
      <MensajeResultado r={r} />
      <button type="submit" disabled={pendiente} className={botonPrincipal}>
        Añadir objeción
      </button>
    </form>
  );
}
