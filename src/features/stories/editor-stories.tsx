"use client";

import { useActionState } from "react";
import { BotonCopiar } from "@/shared/components/boton-copiar";
import { MensajeResultado, type Resultado } from "@/shared/components/mensaje-resultado";
import { botonDiscreto, botonPrincipal, campo } from "@/shared/components/estilos";
import { borrarTarjeta, crearTarjeta, duplicarTarjeta, guardarEstructuraComoPlantilla, guardarTarjeta, moverTarjeta } from "./acciones";

const inicial: Resultado = { error: null };
export type StoryTarjeta = { id: string; orden: number; titulo: string; que_digo: string; texto_pantalla: string; visual: string; interaccion: "ninguna" | "encuesta" | "pregunta" | "enlace" | "cta"; interaccion_detalle: string };

function textoSecuencia(tarjetas: StoryTarjeta[]) {
  return tarjetas.map((t, i) => [`Story ${i + 1}: ${t.titulo || "Sin título"}`, t.que_digo && `Qué digo: ${t.que_digo}`, t.texto_pantalla && `Texto: ${t.texto_pantalla}`, t.visual && `Visual: ${t.visual}`, t.interaccion !== "ninguna" && `${t.interaccion}: ${t.interaccion_detalle}`].filter(Boolean).join("\n")).join("\n\n");
}

export function EditorStories({ piezaId, tarjetas }: { piezaId: string; tarjetas: StoryTarjeta[] }) {
  return <section className="flex flex-col gap-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">Secuencia de stories</h2><p className="text-sm text-tinta-suave">Sube o baja las tarjetas para cambiar el orden.</p></div><form action={crearTarjeta.bind(null, piezaId)}><button className={botonPrincipal}>+ Añadir tarjeta</button></form></div>
    {tarjetas.length === 0 ? <p className="rounded-tarjeta bg-verde-50 p-4 text-tinta-suave">Añade la primera tarjeta para empezar la secuencia.</p> : <><div className="flex flex-col gap-3">{tarjetas.map((tarjeta, i) => <FormularioTarjeta key={tarjeta.id} piezaId={piezaId} tarjeta={tarjeta} numero={i + 1} primera={i === 0} ultima={i === tarjetas.length - 1} />)}</div><LecturaStories tarjetas={tarjetas} /></>}
    <FormularioPlantillaStories piezaId={piezaId} />
  </section>;
}

/** Guarda la estructura (sin los textos) como plantilla de stories. */
function FormularioPlantillaStories({ piezaId }: { piezaId: string }) {
  const [r, accion, pendiente] = useActionState(guardarEstructuraComoPlantilla.bind(null, piezaId), inicial);
  return <form action={accion} className="flex flex-wrap items-end gap-2 rounded-tarjeta border border-borde p-4">
    <label className="flex-1 text-sm font-medium">
      Guardar la estructura como plantilla
      <input name="nombre" placeholder="Curso o asesoría: os leo" className={campo} />
    </label>
    <button disabled={pendiente} className={botonPrincipal}>Guardar estructura</button>
    {r.error && <MensajeResultado r={r} />}
  </form>;
}

function FormularioTarjeta({ piezaId, tarjeta, numero, primera, ultima }: { piezaId: string; tarjeta: StoryTarjeta; numero: number; primera: boolean; ultima: boolean }) {
  const [r, accion, pendiente] = useActionState(guardarTarjeta.bind(null, piezaId, tarjeta.id), inicial);
  return <form action={accion} className="flex flex-col gap-3 rounded-tarjeta border border-borde p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">Story {numero}</h3><div className="flex gap-1"><button formAction={moverTarjeta.bind(null, piezaId, tarjeta.id, "subir")} disabled={primera} className={botonDiscreto}>Subir</button><button formAction={moverTarjeta.bind(null, piezaId, tarjeta.id, "bajar")} disabled={ultima} className={botonDiscreto}>Bajar</button><button formAction={duplicarTarjeta.bind(null, piezaId, tarjeta.id)} className={botonDiscreto}>Duplicar</button><button formAction={borrarTarjeta.bind(null, piezaId, tarjeta.id)} className={botonDiscreto}>Quitar</button></div></div>
    <label className="text-sm font-medium">Título corto<input name="titulo" defaultValue={tarjeta.titulo} className={campo} /></label>
    <label className="text-sm font-medium">Qué voy a decir<textarea name="que_digo" defaultValue={tarjeta.que_digo} rows={3} className={campo} /></label>
    <label className="text-sm font-medium">Texto en pantalla<textarea name="texto_pantalla" defaultValue={tarjeta.texto_pantalla} rows={2} className={campo} /></label>
    <label className="text-sm font-medium">Imagen o plano que preparo<input name="visual" defaultValue={tarjeta.visual} className={campo} /></label>
    <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium">Elemento interactivo<select name="interaccion" defaultValue={tarjeta.interaccion} className={campo}><option value="ninguna">Ninguno</option><option value="encuesta">Encuesta</option><option value="pregunta">Pregunta</option><option value="enlace">Enlace</option><option value="cta">CTA</option></select></label><label className="text-sm font-medium">Detalle<input name="interaccion_detalle" defaultValue={tarjeta.interaccion_detalle} className={campo} /></label></div>
    <MensajeResultado r={r} /><button disabled={pendiente} className={botonPrincipal}>Guardar story</button>
  </form>;
}

function LecturaStories({ tarjetas }: { tarjetas: StoryTarjeta[] }) {
  return <details className="rounded-tarjeta bg-fondo-suave p-4"><summary className="cursor-pointer font-medium">Leer la secuencia</summary><div className="mt-4 flex flex-col gap-4">{tarjetas.map((t, i) => <article key={t.id}><h3 className="font-semibold">Story {i + 1}: {t.titulo || "Sin título"}</h3>{t.que_digo && <p className="mt-1 whitespace-pre-wrap">{t.que_digo}</p>}{t.texto_pantalla && <p className="mt-1 whitespace-pre-wrap text-tinta-suave">{t.texto_pantalla}</p>}</article>)}<BotonCopiar texto={textoSecuencia(tarjetas)} etiqueta="Copiar secuencia" /></div></details>;
}
