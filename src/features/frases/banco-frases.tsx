"use client";

import { Star } from "lucide-react";
import { useActionState, useState } from "react";
import { BotonCopiar } from "@/shared/components/boton-copiar";
import { MensajeResultado, type Resultado } from "@/shared/components/mensaje-resultado";
import { botonDiscreto, botonPrincipal, campo } from "@/shared/components/estilos";
import { alternarFavorita, archivarFrase, actualizarFrase, crearFrase, crearVarianteFrase, planificarReelPrueba, registrarUsoFrase } from "./acciones";
import type { FraseVista } from "./esquemas";

const inicial: Resultado = { error: null };

export function FormularioFrase() {
  const [r, accion, pendiente] = useActionState(crearFrase, inicial);
  return <form action={accion} className="flex flex-col gap-3 rounded-tarjeta border border-borde bg-fondo-suave p-4">
    <label className="text-sm font-medium">Nueva frase para B-roll<textarea name="texto" rows={3} required className={campo} /></label>
    <label className="text-sm font-medium">Notas (opcional)<input name="notas" className={campo} /></label>
    <MensajeResultado r={r} /><button type="submit" disabled={pendiente} className={botonPrincipal}>{pendiente ? "Guardando…" : "Guardar frase"}</button>
  </form>;
}

export function TarjetaFrase({ frase }: { frase: FraseVista }) {
  const [abierto, setAbierto] = useState<"reel" | "uso" | "variante" | "historial" | "editar" | null>(null);
  const ultimoUso = frase.usos[0];
  return <article className="flex h-full flex-col rounded-tarjeta border border-borde bg-fondo p-4">
    <div className="flex items-start justify-between gap-3"><p className="whitespace-pre-wrap text-[17px] leading-[1.6]">{frase.texto}</p>
      <form action={alternarFavorita.bind(null, frase.id, !frase.favorita)}><button aria-label={frase.favorita ? "Quitar de favoritas" : "Marcar como favorita"} className="p-1 text-aviso"><Star className={`h-5 w-5 ${frase.favorita ? "fill-current" : ""}`} /></button></form>
    </div>
    <div className="mt-4 flex flex-col gap-2 text-sm text-tinta-suave">
      <p>{frase.usos.length === 0 ? "Sin usar" : `Usada ${frase.usos.length} ${frase.usos.length === 1 ? "vez" : "veces"} · última el ${ultimoUso?.fecha}`}</p>
      {frase.reelsPrevistos.map((r) => <p key={r.id}>Reel de prueba previsto{r.fecha_prevista ? ` para ${r.fecha_prevista}` : ""}</p>)}
      {frase.origenTexto && <p>Variante de: «{frase.origenTexto.slice(0, 60)}»</p>}
      {frase.variantes > 0 && <p>Tiene {frase.variantes} {frase.variantes === 1 ? "variante" : "variantes"}</p>}
    </div>
    <div className="mt-4 flex flex-wrap gap-2"><BotonCopiar texto={frase.texto} etiqueta="Copiar frase" />
      <button type="button" onClick={() => setAbierto(abierto === "reel" ? null : "reel")} className={botonDiscreto}>Planificar reel</button>
      <button type="button" onClick={() => setAbierto(abierto === "uso" ? null : "uso")} className={botonDiscreto}>Registrar uso</button>
      <button type="button" onClick={() => setAbierto(abierto === "variante" ? null : "variante")} className={botonDiscreto}>Guardar variante</button>
      <button type="button" onClick={() => setAbierto(abierto === "historial" ? null : "historial")} className={botonDiscreto}>Historial</button>
      <button type="button" onClick={() => setAbierto(abierto === "editar" ? null : "editar")} className={botonDiscreto}>Editar</button>
      <form action={archivarFrase.bind(null, frase.id, !frase.archivada)}><button className={botonDiscreto}>{frase.archivada ? "Restaurar" : "Archivar"}</button></form>
    </div>
    {abierto === "reel" && <FormularioReel frase={frase} />}
    {abierto === "uso" && <FormularioUso frase={frase} />}
    {abierto === "variante" && <FormularioVariante frase={frase} />}
    {abierto === "historial" && <Historial usos={frase.usos} />}
    {abierto === "editar" && <FormularioEditar frase={frase} />}
  </article>;
}

function FormularioEditar({ frase }: { frase: FraseVista }) {
  const [r, accion, pendiente] = useActionState(actualizarFrase.bind(null, frase.id), inicial);
  return <form action={accion} className="mt-4 flex flex-col gap-2 border-t border-borde pt-3">
    <label className="text-sm font-medium">Frase<textarea name="texto" defaultValue={frase.texto} rows={3} className={campo} /></label>
    <label className="text-sm font-medium">Notas<input name="notas" defaultValue={frase.notas} className={campo} /></label>
    <MensajeResultado r={r} /><button disabled={pendiente} className={botonPrincipal}>Guardar cambios</button>
  </form>;
}

function FormularioReel({ frase }: { frase: FraseVista }) {
  const [r, accion, pendiente] = useActionState(planificarReelPrueba.bind(null, frase.id), inicial);
  return <form action={accion} className="mt-4 flex flex-col gap-2 border-t border-borde pt-3">
    <p className="text-sm text-tinta-suave">Crea un reel de prueba Attract de 7 segundos. Planificarlo no cuenta como uso.</p>
    <label className="text-sm font-medium">Texto en pantalla<textarea name="texto_en_pantalla" defaultValue={frase.texto} rows={3} className={campo} /></label>
    <label className="text-sm font-medium">Plano (opcional)<input name="plano" placeholder="Mis manos abriendo la agenda" className={campo} /></label>
    <label className="text-sm font-medium">Fecha prevista (opcional)<input name="fecha_prevista" type="date" className={campo} /></label>
    <MensajeResultado r={r} /><button disabled={pendiente} className={botonPrincipal}>Planificar reel de prueba</button>
  </form>;
}

function FormularioUso({ frase }: { frase: FraseVista }) {
  const [r, accion, pendiente] = useActionState(registrarUsoFrase.bind(null, frase.id), inicial);
  return <form action={accion} className="mt-4 flex flex-col gap-2 border-t border-borde pt-3">
    <label className="text-sm font-medium">Fecha<input name="fecha" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className={campo} /></label>
    <label className="text-sm font-medium">Enlace (opcional)<input name="url" inputMode="url" className={campo} /></label>
    <MensajeResultado r={r} /><button disabled={pendiente} className={botonPrincipal}>Registrar uso</button>
  </form>;
}

function FormularioVariante({ frase }: { frase: FraseVista }) {
  const [r, accion, pendiente] = useActionState(crearVarianteFrase.bind(null, frase.id), inicial);
  return <form action={accion} className="mt-4 flex flex-col gap-2 border-t border-borde pt-3">
    <label className="text-sm font-medium">Variante<textarea name="texto" defaultValue={frase.texto} rows={3} className={campo} /></label>
    <MensajeResultado r={r} /><button disabled={pendiente} className={botonPrincipal}>Guardar variante</button>
  </form>;
}

function Historial({ usos }: { usos: FraseVista["usos"] }) {
  return <div className="mt-4 border-t border-borde pt-3"><h3 className="text-sm font-semibold">Historial de uso</h3>{usos.length === 0 ? <p className="mt-2 text-sm text-tinta-suave">Todavía no hay usos registrados.</p> : <ul className="mt-2 space-y-2">{usos.map((u) => <li key={u.id} className="text-sm"><p>{u.fecha}{u.url ? ` · ${u.url}` : ""}</p><p className="whitespace-pre-wrap text-tinta-suave">{u.texto_usado}</p></li>)}</ul>}</div>;
}

/** Sortea entre el resultado activo; no altera los filtros ni crea un uso. */
export function ElegirFrase({ frases }: { frases: FraseVista[] }) {
  const [indice, setIndice] = useState(0);
  if (frases.length === 0) return <p className="rounded-tarjeta bg-acento-suave p-4 text-sm text-tinta-suave">No hay frases que cumplan estos filtros para elegir hoy.</p>;
  const frase = frases[indice % frases.length]!;
  return <section className="rounded-tarjeta bg-rosa-50 p-5"><h2 className="font-semibold">Una frase para hoy</h2><p className="mt-3 whitespace-pre-wrap text-lg leading-[1.6]">{frase.texto}</p><div className="mt-4 flex flex-wrap gap-2"><BotonCopiar texto={frase.texto} etiqueta="Copiar frase" /><button type="button" onClick={() => setIndice(Math.floor(Math.random() * frases.length))} className={botonDiscreto}>Otra</button></div></section>;
}
