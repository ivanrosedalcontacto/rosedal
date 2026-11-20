import Link from "next/link";
import type { Pilar } from "@/features/ajustes/esquemas";
import { HEX_PILAR } from "@/shared/constants/colores-pilar";
import { esFecha, hoyMadrid, sumarDias } from "@/shared/lib/fechas";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { BandejaSinFecha } from "./bandeja";
import { Mes } from "./mes";
import { ProgramarDia } from "./programar-dia";
import { Semana } from "./semana";
import {
  diasDeMes,
  diasDeSemana,
  diasDelMes,
  leerFechaAncla,
  tituloMes,
  tituloSemana,
  valor,
  type Parametros,
} from "./consultas";
import { fechaDeEntrada, type EntradaPieza, type PilarCalendario } from "./esquemas";

const CAMPOS_PIEZA =
  "id,titulo,formato,canal,estado,finalidad,pilar_id,oferta_id,lanzamiento_id,fecha_prevista,fecha_real,url_publicada";

function enlazar(vista: string, fecha: string): string {
  return `/calendario?vista=${vista}&fecha=${fecha}`;
}

export async function Calendario({ sp }: { sp: Parametros }) {
  const hoy = hoyMadrid();
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

  const piezas: EntradaPieza[] = ((piezasR ?? []) as EntradaPieza[]).map((p) => ({ ...p, tarjetas: tarjetasPorPieza.get(p.id) ?? 0 }));

  const piezasPorDia = new Map<string, EntradaPieza[]>();
  // Listas para programar: Editadas, sin día y que no sean pasos de una secuencia relativa.
  const candidatas: EntradaPieza[] = [];
  for (const pieza of piezas) {
    const fecha = fechaDeEntrada(pieza);
    if (fecha && fecha >= inicio && fecha <= fin) {
      piezasPorDia.set(fecha, [...(piezasPorDia.get(fecha) ?? []), pieza]);
    } else if (!pieza.fecha_prevista && pieza.estado === "editado" && !pasosRelativos.has(pieza.id)) {
      candidatas.push(pieza);
    }
  }

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
  const listaPilares: PilarCalendario[] = ((pilaresR ?? []) as Pilar[]).map((p) => ({ id: p.id, nombre: p.nombre, color: HEX_PILAR[p.color], archivado: p.archivado }));
  const pilares = new Map(listaPilares.map((p) => [p.id, p]));
  const volver = enlazar(vista, ancla);
  const enlaceProgramar = (dia: string) => `${volver}&programar=${dia}`;
  const programar = valor(sp, "programar");

  const anterior = vista === "mes" ? sumarMes(ancla, -1) : sumarDias(inicio, -7);
  const siguiente = vista === "mes" ? sumarMes(ancla, 1) : sumarDias(inicio, 7);
  const titulo = vista === "mes" ? tituloMes(ancla) : tituloSemana(inicio, fin);

  return (
    <div className="flex flex-col gap-5">
      <nav aria-label="Vistas del calendario" className="flex flex-wrap gap-2">
        <Link href={enlazar("semana", inicio)} className={`min-h-11 rounded-full px-4 py-2 text-sm ${vista === "semana" ? "bg-verde-100 font-medium text-verde-700" : "border border-borde"}`}>
          Semana
        </Link>
        <Link href={enlazar("mes", ancla)} className={`min-h-11 rounded-full px-4 py-2 text-sm ${vista === "mes" ? "bg-verde-100 font-medium text-verde-700" : "border border-borde"}`}>
          Mes
        </Link>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-tarjeta bg-fondo-suave px-4 py-2">
        <Link href={enlazar(vista, anterior)} className="text-verde-700">
          ← {vista === "mes" ? "Mes anterior" : "Semana anterior"}
        </Link>
        <p className="font-medium">{titulo}</p>
        <div className="flex items-center gap-3">
          <Link href={enlazar(vista, siguiente)} className="text-verde-700">
            {vista === "mes" ? "Mes siguiente" : "Semana siguiente"} →
          </Link>
          <Link href={enlazar(vista, hoy)} className="text-sm text-verde-700">
            Hoy
          </Link>
        </div>
      </div>

      {vista === "mes" ? (
        <Mes
          dias={dias}
          piezasPorDia={piezasPorDia}
          hitosPorDia={hitosPorDia}
          bandas={bandas}
          senaladasPorDia={senaladasPorDia}
          nombreLanzamiento={nombreLanzamiento}
          pilares={pilares}
          enlaceProgramar={enlaceProgramar}
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
          pilares={pilares}
          enlaceProgramar={enlaceProgramar}
          hoy={hoy}
        />
      )}

      <BandejaSinFecha piezas={candidatas} dias={diasDelMesVista} pilares={pilares} />

      {esFecha(programar) && (
        <ProgramarDia dia={programar} pilarElegido={valor(sp, "pilar")} candidatas={candidatas} pilares={listaPilares} volver={volver} />
      )}
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
