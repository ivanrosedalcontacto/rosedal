import Link from "next/link";
import { formatearFechaCorta } from "@/shared/lib/fechas";
import { TONO_FASE, type BandaFase, type EntradaPieza, type HitoCalendario } from "./esquemas";
import { TarjetaHito, TarjetaPieza } from "./tarjeta";

type Props = {
  dias: string[];
  piezasPorDia: Map<string, EntradaPieza[]>;
  hitosPorDia: Map<string, HitoCalendario[]>;
  bandas: BandaFase[];
  senaladasPorDia: Map<string, { id: string; titulo: string }[]>;
  nombreLanzamiento: Map<string, string>;
  hoy: string;
};

/** Vista de semana: siete columnas en ordenador y lista vertical en móvil. */
export function Semana({ dias, piezasPorDia, hitosPorDia, bandas, senaladasPorDia, nombreLanzamiento, hoy }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* Banda de color con las fases del lanzamiento activo. */}
      <div className="hidden gap-1 md:grid md:grid-cols-7">
        {dias.map((dia) => {
          const fasesDelDia = bandas.filter((b) => b.fecha_inicio && b.fecha_fin && b.fecha_inicio <= dia && b.fecha_fin >= dia);
          return (
            <div key={dia} className="flex h-2 gap-0.5">
              {fasesDelDia.map((fase) => (
                <span
                  key={fase.id}
                  title={`${fase.nombre} · ${nombreLanzamiento.get(fase.lanzamiento_id) ?? ""}`}
                  className={`h-2 w-full rounded-full ${TONO_FASE[fase.tipo] ?? "bg-borde"}`}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* Móvil: lista vertical agrupada por día. */}
      <div className="flex flex-col gap-4 md:hidden">
        {dias.map((dia) => {
          const piezas = piezasPorDia.get(dia) ?? [];
          const hitos = hitosPorDia.get(dia) ?? [];
          const senaladas = senaladasPorDia.get(dia) ?? [];
          return (
            <section key={dia}>
              <h2 className={`text-sm font-semibold ${dia === hoy ? "text-verde-700" : ""}`}>
                {formatearFechaCorta(dia)}
                {dia === hoy && " · hoy"}
              </h2>
              <div className="mt-2 flex flex-col gap-2">
                {senaladas.map((s) => (
                  <p key={s.id} className="rounded-boton border border-dashed border-tinta-suave bg-fondo-suave px-2 py-1 text-xs">
                    {s.titulo}
                  </p>
                ))}
                {hitos.map((hito) => <TarjetaHito key={hito.id} titulo={hito.titulo} hecho={hito.hecho} />)}
                {piezas.map((pieza) => (
                  <TarjetaPieza
                    key={pieza.id}
                    pieza={pieza}
                    dias={dias}
                    lanzamiento={pieza.lanzamiento_id ? nombreLanzamiento.get(pieza.lanzamiento_id) : undefined}
                  />
                ))}
                <Link href={`/piezas/nueva?fecha=${dia}`} className="text-sm text-verde-700">
                  + Nueva pieza para este día
                </Link>
              </div>
            </section>
          );
        })}
      </div>

      {/* Ordenador: siete columnas. */}
      <div className="hidden gap-2 md:grid md:grid-cols-7">
        {dias.map((dia) => {
          const piezas = piezasPorDia.get(dia) ?? [];
          const hitos = hitosPorDia.get(dia) ?? [];
          const senaladas = senaladasPorDia.get(dia) ?? [];
          return (
            <section key={dia} className={`flex min-h-[220px] flex-col gap-2 rounded-tarjeta p-2 ${dia === hoy ? "bg-verde-50" : "bg-fondo-suave"}`}>
              <h2 className={`text-sm font-semibold ${dia === hoy ? "text-verde-700" : ""}`}>
                {formatearFechaCorta(dia)}
                {dia === hoy && " · hoy"}
              </h2>
              {senaladas.map((s) => (
                <p key={s.id} className="rounded-boton border border-dashed border-tinta-suave bg-fondo px-2 py-1 text-[11px]">
                  {s.titulo}
                </p>
              ))}
              {hitos.map((hito) => <TarjetaHito key={hito.id} titulo={hito.titulo} hecho={hito.hecho} />)}
              {piezas.map((pieza) => (
                <TarjetaPieza
                  key={pieza.id}
                  pieza={pieza}
                  dias={dias}
                  lanzamiento={pieza.lanzamiento_id ? nombreLanzamiento.get(pieza.lanzamiento_id) : undefined}
                />
              ))}
              <Link href={`/piezas/nueva?fecha=${dia}`} className="mt-auto text-xs text-verde-700">
                + Nueva pieza
              </Link>
            </section>
          );
        })}
      </div>
    </div>
  );
}
