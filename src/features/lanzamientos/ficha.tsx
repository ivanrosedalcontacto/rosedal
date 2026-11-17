import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import type { Oferta } from "@/features/ofertas/esquemas";
import { Etiqueta } from "@/shared/components/etiquetas";
import { formatearFecha } from "@/shared/lib/fechas";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { Fases } from "./fases";
import { BalanceDelLanzamiento } from "@/features/mejoras/balance";
import { BotonEliminarLanzamiento, FormularioEditarLanzamiento, SelectorEstadoLanzamiento } from "./formularios";
import { Hitos } from "./hitos";
import { LineaTiempo, ResumenFinalidades } from "./linea-tiempo";
import {
  ETIQUETA_ESTADO_LANZAMIENTO,
  type Fase,
  type FilaPieza,
  type Hito,
  type Lanzamiento,
} from "./esquemas";

function CabeceraLanzamiento({
  lanzamiento,
  oferta,
  total,
  porEscribir,
}: {
  lanzamiento: Lanzamiento;
  oferta?: Oferta;
  total: number;
  porEscribir: number;
}) {
  return (
    <header className="flex flex-col gap-3 border-b border-borde pb-5">
      <Link href="/lanzamientos" className="text-sm text-verde-700">← Lanzamientos</Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="font-serif text-2xl md:text-[28px]">{lanzamiento.nombre}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Etiqueta tono={lanzamiento.estado === "en_curso" ? "verde" : lanzamiento.estado === "terminado" ? "gris" : "aviso"}>
            {ETIQUETA_ESTADO_LANZAMIENTO[lanzamiento.estado]}
          </Etiqueta>
          {oferta && <Etiqueta tono="menta">{oferta.nombre}</Etiqueta>}
        </div>
      </div>
      {lanzamiento.objetivo && <p className="text-tinta-suave">{lanzamiento.objetivo}</p>}
      <p className="text-sm text-tinta-suave">
        {lanzamiento.fecha_inicio ? formatearFecha(lanzamiento.fecha_inicio) : "Sin fecha de inicio"}
        {" – "}
        {lanzamiento.fecha_fin ? formatearFecha(lanzamiento.fecha_fin) : "sin fecha de fin"}
        {" · "}
        {total} {total === 1 ? "pieza" : "piezas"}
        {porEscribir > 0 ? `, ${porEscribir} por escribir` : ""}
      </p>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="w-48"><SelectorEstadoLanzamiento lanzamientoId={lanzamiento.id} estado={lanzamiento.estado} /></div>
        <BotonEliminarLanzamiento lanzamientoId={lanzamiento.id} nombre={lanzamiento.nombre} />
      </div>
    </header>
  );
}

export default async function FichaLanzamiento({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const supabase = await crearClienteServidor();
  const [{ data: lanzamientoR }, { data: fasesR }, { data: hitosR }, { data: piezasR }, { data: ofertasR }, { data: libresR }, { data: metricasR }] = await Promise.all([
    supabase.from("lanzamientos").select("*").eq("id", id).maybeSingle(),
    supabase.from("lanzamiento_fases").select("*").eq("lanzamiento_id", id).order("orden"),
    supabase.from("lanzamiento_hitos").select("*").eq("lanzamiento_id", id).order("fecha"),
    supabase
      .from("piezas")
      .select("id,titulo,formato,estado,finalidad,fecha_prevista,fase_id")
      .eq("lanzamiento_id", id)
      .is("eliminado_en", null)
      .order("fecha_prevista", { nullsFirst: false }),
    supabase.from("ofertas").select("id,nombre,archivada").order("nombre"),
    supabase
      .from("piezas")
      .select("id,titulo,formato,fecha_prevista")
      .is("lanzamiento_id", null)
      .is("eliminado_en", null)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("pieza_metricas").select("pieza_id,clave,valor,atribucion"),
  ]);
  if (!lanzamientoR) notFound();
  const lanzamiento = lanzamientoR as Lanzamiento;
  const fases = (fasesR ?? []) as Fase[];
  const hitos = (hitosR ?? []) as Hito[];
  const piezas = (piezasR ?? []) as FilaPieza[];
  const ofertas = (ofertasR ?? []) as Oferta[];
  const libres = (libresR ?? []) as { id: string; titulo: string; formato: string; fecha_prevista: string | null }[];
  const oferta = lanzamiento.oferta_id ? ofertas.find((o) => o.id === lanzamiento.oferta_id) : undefined;
  const porEscribir = piezas.filter((p) => ["borrador", "en_preparacion"].includes(p.estado)).length;
  const piezasConMetricas = piezas.map((p) => ({
    titulo: p.titulo,
    formato: p.formato,
    fecha_real: null,
    metricas: ((metricasR ?? []) as { pieza_id: string; clave: string; valor: number | null; atribucion: "confirmada" | "sin_atribuir" | null }[]).filter(
      (m) => m.pieza_id === p.id,
    ),
  }));

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-8 md:px-10 md:py-12">
      <CabeceraLanzamiento lanzamiento={lanzamiento} oferta={oferta} total={piezas.length} porEscribir={porEscribir} />

      <LineaTiempo fases={fases} hitos={hitos} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <main className="flex flex-col gap-8">
          <Hitos lanzamientoId={lanzamiento.id} hitos={hitos} fases={fases} />
          <Fases lanzamientoId={lanzamiento.id} fases={fases} piezas={piezas} piezasLibres={libres} />
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold">Resumen por finalidad</h2>
            <ResumenFinalidades fases={fases} piezas={piezas} />
          </section>
          <BalanceDelLanzamiento nombre={lanzamiento.nombre} piezas={piezasConMetricas} />
        </main>

        <aside className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Datos del lanzamiento</h2>
          <FormularioEditarLanzamiento
            lanzamiento={lanzamiento}
            ofertas={ofertas.map((o) => ({ id: o.id, nombre: o.archivada ? `${o.nombre} (archivada)` : o.nombre }))}
          />
        </aside>
      </div>
    </div>
  );
}
