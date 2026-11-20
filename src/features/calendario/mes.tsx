import Link from "next/link";
import { TONO_FASE, type BandaFase, type EntradaPieza, type HitoCalendario, type PilarCalendario } from "./esquemas";
import { TarjetaPieza } from "./tarjeta";

type Props = {
  dias: string[];
  piezasPorDia: Map<string, EntradaPieza[]>;
  hitosPorDia: Map<string, HitoCalendario[]>;
  bandas: BandaFase[];
  senaladasPorDia: Map<string, { id: string; titulo: string }[]>;
  nombreLanzamiento: Map<string, string>;
  pilares: Map<string, PilarCalendario>;
  enlaceProgramar: (dia: string) => string;
  hoy: string;
  mes: string;
};

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/** Vista de mes: rejilla clásica; cada día muestra hasta tres piezas y el resto se abre. */
export function Mes({ dias, piezasPorDia, hitosPorDia, bandas, senaladasPorDia, nombreLanzamiento, pilares, enlaceProgramar, hoy, mes }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-tinta-suave">
        {DIAS_SEMANA.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dias.map((dia) => {
          const piezas = piezasPorDia.get(dia) ?? [];
          const hitos = hitosPorDia.get(dia) ?? [];
          const delMes = dia.startsWith(mes);
          const fasesDelDia = bandas.filter((b) => b.fecha_inicio && b.fecha_fin && b.fecha_inicio <= dia && b.fecha_fin >= dia);
          const senaladas = senaladasPorDia.get(dia) ?? [];
          const visibles = piezas.slice(0, 3);
          const resto = piezas.length - visibles.length;
          return (
            <div key={dia} className={`flex min-h-[92px] flex-col gap-1 rounded-boton border border-borde p-1 ${delMes ? "bg-fondo" : "bg-fondo-suave opacity-60"} ${dia === hoy ? "border-verde-300" : ""}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs ${dia === hoy ? "font-semibold text-verde-700" : "text-tinta-suave"}`}>
                  {Number(dia.slice(8, 10))}
                </span>
                {fasesDelDia.length > 0 && (
                  <span className="flex gap-0.5">
                    {fasesDelDia.map((fase) => (
                      <span key={fase.id} title={fase.nombre} className={`h-1.5 w-3 rounded-full ${TONO_FASE[fase.tipo] ?? "bg-borde"}`} />
                    ))}
                  </span>
                )}
              </div>
              {senaladas.map((s) => (
                <span key={s.id} title={s.titulo} className="truncate rounded border border-dashed border-tinta-suave px-1 text-[10px]">
                  {s.titulo}
                </span>
              ))}
              {hitos.map((hito) => (
                <span key={hito.id} title={hito.titulo} className="truncate rounded bg-aviso-fondo px-1 text-[10px] text-aviso">
                  {hito.titulo}
                </span>
              ))}
              {visibles.map((pieza) => (
                <TarjetaPieza
                  key={pieza.id}
                  pieza={pieza}
                  dias={dias}
                  pilar={pieza.pilar_id ? pilares.get(pieza.pilar_id) : undefined}
                  lanzamiento={pieza.lanzamiento_id ? nombreLanzamiento.get(pieza.lanzamiento_id) : undefined}
                  compacta
                />
              ))}
              {resto > 0 && (
                <Link href={`/calendario?vista=semana&fecha=${dia}`} className="text-[11px] text-verde-700">
                  +{resto} más
                </Link>
              )}
              {delMes && (
                <Link href={enlaceProgramar(dia)} aria-label={`Programar el ${Number(dia.slice(8, 10))}`} className="mt-auto text-[11px] text-verde-700">
                  + Programar
                </Link>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-tinta-suave">
        Los hitos se distinguen por su color. Cada día abre su semana con más detalle.
      </p>
    </div>
  );
}
