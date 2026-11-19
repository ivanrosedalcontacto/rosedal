import Link from "next/link";
import { ETIQUETA_FINALIDAD, ETIQUETA_ESTADO, FINALIDADES, type EstadoPieza, type Finalidad } from "@/features/piezas/esquemas";
import type { Pilar } from "@/features/ajustes/esquemas";
import type { Oferta } from "@/features/ofertas/esquemas";
import { Etiqueta, EtiquetaPilar } from "@/shared/components/etiquetas";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { leerFiltrosEmail, sanearBusqueda, valor, type Parametros } from "./consultas";
import { esFecha, formatearFecha, formatearFechaCorta, hoyMadrid, lunesDe, sumarDias } from "@/shared/lib/fechas";
import {
  ETIQUETA_PESTANA,
  PESTANAS_BROADCAST,
  type CorreoResumen,
  type PestanaBroadcast,
} from "./esquemas";

const CAMPOS_CORREO = "id,titulo,estado,finalidad,fecha_prevista,fecha_real,email_preview,email_tematica,email_audiencia,pilar_id,oferta_id,lanzamiento_id";

function leerPestana(sp: Parametros): PestanaBroadcast {
  const p = valor(sp, "pestana");
  return (PESTANAS_BROADCAST as readonly string[]).includes(p) ? (p as PestanaBroadcast) : "semana";
}

function etiquetaEstado(estado: string): string {
  if (estado === "publicado") return "Enviado";
  return ETIQUETA_ESTADO[estado as EstadoPieza] ?? estado;
}

export async function Broadcasts({ sp }: { sp: Parametros }) {
  const pestana = leerPestana(sp);
  const filtros = leerFiltrosEmail(sp);
  const hoy = hoyMadrid();
  const semana = valor(sp, "semana");
  const lunes = lunesDe(esFecha(semana) ? semana : hoy);
  const domingo = sumarDias(lunes, 6);

  const supabase = await crearClienteServidor();
  let consulta = supabase.from("piezas").select(CAMPOS_CORREO).eq("formato", "email").is("eliminado_en", null);
  if (pestana === "semana") consulta = consulta.gte("fecha_prevista", lunes).lte("fecha_prevista", domingo).order("fecha_prevista");
  else if (pestana === "sin_fecha") consulta = consulta.is("fecha_prevista", null).neq("estado", "publicado").order("created_at", { ascending: false });
  else consulta = consulta.eq("estado", "publicado").order("fecha_real", { ascending: false, nullsFirst: false });
  if (filtros.pilar) consulta = consulta.eq("pilar_id", filtros.pilar);
  if (filtros.finalidad) consulta = consulta.eq("finalidad", filtros.finalidad);
  if (filtros.oferta) consulta = consulta.eq("oferta_id", filtros.oferta);
  if (filtros.lanzamiento) consulta = consulta.eq("lanzamiento_id", filtros.lanzamiento);
  const tematica = sanearBusqueda(filtros.tematica);
  const audiencia = sanearBusqueda(filtros.audiencia);
  if (tematica) consulta = consulta.ilike("email_tematica", `%${tematica}%`);
  if (audiencia) consulta = consulta.ilike("email_audiencia", `%${audiencia}%`);

  const [correosQ, pilaresR, ofertasR, lanzamientosR, asuntosR, relativasR, pasosR] = await Promise.all([
    consulta,
    supabase.from("pilares").select("id,nombre,color,archivado").order("orden"),
    supabase.from("ofertas").select("id,nombre,archivada").order("nombre"),
    supabase.from("lanzamientos").select("id,nombre").order("fecha_inicio", { ascending: false, nullsFirst: false }),
    supabase.from("pieza_versiones").select("pieza_id,asunto").eq("tipo", "asunto").eq("elegida", true),
    supabase.from("secuencias_email").select("id").eq("programacion", "relativa"),
    supabase.from("secuencia_pasos").select("pieza_id,secuencia_id"),
  ]);

  const relativas = new Set((relativasR.data ?? []).map((s) => s.id as string));
  const pasosRelativos = new Set(
    (pasosR.data ?? []).filter((p) => relativas.has(p.secuencia_id as string)).map((p) => p.pieza_id as string),
  );
  const correos = ((correosQ.data ?? []) as CorreoResumen[]).filter((c) => !pasosRelativos.has(c.id));
  const pilares = (pilaresR.data ?? []) as Pilar[];
  const ofertas = (ofertasR.data ?? []) as Oferta[];
  const lanzamientos = (lanzamientosR.data ?? []) as { id: string; nombre: string }[];
  const pilarPorId = new Map(pilares.map((p) => [p.id, p]));
  const ofertaPorId = new Map(ofertas.map((o) => [o.id, o]));
  const lanzamientoPorId = new Map(lanzamientos.map((l) => [l.id, l]));
  const asuntoPorPieza = new Map((asuntosR.data ?? []).map((a) => [a.pieza_id as string, a.asunto as string]));

  return (
    <section className="flex flex-col gap-5">
      <nav aria-label="Vistas de broadcasts" className="flex flex-wrap gap-2">
        {PESTANAS_BROADCAST.map((p) => (
          <Link
            key={p}
            href={`/email?vista=broadcasts&pestana=${p}`}
            aria-current={pestana === p ? "page" : undefined}
            className={`min-h-11 rounded-full px-4 py-2.5 text-sm ${pestana === p ? "bg-verde-100 font-medium text-verde-700" : "border border-borde text-tinta"}`}
          >
            {ETIQUETA_PESTANA[p]}
          </Link>
        ))}
      </nav>

      {pestana === "semana" && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-tarjeta bg-fondo-suave px-4 py-2 text-sm">
          <Link href={`/email?vista=broadcasts&pestana=semana&semana=${sumarDias(lunes, -7)}`} className="text-verde-700">← Semana anterior</Link>
          <p className="font-medium">{formatearFechaCorta(lunes)} – {formatearFechaCorta(domingo)}</p>
          <Link href={`/email?vista=broadcasts&pestana=semana&semana=${sumarDias(lunes, 7)}`} className="text-verde-700">Semana siguiente →</Link>
        </div>
      )}

      <form method="get" className="grid gap-3 rounded-tarjeta border border-borde bg-fondo-suave p-4 sm:grid-cols-2 lg:grid-cols-5">
        <input type="hidden" name="vista" value="broadcasts" />
        <input type="hidden" name="pestana" value={pestana} />
        {pestana === "semana" && <input type="hidden" name="semana" value={lunes} />}
        <label className="text-sm font-medium">Temática<input name="tematica" defaultValue={filtros.tematica} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2" /></label>
        <label className="text-sm font-medium">Audiencia<input name="audiencia" defaultValue={filtros.audiencia} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2" /></label>
        <label className="text-sm font-medium">Pilar<select name="pilar" defaultValue={filtros.pilar} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2"><option value="">Todos</option>{pilares.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select></label>
        <label className="text-sm font-medium">Finalidad<select name="finalidad" defaultValue={filtros.finalidad} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2"><option value="">Todas</option>{FINALIDADES.map((f) => <option key={f} value={f}>{ETIQUETA_FINALIDAD[f]}</option>)}</select></label>
        <label className="text-sm font-medium">Oferta<select name="oferta" defaultValue={filtros.oferta} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2"><option value="">Todas</option>{ofertas.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}</select></label>
        <label className="text-sm font-medium">Lanzamiento<select name="lanzamiento" defaultValue={filtros.lanzamiento} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2"><option value="">Todos</option>{lanzamientos.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}</select></label>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
          <button className="rounded-boton bg-verde-700 px-4 py-2 text-sm font-medium text-white">Aplicar filtros</button>
          <Link href={`/email?vista=broadcasts&pestana=${pestana}`} className="py-2 text-sm text-verde-700">Limpiar</Link>
        </div>
      </form>

      {correos.length === 0 ? (
        <p className="rounded-tarjeta bg-verde-50 p-6 text-center text-tinta-suave">
          {pestana === "enviados" ? "Todavía no has marcado ningún correo como enviado." : "No hay correos que cumplan estos filtros."}
        </p>
      ) : pestana === "semana" ? (
        <Semana correos={correos} pilarPorId={pilarPorId} ofertaPorId={ofertaPorId} lanzamientoPorId={lanzamientoPorId} asuntoPorPieza={asuntoPorPieza} />
      ) : (
        <ul className="flex flex-col gap-3">
          {correos.map((c) => <FilaCorreo key={c.id} correo={c} pilar={c.pilar_id ? pilarPorId.get(c.pilar_id) : undefined} oferta={c.oferta_id ? ofertaPorId.get(c.oferta_id) : undefined} lanzamiento={c.lanzamiento_id ? lanzamientoPorId.get(c.lanzamiento_id) : undefined} asunto={asuntoPorPieza.get(c.id) ?? null} />)}
        </ul>
      )}
    </section>
  );
}

function Semana({ correos, pilarPorId, ofertaPorId, lanzamientoPorId, asuntoPorPieza }: {
  correos: CorreoResumen[];
  pilarPorId: Map<string, Pilar>;
  ofertaPorId: Map<string, Oferta>;
  lanzamientoPorId: Map<string, { id: string; nombre: string }>;
  asuntoPorPieza: Map<string, string>;
}) {
  const grupos = new Map<string, CorreoResumen[]>();
  for (const c of correos) {
    const dia = c.fecha_prevista ?? "Sin fecha";
    grupos.set(dia, [...(grupos.get(dia) ?? []), c]);
  }
  return (
    <div className="flex flex-col gap-5">
      {[...grupos.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([dia, lista]) => (
        <section key={dia}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-tinta-suave">{esFecha(dia) ? formatearFecha(dia) : dia}</h2>
          <ul className="mt-2 flex flex-col gap-3">
            {lista.map((c) => <FilaCorreo key={c.id} correo={c} pilar={c.pilar_id ? pilarPorId.get(c.pilar_id) : undefined} oferta={c.oferta_id ? ofertaPorId.get(c.oferta_id) : undefined} lanzamiento={c.lanzamiento_id ? lanzamientoPorId.get(c.lanzamiento_id) : undefined} asunto={asuntoPorPieza.get(c.id) ?? null} />)}
          </ul>
        </section>
      ))}
    </div>
  );
}

function FilaCorreo({ correo, pilar, oferta, lanzamiento, asunto }: {
  correo: CorreoResumen;
  pilar?: Pilar;
  oferta?: Oferta;
  lanzamiento?: { id: string; nombre: string };
  asunto: string | null;
}) {
  return (
    <li>
      <Link href={`/piezas/${correo.id}`} className="block rounded-tarjeta border border-borde p-4 hover:bg-verde-50">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="min-w-0 flex-1 truncate font-medium">{asunto || "Sin asunto"}</p>
          <Etiqueta tono={correo.estado === "publicado" ? "verde" : "neutro"}>{etiquetaEstado(correo.estado)}</Etiqueta>
        </div>
        <p className="mt-1 line-clamp-1 text-sm text-tinta-suave">{correo.email_preview || "Sin texto de vista previa"}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {correo.finalidad && <Etiqueta>{ETIQUETA_FINALIDAD[correo.finalidad as Finalidad]}</Etiqueta>}
          {pilar && <EtiquetaPilar nombre={pilar.nombre} color={pilar.color} />}
          {oferta && <Etiqueta>{oferta.nombre}</Etiqueta>}
          {lanzamiento && <Etiqueta tono="menta">{lanzamiento.nombre}</Etiqueta>}
          {correo.email_tematica && <Etiqueta tono="gris">{correo.email_tematica}</Etiqueta>}
          {correo.email_audiencia && <Etiqueta tono="gris">{correo.email_audiencia}</Etiqueta>}
          {correo.fecha_real && <span className="text-xs text-tinta-suave">Enviado el {correo.fecha_real}</span>}
        </div>
      </Link>
    </li>
  );
}
