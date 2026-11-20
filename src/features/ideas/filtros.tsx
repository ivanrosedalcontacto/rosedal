"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { botonPrincipal, campo } from "@/shared/components/estilos";
import { hayFiltrosActivos, ORDENES_BANDEJA, type FiltrosBandeja } from "./consultas";
import { ESTADOS_IDEA, ETIQUETA_TIPO, NIVELES, TIPOS_IDEA, type EstadoIdea, type TipoIdea } from "./esquemas";

type Opcion = { id: string; nombre: string };

const ETIQUETA_ORDEN: Record<FiltrosBandeja["orden"], string> = {
  recientes: "Más recientes",
  prioridad: "Prioridad",
  tiempo: "Menos tiempo primero",
};

const ETIQUETA_ESTADO_FILTRO: Record<EstadoIdea, string> = {
  pendiente: "Pendientes",
  en_desarrollo: "En desarrollo",
  archivada: "Archivadas",
};

/** Filtros de la bandeja (en su pestaña): se aplican al instante y se reflejan en la URL. */
export function BarraFiltros({ actual, pilares, ofertas, lanzamientos }: { actual: FiltrosBandeja; pilares: Opcion[]; ofertas: Opcion[]; lanzamientos: Opcion[] }) {
  const router = useRouter();

  function navegar(cambios: Partial<FiltrosBandeja>) {
    const todo: FiltrosBandeja = { ...actual, ...cambios };
    const p = new URLSearchParams();
    p.set("vista", "bandeja");
    (Object.keys(todo) as (keyof FiltrosBandeja)[]).forEach((clave) => {
      const v = todo[clave];
      // «recientes» es el orden por defecto: no ensucia la dirección.
      if (v && !(clave === "orden" && v === "recientes")) p.set(clave, v);
    });
    router.push(`/ideas?${p.toString()}`);
  }

  function navegarDelFormulario(form: HTMLFormElement) {
    const d = new FormData(form);
    const g = (k: string) => (d.get(k) ?? "").toString();
    const orden = g("orden");
    navegar({
      tipo: g("tipo"),
      estado: g("estado"),
      pilar: g("pilar"),
      oferta: g("oferta"),
      lanzamiento: g("lanzamiento"),
      relevancia: g("relevancia"),
      minutos: g("minutos"),
      orden: (ORDENES_BANDEJA as readonly string[]).includes(orden) ? (orden as FiltrosBandeja["orden"]) : "recientes",
    });
  }

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    navegarDelFormulario(e.currentTarget);
  }

  function cambiarSelect(e: ChangeEvent<HTMLSelectElement>) {
    const form = e.currentTarget.form;
    if (form) navegarDelFormulario(form);
  }

  const activos: { clave: keyof FiltrosBandeja; texto: string }[] = [];
  if (actual.tipo) activos.push({ clave: "tipo", texto: ETIQUETA_TIPO[actual.tipo as TipoIdea] });
  if (actual.estado) activos.push({ clave: "estado", texto: ETIQUETA_ESTADO_FILTRO[actual.estado as EstadoIdea] });
  if (actual.pilar) {
    const nombre = pilares.find((p) => p.id === actual.pilar)?.nombre;
    activos.push({ clave: "pilar", texto: nombre ?? "Pilar" });
  }
  if (actual.oferta) {
    const nombre = ofertas.find((o) => o.id === actual.oferta)?.nombre;
    activos.push({ clave: "oferta", texto: nombre ?? "Oferta" });
  }
  if (actual.lanzamiento) {
    const nombre = lanzamientos.find((l) => l.id === actual.lanzamiento)?.nombre;
    activos.push({ clave: "lanzamiento", texto: nombre ?? "Lanzamiento" });
  }
  if (actual.relevancia) {
    activos.push({ clave: "relevancia", texto: `Relevancia: ${NIVELES[Number(actual.relevancia) as 1 | 2 | 3]} o superior` });
  }
  if (actual.minutos) {
    activos.push({ clave: "minutos", texto: actual.minutos === "mas" ? "Más de 60 min" : `Hasta ${actual.minutos} min` });
  }

  const hay = hayFiltrosActivos(actual);
  // Al cambiar un filtro el formulario se rehace con los valores nuevos; «orden» queda fuera
  // para que el panel no se cierre solo al ordenar.
  const claveFormulario = [actual.tipo, actual.estado, actual.pilar, actual.oferta, actual.lanzamiento, actual.relevancia, actual.minutos].join("|");

  return (
    <form key={claveFormulario} onSubmit={enviar} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {activos.map(({ clave, texto }) => (
            <button
              key={clave}
              type="button"
              onClick={() => navegar({ [clave]: "" } as Partial<FiltrosBandeja>)}
              className="inline-flex min-h-9 items-center gap-1 rounded-full bg-acento px-3 py-1 text-xs font-medium text-acento-texto"
            >
              {texto}
              <X className="h-3 w-3" aria-hidden />
              <span className="sr-only">Quitar este filtro</span>
            </button>
          ))}
          {hay && (
            <button
              type="button"
              onClick={() => navegar({ tipo: "", estado: "", pilar: "", oferta: "", lanzamiento: "", relevancia: "", minutos: "" })}
              className="min-h-9 px-2 text-sm text-verde-700"
            >
              Limpiar
            </button>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-tinta-suave">Ordenar por</span>
          <select name="orden" defaultValue={actual.orden} onChange={cambiarSelect} className={`${campo} mt-0 min-h-11 w-auto py-2`}>
            {ORDENES_BANDEJA.map((o) => (
              <option key={o} value={o}>
                {ETIQUETA_ORDEN[o]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rounded-tarjeta border border-borde bg-fondo-suave px-4 py-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-medium">
            Tipo
            <select name="tipo" defaultValue={actual.tipo} onChange={cambiarSelect} className={campo}>
              <option value="">Ideas e ideas de email</option>
              {TIPOS_IDEA.map((t) => (
                <option key={t} value={t}>
                  {ETIQUETA_TIPO[t]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Estado
            <select name="estado" defaultValue={actual.estado} onChange={cambiarSelect} className={campo}>
              <option value="">Sin archivar</option>
              {ESTADOS_IDEA.map((e) => (
                <option key={e} value={e}>
                  {ETIQUETA_ESTADO_FILTRO[e]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Pilar
            <select name="pilar" defaultValue={actual.pilar} onChange={cambiarSelect} className={campo}>
              <option value="">Cualquier pilar</option>
              {pilares.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Oferta
            <select name="oferta" defaultValue={actual.oferta} onChange={cambiarSelect} className={campo}>
              <option value="">Cualquier oferta</option>
              {ofertas.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Lanzamiento
            <select name="lanzamiento" defaultValue={actual.lanzamiento} onChange={cambiarSelect} className={campo}>
              <option value="">Cualquier lanzamiento</option>
              {lanzamientos.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Relevancia mínima
            <select name="relevancia" defaultValue={actual.relevancia} onChange={cambiarSelect} className={campo}>
              <option value="">Cualquier relevancia</option>
              <option value="1">Baja o superior</option>
              <option value="2">Media o superior</option>
              <option value="3">Alta</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            Tiempo máximo de preparación
            <select name="minutos" defaultValue={actual.minutos} onChange={cambiarSelect} className={campo}>
              <option value="">Cualquier tiempo</option>
              <option value="15">Hasta 15 min</option>
              <option value="30">Hasta 30 min</option>
              <option value="60">Hasta 60 min</option>
              <option value="mas">Más de 60 min</option>
            </select>
          </label>
          <div className="sm:col-span-2 lg:col-span-3">
            <button type="submit" className={botonPrincipal}>
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
