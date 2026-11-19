import Link from "next/link";
import type { Pilar } from "@/features/ajustes/esquemas";
import { ETIQUETA_FINALIDAD, ETIQUETA_FORMATO, type FormatoPieza } from "@/features/piezas/esquemas";
import { EtiquetaPilar } from "@/shared/components/etiquetas";
import { hoyMadrid, sumarDias } from "@/shared/lib/fechas";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import {
  columnaDe,
  ESTADOS_MAPA,
  fechaDeMapa,
  PERIODOS_MAPA,
  tonoCelda,
  type ClaveEstado,
  type ClavePeriodo,
  type ColumnaMapa,
} from "./esquemas";

type Parametros = Record<string, string | string[] | undefined>;

type PiezaMapa = {
  id: string;
  titulo: string;
  formato: string;
  estado: string;
  finalidad: string | null;
  pilar_id: string | null;
  lanzamiento_id: string | null;
  fecha_prevista: string | null;
  fecha_real: string | null;
};

const CAMPOS = "id,titulo,formato,estado,finalidad,pilar_id,lanzamiento_id,fecha_prevista,fecha_real";

function valor(sp: Parametros, clave: string): string {
  return typeof sp[clave] === "string" ? sp[clave] : "";
}

/** El periodo escolhido: 30 días, 90 días, este año o un rango propio. */
function periodo(sp: Parametros, hoy: string): { desde: string; hasta: string; etiqueta: string; clave: ClavePeriodo } {
  const clave = (PERIODOS_MAPA as readonly string[]).includes(valor(sp, "periodo"))
    ? (valor(sp, "periodo") as ClavePeriodo)
    : "30";
  const desde = valor(sp, "desde");
  const hasta = valor(sp, "hasta");
  if (clave === "rango" && /^\d{4}-\d{2}-\d{2}$/.test(desde) && /^\d{4}-\d{2}-\d{2}$/.test(hasta)) {
    return { desde, hasta, etiqueta: `Del ${desde} al ${hasta}`, clave };
  }
  if (clave === "anio") {
    return { desde: `${hoy.slice(0, 4)}-01-01`, hasta: hoy, etiqueta: "Este año", clave };
  }
  if (clave === "90") {
    return { desde: sumarDias(hoy, -89), hasta: hoy, etiqueta: "Últimos 90 días", clave };
  }
  return { desde: sumarDias(hoy, -29), hasta: hoy, etiqueta: "Últimos 30 días", clave };
}

export async function Mapa({ sp }: { sp: Parametros }) {
  const hoy = hoyMadrid();
  const rango = periodo(sp, hoy);
  const estado = (ESTADOS_MAPA as readonly string[]).includes(valor(sp, "estado"))
    ? (valor(sp, "estado") as ClaveEstado)
    : "todas";
  const lanzamiento = valor(sp, "lanzamiento");
  const pilarElegido = valor(sp, "pilar");
  const finalidadElegida = valor(sp, "finalidad");

  const supabase = await crearClienteServidor();
  const [{ data: piezasR }, { data: pilaresR }, { data: lanzamientosR }] = await Promise.all([
    supabase.from("piezas").select(CAMPOS).is("eliminado_en", null),
    supabase.from("pilares").select("id,nombre,color,orden,archivado").order("orden"),
    supabase.from("lanzamientos").select("id,nombre").order("nombre"),
  ]);

  const piezas = (piezasR ?? []) as PiezaMapa[];
  const pilares = (pilaresR ?? []) as Pilar[];
  const lanzamientos = (lanzamientosR ?? []) as { id: string; nombre: string }[];

  const dentroDelPeriodo = piezas.filter((p) => {
    const fecha = fechaDeMapa(p);
    if (!fecha || fecha < rango.desde || fecha > rango.hasta) return false;
    if (estado === "publicadas" && p.estado !== "publicado") return false;
    if (estado === "planificadas" && p.estado === "publicado") return false;
    if (lanzamiento && p.lanzamiento_id !== lanzamiento) return false;
    return true;
  });

  const filas: { id: string | null; nombre: string; color: string | null }[] = [
    ...pilares.map((p) => ({ id: p.id, nombre: p.nombre, color: p.color })),
    { id: null, nombre: "Sin pilar", color: null },
  ];
  const columnas: { id: ColumnaMapa; nombre: string }[] = [
    ...(["attract", "nurture", "position", "convert"] as const).map((f) => ({
      id: f as ColumnaMapa,
      nombre: ETIQUETA_FINALIDAD[f].split(" · ")[0],
    })),
    { id: "sin", nombre: "Sin finalidad" },
  ];

  const cuenta = (pilarId: string | null, columna: ColumnaMapa) =>
    dentroDelPeriodo.filter((p) => (p.pilar_id ?? null) === pilarId && columnaDe(p.finalidad) === columna).length;

  const matriz = filas.map((fila) => ({
    fila,
    celdas: columnas.map((columna) => ({ columna: columna.id, cantidad: cuenta(fila.id, columna.id) })),
  }));
  const maximo = Math.max(1, ...matriz.flatMap((m) => m.celdas.map((c) => c.cantidad)));
  const totalColumna = (columna: ColumnaMapa) => dentroDelPeriodo.filter((p) => columnaDe(p.finalidad) === columna).length;

  // "" = sin celda elegida; "sin" = la fila o columna «Sin pilar» / «Sin finalidad».
  const celdaPilar = pilarElegido === "" ? null : pilarElegido;
  const celdaFinalidad = finalidadElegida === "" ? null : finalidadElegida;
  const enLaCelda =
    celdaPilar !== null || celdaFinalidad !== null
      ? dentroDelPeriodo.filter((p) => {
          const coincidePilar =
            celdaPilar === null
              ? true
              : celdaPilar === "sin"
                ? (p.pilar_id ?? null) === null
                : p.pilar_id === celdaPilar;
          const columna = columnaDe(p.finalidad);
          const coincideFinalidad =
            celdaFinalidad === null ? true : celdaFinalidad === "sin" ? columna === "sin" : columna === celdaFinalidad;
          return coincidePilar && coincideFinalidad;
        })
      : [];

  const enlace = (pilarId: string | null, columna: ColumnaMapa) => {
    const p = new URLSearchParams();
    p.set("periodo", rango.clave);
    if (rango.clave === "rango") {
      p.set("desde", rango.desde);
      p.set("hasta", rango.hasta);
    }
    p.set("estado", estado);
    if (lanzamiento) p.set("lanzamiento", lanzamiento);
    p.set("pilar", pilarId ?? "sin");
    p.set("finalidad", columna);
    return `/mapa?${p.toString()}`;
  };

  return (
    <div className="flex flex-col gap-5">
      <form method="get" className="grid gap-3 rounded-tarjeta border border-borde bg-fondo-suave p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-medium">
          Periodo
          <select name="periodo" defaultValue={rango.clave} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2">
            <option value="30">Últimos 30 días</option>
            <option value="90">Últimos 90 días</option>
            <option value="anio">Este año</option>
            <option value="rango">Rango propio</option>
          </select>
        </label>
        <label className="text-sm font-medium">
          Estado
          <select name="estado" defaultValue={estado} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2">
            <option value="todas">Todas</option>
            <option value="publicadas">Publicadas</option>
            <option value="planificadas">Programadas</option>
          </select>
        </label>
        <label className="text-sm font-medium">
          Lanzamiento
          <select name="lanzamiento" defaultValue={lanzamiento} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2">
            <option value="">Todos</option>
            {lanzamientos.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nombre}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-3">
          <button className="rounded-boton bg-verde-700 px-4 py-2 text-sm font-medium text-white">Aplicar</button>
          <Link href="/mapa" className="py-2 text-sm text-verde-700">
            Limpiar
          </Link>
        </div>
        {rango.clave === "rango" && (
          <>
            <label className="text-sm font-medium">
              Desde<input name="desde" type="date" defaultValue={rango.desde} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2" />
            </label>
            <label className="text-sm font-medium">
              Hasta<input name="hasta" type="date" defaultValue={rango.hasta} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2" />
            </label>
          </>
        )}
      </form>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-x-auto rounded-tarjeta border border-borde">
          <table className="w-full min-w-[560px] text-sm">
            <caption className="sr-only">Piezas por pilar y por finalidad</caption>
            <thead className="bg-fondo-suave text-left">
              <tr>
                <th scope="col" className="sticky left-0 bg-fondo-suave px-3 py-2 font-medium">Pilar</th>
                {columnas.map((c) => (
                  <th key={c.id} scope="col" className="px-3 py-2 text-center font-medium">
                    {c.nombre}
                  </th>
                ))}
                <th scope="col" className="px-3 py-2 text-center font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {matriz.map(({ fila, celdas }) => (
                <tr key={fila.id ?? "sin"} className="border-t border-borde">
                  <th scope="row" className="sticky left-0 bg-fondo px-3 py-2 text-left font-medium">
                    {fila.color ? <EtiquetaPilar nombre={fila.nombre} color={fila.color as Pilar["color"]} /> : fila.nombre}
                  </th>
                  {celdas.map((celda) => (
                    <td key={celda.columna} className="px-2 py-1 text-center">
                      <Link
                        href={enlace(fila.id, celda.columna)}
                        style={{ backgroundColor: tonoCelda(celda.cantidad, maximo) }}
                        className="block rounded-boton px-2 py-1 hover:underline"
                      >
                        {celda.cantidad}
                      </Link>
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center">{celdas.reduce((suma, c) => suma + c.cantidad, 0)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-borde bg-fondo-suave">
                <th scope="row" className="sticky left-0 bg-fondo-suave px-3 py-2 text-left font-medium">
                  Total
                </th>
                {columnas.map((c) => (
                  <td key={c.id} className="px-3 py-2 text-center">
                    {totalColumna(c.id)}
                  </td>
                ))}
                <td className="px-3 py-2 text-center">{dentroDelPeriodo.length}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <aside className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">
            {celdaPilar !== null || celdaFinalidad !== null ? "Piezas de la celda" : "Elige una celda"}
          </h2>
          {celdaPilar === null && celdaFinalidad === null ? (
            <p className="text-sm text-tinta-suave">
              Pulsa una celda para ver sus piezas. No hay objetivos ni alertas: el mapa informa.
            </p>
          ) : enLaCelda.length === 0 ? (
            <p className="text-sm text-tinta-suave">No hay piezas en ese cruce.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {enLaCelda.map((p) => (
                <li key={p.id} className="rounded-boton border border-borde p-2">
                  <Link href={`/piezas/${p.id}`} className="font-medium hover:text-verde-700">
                    {p.titulo}
                  </Link>
                  <p className="mt-1 text-xs text-tinta-suave">
                    {ETIQUETA_FORMATO[p.formato as FormatoPieza] ?? p.formato} · {p.estado}
                    {p.lanzamiento_id ? ` · ${lanzamientos.find((l) => l.id === p.lanzamiento_id)?.nombre ?? ""}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-tinta-suave">
            Periodo: {rango.etiqueta}. Solo cuentan las piezas con fecha (la real si se publicaron, la prevista si no).
          </p>
        </aside>
      </div>
    </div>
  );
}
