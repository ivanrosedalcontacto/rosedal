import Link from "next/link";
import type { Oferta } from "@/features/ofertas/esquemas";
import { Etiqueta } from "@/shared/components/etiquetas";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { formatearFechaCorta } from "@/shared/lib/fechas";
import { FormularioAplicarPlantilla } from "./formulario-plantilla";
import { FormularioNuevoLanzamiento } from "./formularios";
import { ETIQUETA_ESTADO_LANZAMIENTO, type Lanzamiento, type PlantillaLanzamiento } from "./esquemas";
import { sembrarPlantillasPartida } from "./plantillas-partida";

const TONO_ESTADO = {
  en_preparacion: "aviso",
  en_curso: "verde",
  terminado: "gris",
} as const;

export async function ListaLanzamientos() {
  const supabase = await crearClienteServidor();
  await sembrarPlantillasPartida(supabase);
  const [{ data: lanzamientosR }, { data: ofertasR }, { data: piezasR }, { data: plantillasR }] = await Promise.all([
    supabase.from("lanzamientos").select("*").order("fecha_inicio", { ascending: false, nullsFirst: false }),
    supabase.from("ofertas").select("id,nombre,archivada").order("nombre"),
    supabase.from("piezas").select("lanzamiento_id,estado").is("eliminado_en", null).not("lanzamiento_id", "is", null),
    supabase.from("plantillas").select("id,nombre,descripcion,clave,contenido").eq("tipo", "lanzamiento").order("created_at"),
  ]);
  const lanzamientos = (lanzamientosR ?? []) as Lanzamiento[];
  const ofertas = (ofertasR ?? []) as Oferta[];
  const piezas = (piezasR ?? []) as { lanzamiento_id: string; estado: string }[];
  const plantillas = (plantillasR ?? []) as unknown as PlantillaLanzamiento[];
  const ofertaPorId = new Map(ofertas.map((o) => [o.id, o]));
  const opcionesOfertas = ofertas.map((o) => ({ id: o.id, nombre: o.archivada ? `${o.nombre} (archivada)` : o.nombre }));

  const datos = lanzamientos.map((lanzamiento) => {
    const suyas = piezas.filter((p) => p.lanzamiento_id === lanzamiento.id);
    const escritas = suyas.filter((p) => !["borrador"].includes(p.estado)).length;
    return { lanzamiento, total: suyas.length, escritas };
  });

  return (
    <section className="flex flex-col gap-6">
      <p className="text-sm text-tinta-suave">
        Un lanzamiento reúne una oferta, sus fechas y las piezas que la anuncian. Las piezas son las mismas que ves en la biblioteca, en Email y en el calendario.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        <details className="rounded-tarjeta border border-borde p-4">
          <summary className="cursor-pointer font-medium text-verde-700">+ Lanzamiento desde cero</summary>
          <div className="mt-4"><FormularioNuevoLanzamiento ofertas={opcionesOfertas} /></div>
        </details>
        <details className="rounded-tarjeta border border-borde p-4">
          <summary className="cursor-pointer font-medium text-verde-700">+ Lanzamiento desde plantilla</summary>
          <div className="mt-4"><FormularioAplicarPlantilla plantillas={plantillas} ofertas={opcionesOfertas} /></div>
        </details>
      </div>

      {datos.length === 0 ? (
        <p className="rounded-tarjeta bg-acento-suave p-6 text-center text-tinta-suave">
          Todavía no hay lanzamientos. Crea el primero desde cero o parte de una plantilla.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {datos.map(({ lanzamiento, total, escritas }) => {
            const oferta = lanzamiento.oferta_id ? ofertaPorId.get(lanzamiento.oferta_id) : undefined;
            const pct = total > 0 ? Math.round((escritas / total) * 100) : 0;
            return (
              <li key={lanzamiento.id}>
                <Link href={`/lanzamientos/${lanzamiento.id}`} className="block rounded-tarjeta border border-borde p-4 hover:bg-verde-50">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="font-semibold">{lanzamiento.nombre}</h2>
                      {oferta && <p className="text-sm text-tinta-suave">{oferta.nombre}</p>}
                    </div>
                    <Etiqueta tono={TONO_ESTADO[lanzamiento.estado]}>{ETIQUETA_ESTADO_LANZAMIENTO[lanzamiento.estado]}</Etiqueta>
                  </div>
                  <p className="mt-1 text-sm text-tinta-suave">
                    {lanzamiento.fecha_inicio ? formatearFechaCorta(lanzamiento.fecha_inicio) : "Sin fecha"}
                    {" – "}
                    {lanzamiento.fecha_fin ? formatearFechaCorta(lanzamiento.fecha_fin) : "sin fecha de fin"}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-borde" role="img" aria-label={`${escritas} de ${total} piezas escritas`}>
                      <div className="h-full rounded-full bg-verde-300" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-tinta-suave">
                      {total} {total === 1 ? "pieza" : "piezas"} · {total - escritas} por escribir
                    </span>
                  </div>
                  {lanzamiento.objetivo && <p className="mt-2 line-clamp-2 text-sm">{lanzamiento.objetivo}</p>}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
