﻿import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { borrarVersion, crearDerivada, elegirVersion, enviarPiezaAPapelera, marcarEstadoPieza } from "@/features/piezas/acciones";
import { EtiquetasPieza } from "@/features/piezas/etiquetas-piezas";
import { BotonDeshacerPublicacion, ComparadorVersiones } from "@/features/piezas/controles-clientes";
import { EditorStories, type StoryTarjeta } from "@/features/stories/editor-stories";
import { EditorEmail } from "@/features/email/editor-email";
import type { Asunto } from "@/features/email/esquemas";
import { FormularioNuevaVersion, FormularioPieza, FormularioPlanificar, FormularioPublicar, FormularioVersion } from "@/features/piezas/formularios";
import { HistorialDeFechas } from "@/features/mejoras/historial";
import { BotonConcentracion, MarcaPerenne } from "@/features/mejoras/pieza-extras";
import { ETIQUETA_ESTADO, estadosDeFormato, faltaCta, type Pieza, type VersionPieza } from "@/features/piezas/esquemas";
import type { Pilar } from "@/features/ajustes/esquemas";
import type { Oferta } from "@/features/ofertas/esquemas";
import { BotonCopiar } from "@/shared/components/boton-copiar";
import { promptAdaptar, promptGanchos } from "@/features/mejoras/prompts";
import { botonDiscreto } from "@/shared/components/estilos";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";

function textoGuion(version: VersionPieza) {
  return [["Gancho", version.gancho], ["Desarrollo", version.desarrollo], ["Cierre", version.cierre]].filter(([, texto]) => texto).map(([titulo, texto]) => `${titulo}\n${texto}`).join("\n\n");
}

export default async function FichaPieza({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const supabase = await crearClienteServidor();
  const { data: piezaR } = await supabase.from("piezas").select("*").eq("id", id).is("eliminado_en", null).maybeSingle();
  if (!piezaR) notFound();
  const pieza = piezaR as Pieza;
  const [{ data: versionesR }, { data: pilaresR }, { data: ofertasR }, { data: lanzamientosR }, { data: fasesR }, { data: ideaR }, { data: origenR }, { data: derivadasR }, { data: tarjetasR }, { data: asuntosR }, { data: marcaR }, { data: pasoR }, { data: cambiosR }, { data: recursosR }] = await Promise.all([
    supabase.from("pieza_versiones").select("*").eq("pieza_id", id).eq("tipo", "guion").order("orden"),
    supabase.from("pilares").select("id,nombre,color,archivado").order("orden"),
    supabase.from("ofertas").select("id,nombre,archivada").order("nombre"),
    supabase.from("lanzamientos").select("id,nombre").order("fecha_inicio", { ascending: false, nullsFirst: false }),
    supabase.from("lanzamiento_fases").select("id,lanzamiento_id,nombre,tipo").order("orden"),
    pieza.idea_id ? supabase.from("ideas").select("id,texto").eq("id", pieza.idea_id).maybeSingle() : Promise.resolve({ data: null }),
    pieza.origen_pieza_id ? supabase.from("piezas").select("id,titulo,formato").eq("id", pieza.origen_pieza_id).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from("piezas").select("id,titulo,formato").eq("origen_pieza_id", id).is("eliminado_en", null),
    pieza.formato === "stories" ? supabase.from("story_tarjetas").select("*").eq("pieza_id", id).order("orden") : Promise.resolve({ data: [] }),
    pieza.formato === "email" ? supabase.from("pieza_versiones").select("id,asunto,elegida,orden").eq("pieza_id", id).eq("tipo", "asunto").order("orden") : Promise.resolve({ data: [] }),
    pieza.formato === "email" ? supabase.from("ajustes").select("nombre_marca").maybeSingle() : Promise.resolve({ data: null }),
    pieza.formato === "email" ? supabase.from("secuencia_pasos").select("secuencia_id,secuencias_email(programacion,nombre)").eq("pieza_id", id).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from("pieza_cambios_fecha").select("id,fecha_anterior,fecha_nueva,cambiado_en").eq("pieza_id", id).order("cambiado_en", { ascending: false }),
    supabase.from("recursos_marca").select("id,tipo,texto,titulo").in("tipo", ["gancho", "hashtags"]).is("eliminado_en", null),
  ]);
  const versiones = (versionesR ?? []) as VersionPieza[];
  const elegida = versiones.find((x) => x.elegida) ?? versiones[0];
  const pilares = (pilaresR ?? []) as Pilar[];
  const ofertas = (ofertasR ?? []) as Oferta[];
  const lanzamientos = (lanzamientosR ?? []) as { id: string; nombre: string }[];
  const fases = (fasesR ?? []) as { id: string; lanzamiento_id: string; nombre: string; tipo: string }[];
  const idea = ideaR as { id: string; texto: string } | null;
  const origen = origenR as { id: string; titulo: string; formato: string } | null;
  const derivadas = (derivadasR ?? []) as { id: string; titulo: string; formato: string }[];
  const tarjetas = (tarjetasR ?? []) as StoryTarjeta[];
  const asuntos = (asuntosR ?? []) as Asunto[];
  const marca = (marcaR as { nombre_marca: string } | null)?.nombre_marca ?? "Rosedal";
  const cambios = (cambiosR ?? []) as { id: string; fecha_anterior: string | null; fecha_nueva: string | null; cambiado_en: string }[];
  type PasoConSecuencia = { secuencia_id: string; secuencias_email: { programacion: string; nombre: string } | { programacion: string; nombre: string }[] | null };
  const paso = pasoR as PasoConSecuencia | null;
  const relacionSecuencia = paso && (Array.isArray(paso.secuencias_email) ? paso.secuencias_email[0] : paso.secuencias_email);
  const enMarcha = pieza.formato === "email" && relacionSecuencia?.programacion === "relativa";
  const esEmail = pieza.formato === "email";
  const lanzamientoPieza = pieza.lanzamiento_id ? lanzamientos.find((l) => l.id === pieza.lanzamiento_id) : undefined;
  const fasePieza = pieza.fase_id ? fases.find((f) => f.id === pieza.fase_id) : undefined;
  const datosPieza = {
    titulo: pieza.titulo,
    formato: pieza.formato,
    canal: pieza.canal,
    finalidad: pieza.finalidad,
    pilar: pieza.pilar_id ? (pilares.find((p) => p.id === pieza.pilar_id) ?? null) : null,
    oferta: pieza.oferta_id ? (ofertas.find((o) => o.id === pieza.oferta_id) ?? null) : null,
    ganchoActual: elegida?.gancho,
    desarrollo: elegida?.desarrollo,
  };
  return <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-10 md:py-12">
    <Link href="/biblioteca" className="text-sm text-verde-700">← Biblioteca</Link>
    <header className="mt-3 flex flex-col gap-3 border-b border-borde pb-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="font-serif text-2xl md:text-[28px]">{pieza.titulo}</h1><div className="mt-2"><EtiquetasPieza formato={pieza.formato} estado={pieza.estado} finalidad={pieza.finalidad} /></div></div>
        <div className="flex flex-wrap gap-2">
          {!pieza.publicado_snapshot && estadosDeFormato(pieza.formato).filter((e) => e !== pieza.estado && e !== "publicado").map((e) => <form key={e} action={marcarEstadoPieza.bind(null, pieza.id, e)}><button className={botonDiscreto}>Pasar a {ETIQUETA_ESTADO[e]}</button></form>)}
          <form action={crearDerivada.bind(null, pieza.id, "adaptacion")}><button className={botonDiscreto}>Crear adaptación</button></form>
          <BotonCopiar texto={promptAdaptar(datosPieza, "email")} etiqueta="Copiar prompt para adaptar" />
          {pieza.publicado_snapshot && <form action={crearDerivada.bind(null, pieza.id, "reutilizacion")}><button className={botonDiscreto}>Reutilizar</button></form>}
          {pieza.publicado_snapshot && <BotonDeshacerPublicacion piezaId={pieza.id} />}
          <form action={enviarPiezaAPapelera.bind(null, pieza.id)}><button className={botonDiscreto}>Papelera</button></form>
        </div>
      </div>
      {idea && <p className="text-sm text-tinta-suave">De la idea: <Link href={`/ideas/${idea.id}`} className="text-verde-700">{idea.texto}</Link></p>}
      {lanzamientoPieza && (
        <p className="text-sm text-tinta-suave">
          Del lanzamiento: <Link href={`/lanzamientos/${lanzamientoPieza.id}`} className="text-verde-700">{lanzamientoPieza.nombre}</Link>
          {fasePieza && ` · fase ${fasePieza.nombre}`}
        </p>
      )}
      {origen && <p className="text-sm text-tinta-suave">{pieza.relacion_origen === "reutilizacion" ? "Reutiliza" : "Adaptación de"}: <Link href={`/piezas/${origen.id}`} className="text-verde-700">{origen.formato} · {origen.titulo}</Link></p>}
      {paso && relacionSecuencia && <p className="text-sm text-tinta-suave">Paso de la secuencia: <Link href={`/email/secuencias/${paso.secuencia_id}`} className="text-verde-700">{relacionSecuencia.nombre}</Link>{enMarcha ? " · se muestra como «En marcha»" : ""}</p>}
      {pieza.publicado_snapshot && (
        <p className="rounded-tarjeta bg-verde-50 px-4 py-3 text-sm text-verde-700">
          {esEmail ? (enMarcha ? "En marcha · copia del correo conservada." : `Enviado el ${pieza.fecha_real ?? "sin fecha"} · asunto, vista previa y cuerpo conservados.`) : `Publicado el ${pieza.fecha_real ?? "sin fecha"}${pieza.fecha_prevista ? ` (prevista: ${pieza.fecha_prevista})` : ""} · el contenido está congelado.`}
          {pieza.url_publicada && (
            <>
              {" · "}
              <a href={pieza.url_publicada} className="underline">
                Ver la publicación
              </a>
            </>
          )}
        </p>
      )}
      {faltaCta(pieza) && ["editado", "publicado"].includes(pieza.estado) && <p className="rounded-tarjeta bg-aviso-fondo px-4 py-3 text-sm text-aviso">Falta la llamada a la acción: elige la oferta, qué pides y cómo hacerlo.</p>}
    </header>
    <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
      <main className="flex flex-col gap-8">
        {pieza.formato === "stories" && <EditorStories piezaId={pieza.id} tarjetas={tarjetas} />}
        {esEmail && <EditorEmail pieza={pieza} asuntos={asuntos} marca={marca} bloqueado={Boolean(pieza.publicado_snapshot)} enMarcha={enMarcha} />}
        {!esEmail && <section className="flex flex-col gap-4"><h2 className="text-xl font-semibold">Guion</h2>
          {elegida && <><div className="flex flex-wrap items-center gap-2">{versiones.map((v) => <div key={v.id} className="flex items-center gap-1"><form action={elegirVersion.bind(null, pieza.id, v.id)}><button className={`rounded-full px-3 py-1.5 text-sm ${v.elegida ? "bg-verde-100 text-verde-700" : "border border-borde"}`}>{v.nombre}{v.elegida ? " · La que voy a usar" : ""}</button></form>{versiones.length > 1 && <form action={borrarVersion.bind(null, pieza.id, v.id)}><button className="px-1 text-xs text-tinta-suave">Quitar</button></form>}</div>)}</div><FormularioVersion piezaId={pieza.id} version={elegida} /><div className="flex flex-wrap gap-2"><BotonCopiar texto={textoGuion(elegida)} etiqueta="Copiar guion" /><BotonCopiar texto={promptGanchos(datosPieza)} etiqueta="Copiar prompt de ganchos" /></div></>}
          <ComparadorVersiones versiones={versiones} />
          <FormularioNuevaVersion piezaId={pieza.id} />
        </section>}
        {derivadas.length > 0 && <section><h2 className="text-xl font-semibold">Derivadas de esta pieza</h2><ul className="mt-3">{derivadas.map((d) => <li key={d.id}><Link href={`/piezas/${d.id}`} className="text-verde-700">{d.formato} · {d.titulo}</Link></li>)}</ul></section>}
        {recursosR && recursosR.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold">Ganchos y hashtags</h2>
            <ul className="flex flex-wrap gap-2">
              {(recursosR as { id: string; tipo: string; texto: string; titulo: string }[]).map((recurso) => (
                <li key={recurso.id}>
                  <BotonCopiar texto={recurso.texto} etiqueta={recurso.tipo === "gancho" ? recurso.titulo || "Gancho" : "Hashtags"} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>      <aside className="flex flex-col gap-6">
        <section><h2 className="mb-3 text-xl font-semibold">Clasificación</h2><FormularioPieza pieza={pieza} pilares={pilares} ofertas={ofertas} /></section>
        {!pieza.publicado_snapshot && <>{!(esEmail && enMarcha) && <FormularioPlanificar piezaId={pieza.id} fecha={pieza.fecha_prevista} />}<FormularioPublicar piezaId={pieza.id} fecha={pieza.fecha_real} tipo={esEmail ? "email" : "pieza"} /></>}
        <MarcaPerenne piezaId={pieza.id} perenne={pieza.perenne} />
        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">Historial de fechas</h2>
          <HistorialDeFechas cambios={cambios} />
        </section>
        <BotonConcentracion />
      </aside>
    </div>
  </div>;
}
