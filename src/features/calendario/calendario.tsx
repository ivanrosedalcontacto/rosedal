import Link from "next/link";
import type { Pilar } from "@/features/ajustes/esquemas";
import type { Oferta } from "@/features/ofertas/esquemas";
import { hoyMadrid, sumarDias } from "@/shared/lib/fechas";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { BandejaSinFecha } from "./bandeja";
import { FiltrosCalendarioUI } from "./filtros";
import { Mes } from "./mes";
import { Semana } from "./semana";
import {
  diasDeMes,
  diasDeSemana,
  diasDelMes,
  leerFechaAncla,
  leerFiltrosCalendario,
  tituloMes,
  tituloSemana,
  valor,
  type Parametros,
} from "./consultas";
import { fechaDeEntrada, type EntradaPieza, type FiltrosCalendario } from "./esquemas";

const CAMPOS_PIEZA =
  "id,titulo,formato,canal,estado,finalidad,pilar_id,oferta_id,lanzamiento_id,fecha_prevista,fecha_real,url_publicada,texto_publicacion,texto_en_pantalla,notas";

/** Una pieza del calendario con sus textos, para poder buscarla en la bandeja. */
type PiezaConTexto = EntradaPieza & { texto_publicacion: string; texto_en_pantalla: string; notas: string };

function cumpleFiltros(pieza: EntradaPieza, f: FiltrosCalendario): boolean {
  if (f.formato && pieza.formato !== f.formato) return false;
  if (f.canal && pieza.canal !== f.canal) return false;
  if (f.finalidad && pieza.finalidad !== f.finalidad) return false;
  if (f.estado && pieza.estado !== f.estado) return false;
  if (f.pilar && pieza.pilar_id !== f.pilar) return false;
  if (f.oferta && pieza.oferta_id !== f.oferta) return false;
  if (f.lanzamiento && pieza.lanzamiento_id !== f.lanzamiento) return false;
  return true;
}

function enlazar(vista: string, fecha: string, f: FiltrosCalendario): string {
  const p = new URLSearchParams();
  p.set("vista", vista);
  p.set("fecha", fecha);
  (Object.keys(f) as (keyof FiltrosCalendario)[]).forEach((clave) => {
    const v = f[clave];
    if (v) p.set(clave, v);
  });
  return `/calendario?${p.toString()}`;
}

export async function Calendario({ sp }: { sp: Parametros }) {
  const hoy = hoyMadrid();
  const filtros = leerFiltrosCalendario(sp);
  const ancla = leerFechaAncla(sp, hoy);
  const vista = valor(sp, "vista") === "mes" ? "mes" : "semana";
  const supabase = await crearClienteServidor();

  const [
    { data: piezasR },
    { data: tarjetasR },
    { data: relativasR },
    { data: pasosR },
    { data: hitosR },
    { data: fasesR },
    { data: senaladasR },
    { data: lanzamientosR },
    { data: pilaresR },
    { data: ofertasR },
  ] = await Promise.all([
    supabase.from("piezas").select(CAMPOS_PIEZA).is("eliminado_en", null),
    supabase.from("story_tarjetas").select("pieza_id"),
    supabase.from("secuencias_email").select("id").eq("programacion", "relativa"),
    supabase.from("secuencia_pasos").select("pieza_id,secuencia_id"),
    supabase.from("lanzamiento_hitos").select("id,titulo,fecha,hecho,lanzamiento_id,fase_id"),
    supabase.from("lanzamiento_fases").select("id,nombre,tipo,fecha_inicio,fecha_fin,lanzamiento_id"),
    supabase.from("fechas_senaladas").select("id,titulo,fecha_inicio,fecha_fin"),
    supabase.from("lanzamientos").select("id,nombre"),
    supabase.from("pilares").select("id,nombre,color,archivado").order("orden"),
    supabase.from("ofertas").select("id,nombre,archivada").order("nombre"),
  ]);

  const tarjetasPorPieza = new Map<string, number>();
  for (const t of tarjetasR ?? []) {
    const id = t.pieza_id as string;
    tarjetasPorPieza.set(id, (tarjetasPorPieza.get(id) ?? 0) + 1);
  }
  const relativas = new Set((relativasR ?? []).map((s) => s.id as string));
  const pasosRelativos = new Set(
    (pasosR ?? []).filter((p) => relativas.has(p.secuencia_id as string)).map((p) => p.pieza_id as string),
  );

  const dias = vista === "mes" ? diasDeMes(ancla) : diasDeSemana(ancla);
  const diasDelMesVista = vista === "mes" ? diasDelMes(ancla) : dias;
  const inicio = dias[0] ?? ancla;
  const fin = dias.at(-1) ?? ancla;

  const piezas: PiezaConTexto[] = (
    (piezasR ?? []) as (EntradaPieza & { texto_publicacion: string; texto_en_pantalla: string; notas: string })[]
  ).map((p) => ({ ...p, tarjetas: tarjetasPorPieza.get(p.id) ?? 0 }));

  const piezasPorDia = new Map<string, EntradaPieza[]>();
  const sinFecha: PiezaConTexto[] = [];
  for (const pieza of piezas) {
    if (!cumpleFiltros(pieza, filtros)) continue;
    const fecha = fechaDeEntrada(pieza);
    if (fecha && fecha >= inicio && fecha <= fin) {
      piezasPorDia.set(fecha, [...(piezasPorDia.get(fecha) ?? []), pieza]);
    } else if (!pieza.fecha_prevista && pieza.estado !== "publicado" && !pasosRelativos.has(pieza.id)) {
      sinFecha.push(pieza);
    }
  }

  const coincideBusqueda = (pieza: PiezaConTexto) => {
    if (!filtros.q) return true;
    const q = filtros.q.toLowerCase();
    return [pieza.titulo, pieza.texto_publicacion, pieza.texto_en_pantalla, pieza.notas].some((t) =>
      (t ?? "").toLowerCase().includes(q),
    );
  };
  const bandeja = sinFecha.filter(coincideBusqueda);

  const hitosPorDia = new Map<string, { id: string; titulo: string; fecha: string; hecho: boolean; lanzamiento_id: string; fase_id: string | null }[]>();
  for (const hito of hitosR ?? []) {
    const fecha = hito.fecha as string;
    if (fecha < inicio || fecha > fin) continue;
    hitosPorDia.set(fecha, [
      ...(hitosPorDia.get(fecha) ?? []),
      {
        id: hito.id as string,
        titulo: hito.titulo as string,
        fecha,
        hecho: Boolean(hito.hecho),
        lanzamiento_id: hito.lanzamiento_id as string,
        fase_id: (hito.fase_id as string | null) ?? null,
      },
    ]);
  }

  const bandas = (fasesR ?? []).filter((f) => {
    const fi = f.fecha_inicio as string | null;
    const ff = f.fecha_fin as string | null;
    if (!fi || !ff) return false;
    return fi <= fin && ff >= inicio;
  });
  const nombreLanzamiento = new Map(((lanzamientosR ?? []) as { id: string; nombre: string }[]).map((l) => [l.id, l.nombre]));
  const senaladasPorDia = new Map<string, { id: string; titulo: string }[]>();
  for (const senalada of senaladasR ?? []) {
    const desde = senalada.fecha_inicio as string;
    const hasta = (senalada.fecha_fin as string | null) ?? desde;
    if (hasta < inicio || desde > fin) continue;
    for (const dia of dias) {
      if (dia < desde || dia > hasta) continue;
      senaladasPorDia.set(dia, [...(senaladasPorDia.get(dia) ?? []), { id: senalada.id as string, titulo: senalada.titulo as string }]);
    }
  }
  const pilares = (pilaresR ?? []) as Pilar[];
  const ofertas = (ofertasR ?? []) as Oferta[];

  const anterior = vista === "mes" ? sumarMes(ancla, -1) : sumarDias(inicio, -7);
  const siguiente = vista === "mes" ? sumarMes(ancla, 1) : sumarDias(inicio, 7);
  const titulo = vista === "mes" ? tituloMes(ancla) : tituloSemana(inicio, fin);

  return (
    <div className="flex flex-col gap-5">
      <nav aria-label="Vistas del calendario" className="flex flex-wrap gap-2">
        <Link href={enlazar("semana", inicio, filtros)} className={`min-h-11 rounded-full px-4 py-2 text-sm ${vista === "semana" ? "bg-verde-100 font-medium text-verde-700" : "border border-borde"}`}>
          Semana
        </Link>
        <Link href={enlazar("mes", ancla, filtros)} className={`min-h-11 rounded-full px-4 py-2 text-sm ${vista === "mes" ? "bg-verde-100 font-medium text-verde-700" : "border border-borde"}`}>
          Mes
        </Link>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-tarjeta bg-fondo-suave px-4 py-2">
        <Link href={enlazar(vista, anterior, filtros)} className="text-verde-700">
          ← {vista === "mes" ? "Mes anterior" : "Semana anterior"}
        </Link>
        <p className="font-medium">{titulo}</p>
        <div className="flex items-center gap-3">
          <Link href={enlazar(vista, siguiente, filtros)} className="text-verde-700">
            {vista === "mes" ? "Mes siguiente" : "Semana siguiente"} →
          </Link>
          <Link href={enlazar(vista, hoy, filtros)} className="text-sm text-verde-700">
            Hoy
          </Link>
        </div>
      </div>

      <FiltrosCalendarioUI
        filtros={filtros}
        vista={vista}
        fecha={ancla}
        pilares={pilares.map((p) => ({ id: p.id, nombre: p.archivado ? `${p.nombre} (archivado)` : p.nombre }))}
        ofertas={ofertas.map((o) => ({ id: o.id, nombre: o.archivada ? `${o.nombre} (archivada)` : o.nombre }))}
        lanzamientos={[...nombreLanzamiento].map(([id, nombre]) => ({ id, nombre }))}
      />

      {vista === "mes" ? (
        <Mes
          dias={dias}
          piezasPorDia={piezasPorDia}
          hitosPorDia={hitosPorDia}
          bandas={bandas}
          senaladasPorDia={senaladasPorDia}
          nombreLanzamiento={nombreLanzamiento}
          hoy={hoy}
          mes={ancla.slice(0, 7)}
        />
      ) : (
        <Semana
          dias={dias}
          piezasPorDia={piezasPorDia}
          hitosPorDia={hitosPorDia}
          bandas={bandas}
          senaladasPorDia={senaladasPorDia}
          nombreLanzamiento={nombreLanzamiento}
          hoy={hoy}
        />
      )}

      <BandejaSinFecha
        piezas={bandeja}
        filtros={filtros}
        vista={vista}
        fecha={ancla}
        dias={diasDelMesVista}
        nombreLanzamiento={nombreLanzamiento}
      />
    </div>
  );
}

/** Suma un mes a la fecha, dejando el día 1 en el mes destino. */
function sumarMes(fecha: string, meses: number): string {
  const [a, m] = fecha.split("-").map(Number);
  const total = (a ?? 2026) * 12 + ((m ?? 1) - 1) + meses;
  const anio = Math.floor(total / 12);
  const mes = (total % 12) + 1;
  return `${anio}-${String(mes).padStart(2, "0")}-01`;
}
