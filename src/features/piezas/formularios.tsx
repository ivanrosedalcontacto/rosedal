"use client";

import { useActionState, useState } from "react";
import { ContadorDeTexto } from "@/features/mejoras/pieza-extras";
import { MensajeResultado, type Resultado } from "@/shared/components/mensaje-resultado";
import { botonPrincipal, campo } from "@/shared/components/estilos";
import { crearPieza, crearVersion, guardarPieza, guardarVersion, planificarPieza, publicarPieza } from "./acciones";
import {
  ETIQUETA_FINALIDAD, ETIQUETA_FORMATO, FINALIDADES, FORMATOS_PIEZA,
  type FormatoPieza, type Pieza, type VersionPieza,
} from "./esquemas";

const inicial: Resultado = { error: null };
type Opcion = { id: string; nombre: string };

export function FormularioNuevaPieza({
  ideaId,
  titulo,
  formatoInicial,
  ofertaId,
  lanzamientoId,
  faseId,
  fechaPrevista,
  pilarId,
  contexto,
}: {
  ideaId?: string;
  titulo?: string;
  formatoInicial?: FormatoPieza;
  ofertaId?: string;
  lanzamientoId?: string;
  faseId?: string;
  fechaPrevista?: string;
  pilarId?: string;
  contexto?: string;
}) {
  const [r, accion, pendiente] = useActionState(crearPieza, inicial);
  return (
    <form action={accion} className="flex flex-col gap-3">
      <input type="hidden" name="idea_id" value={ideaId ?? ""} />
      <input type="hidden" name="oferta_id" value={ofertaId ?? ""} />
      <input type="hidden" name="lanzamiento_id" value={lanzamientoId ?? ""} />
      <input type="hidden" name="fase_id" value={faseId ?? ""} />
      <input type="hidden" name="fecha_prevista" value={fechaPrevista ?? ""} />
      <input type="hidden" name="pilar_id" value={pilarId ?? ""} />
      {contexto && <p className="rounded-boton bg-verde-50 px-3 py-2 text-sm text-tinta-suave">{contexto}</p>}
      <label className="text-sm font-medium">Título<input name="titulo" defaultValue={titulo} required className={campo} /></label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">Formato
          <select name="formato" defaultValue={formatoInicial ?? "reel"} className={campo}>{FORMATOS_PIEZA.map((x) => <option key={x} value={x}>{ETIQUETA_FORMATO[x]}</option>)}</select>
        </label>
        <label className="text-sm font-medium">Finalidad
          <select name="finalidad" defaultValue="" className={campo}><option value="">Sin definir</option>{FINALIDADES.map((x) => <option key={x} value={x}>{ETIQUETA_FINALIDAD[x]}</option>)}</select>
        </label>
      </div>
      <MensajeResultado r={r} />
      <button type="submit" disabled={pendiente} className={botonPrincipal}>{pendiente ? "Creando…" : "Crear pieza"}</button>
    </form>
  );
}

export function FormularioPieza({ pieza, pilares, ofertas }: { pieza: Pieza; pilares: Opcion[]; ofertas: Opcion[] }) {
  const [r, accion, pendiente] = useActionState(guardarPieza.bind(null, pieza.id), inicial);
  const bloqueada = Boolean(pieza.publicado_snapshot);
  const [textoPublicacion, setTextoPublicacion] = useState(pieza.texto_publicacion);
  return (
    <form action={accion} className="flex flex-col gap-5">
      <fieldset disabled={bloqueada} className="flex flex-col gap-5 disabled:opacity-70">
        <label className="text-sm font-medium">Título<input name="titulo" defaultValue={pieza.titulo} required className={campo} /></label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium">Formato<select name="formato" defaultValue={pieza.formato} className={campo}>{FORMATOS_PIEZA.map((x) => <option key={x} value={x}>{ETIQUETA_FORMATO[x]}</option>)}</select></label>
          <label className="text-sm font-medium">Pilar<select name="pilar_id" defaultValue={pieza.pilar_id ?? ""} className={campo}><option value="">Sin pilar</option>{pilares.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}</select></label>
          <label className="text-sm font-medium">Finalidad<select name="finalidad" defaultValue={pieza.finalidad ?? ""} className={campo}><option value="">Sin definir</option>{FINALIDADES.map((x) => <option key={x} value={x}>{ETIQUETA_FINALIDAD[x]}</option>)}</select></label>
        </div>
        {pieza.finalidad === "convert" && <BloqueConvert pieza={pieza} ofertas={ofertas} />}
        {pieza.formato === "email" ? (
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Clasificación del correo</h2>
            <label className="text-sm font-medium">Temática<input name="email_tematica" defaultValue={pieza.email_tematica ?? ""} placeholder="Rutinas, lanzamiento, poscompra…" className={campo} /></label>
            <label className="text-sm font-medium">Audiencia<input name="email_audiencia" defaultValue={pieza.email_audiencia ?? ""} placeholder="Quien acaba de comprar el curso" className={campo} /></label>
          </section>
        ) : (
          <>
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">Texto de la publicación</h2>
              <textarea name="texto_publicacion" value={textoPublicacion} onChange={(e) => setTextoPublicacion(e.target.value)} rows={5} className={campo} />
              <ContadorDeTexto texto={textoPublicacion} maximo={2200} />
              <label className="text-sm font-medium">Texto en pantalla<textarea name="texto_en_pantalla" defaultValue={pieza.texto_en_pantalla} rows={3} className={campo} /></label>
            </section>
          </>
        )}
      </fieldset>
      {bloqueada ? <p className="rounded-tarjeta bg-verde-50 px-4 py-3 text-sm text-verde-700">El contenido publicado queda congelado. Crea una adaptación o reutilízalo para cambiarlo.</p> : <><MensajeResultado r={r} /><button type="submit" disabled={pendiente} className={botonPrincipal}>{pendiente ? "Guardando…" : "Guardar cambios"}</button></>}
    </form>
  );
}

function BloqueConvert({ pieza, ofertas }: { pieza: Pieza; ofertas: Opcion[] }) {
  return <section className="flex flex-col gap-3 rounded-tarjeta bg-rosa-50 p-4">
    <h2 className="font-semibold">Llamada a la acción</h2>
    <label className="text-sm font-medium">Oferta<select name="oferta_id" defaultValue={pieza.oferta_id ?? ""} className={campo}><option value="">Elige una oferta</option>{ofertas.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}</select></label>
    <label className="text-sm font-medium">Qué acción pido<input name="cta_accion" defaultValue={pieza.cta_accion ?? ""} placeholder="Compra el curso, reserva tu sesión…" className={campo} /></label>
    <label className="text-sm font-medium">Cómo puede hacerlo<input name="cta_como" defaultValue={pieza.cta_como ?? ""} placeholder="Escríbeme SESIÓN por privado…" className={campo} /></label>
    <label className="text-sm font-medium">Enlace opcional<input name="cta_url" defaultValue={pieza.cta_url ?? ""} inputMode="url" className={campo} /></label>
  </section>;
}

export function FormularioVersion({ piezaId, version }: { piezaId: string; version: VersionPieza }) {
  const [r, accion, pendiente] = useActionState(guardarVersion.bind(null, piezaId, version.id), inicial);
  return <form action={accion} className="flex flex-col gap-3">
    <label className="text-sm font-medium">Nombre de la versión<input name="nombre" defaultValue={version.nombre} className={campo} /></label>
    <label className="text-sm font-medium">Gancho<textarea name="gancho" defaultValue={version.gancho} rows={3} className={campo} /></label>
    <label className="text-sm font-medium">Desarrollo<textarea name="desarrollo" defaultValue={version.desarrollo} rows={8} className={campo} /></label>
    <label className="text-sm font-medium">Cierre<textarea name="cierre" defaultValue={version.cierre} rows={3} className={campo} /></label>
    <MensajeResultado r={r} /><button type="submit" disabled={pendiente} className={botonPrincipal}>Guardar guion</button>
  </form>;
}

export function FormularioNuevaVersion({ piezaId }: { piezaId: string }) {
  const [r, accion, pendiente] = useActionState(crearVersion.bind(null, piezaId), inicial);
  return <form action={accion} className="flex items-end gap-2">
    <label className="flex-1 text-sm font-medium">Nueva versión<input name="nombre" placeholder="Versión 2" className={campo} /></label>
    <button type="submit" disabled={pendiente} className={botonPrincipal}>Probar otra</button><MensajeResultado r={r} />
  </form>;
}

export function FormularioPlanificar({ piezaId, fecha }: { piezaId: string; fecha: string | null }) {
  const [r, accion, pendiente] = useActionState(planificarPieza.bind(null, piezaId), inicial);
  return <form action={accion} className="flex flex-wrap items-end gap-2 rounded-tarjeta bg-fondo-suave p-3">
    <label className="text-sm font-medium">Fecha prevista<input name="fecha_prevista" type="date" defaultValue={fecha ?? ""} className={campo} /></label>
    <button type="submit" disabled={pendiente} className={botonPrincipal}>Planificar</button><MensajeResultado r={r} />
  </form>;
}

export function FormularioPublicar({ piezaId, fecha, tipo = "pieza" }: { piezaId: string; fecha: string | null; tipo?: "pieza" | "email" }) {
  const [r, accion, pendiente] = useActionState(publicarPieza.bind(null, piezaId), inicial);
  const esEmail = tipo === "email";
  return <form action={accion} className="flex flex-col gap-2 rounded-tarjeta bg-verde-50 p-3">
    <p className="text-sm font-medium">{esEmail ? "Marcar como enviado y conservar la copia" : "Publicar y congelar contenido"}</p>
    <label className="text-sm">{esEmail ? "Fecha real de envío" : "Fecha real"}<input name="fecha_real" type="date" defaultValue={fecha ?? new Date().toISOString().slice(0, 10)} className={campo} /></label>
    <label className="text-sm">{esEmail ? "Enlace a la versión web (opcional)" : "Enlace publicado (opcional)"}<input name="url_publicada" inputMode="url" className={campo} /></label>
    <button type="submit" disabled={pendiente} className={botonPrincipal}>{pendiente ? (esEmail ? "Marcando…" : "Publicando…") : esEmail ? "Marcar como enviado" : "Marcar como publicada"}</button><MensajeResultado r={r} />
  </form>;
}
