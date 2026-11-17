import Link from "next/link";
import { Etiqueta, EtiquetaPilar } from "@/shared/components/etiquetas";
import type { Pilar } from "@/features/ajustes/esquemas";
import type { Oferta } from "@/features/ofertas/esquemas";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import {
  CAMPOS_IDEAS,
  compararPrioridad,
  compararTiempo,
  hayFiltrosActivos,
  leerFiltros,
  sanearBusqueda,
  type Parametros,
} from "./consultas";
import { EtiquetaEstadoIdea, EtiquetaTipoIdea } from "./etiquetas-ideas";
import { BarraFiltros } from "./filtros";
import type { Idea } from "./esquemas";

function fechaCapturada(iso: string): string {
  const fecha = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", timeZone: "Europe/Madrid" }).format(
    new Date(iso),
  );
  return `Capturada el ${fecha}`;
}

export async function Bandeja({ sp }: { sp: Parametros }) {
  const f = leerFiltros(sp);
  const supabase = await crearClienteServidor();

  let consulta = supabase.from("ideas").select(CAMPOS_IDEAS).is("eliminado_en", null);
  if (f.tipo) consulta = consulta.eq("tipo", f.tipo);
  else consulta = consulta.in("tipo", ["idea", "idea_email"]);
  if (f.estado) consulta = consulta.eq("estado", f.estado);
  else consulta = consulta.neq("estado", "archivada");
  if (f.pilar) consulta = consulta.eq("pilar_id", f.pilar);
  if (f.oferta) consulta = consulta.eq("oferta_id", f.oferta);
  if (f.lanzamiento) consulta = consulta.eq("lanzamiento_id", f.lanzamiento);
  if (f.relevancia) consulta = consulta.gte("relevancia", Number(f.relevancia));
  if (f.minutos === "mas") consulta = consulta.gt("minutos_preparacion", 60);
  else if (f.minutos) consulta = consulta.lte("minutos_preparacion", Number(f.minutos));
  const limpio = sanearBusqueda(f.q);
  if (limpio) {
    // La búsqueda pasa ya saneada: sin comillas, paréntesis ni comodines que rompan `.or(...)`.
    consulta = consulta.or(
      `texto.ilike.%${limpio}%,tema.ilike.%${limpio}%,problema_audiencia.ilike.%${limpio}%,notas.ilike.%${limpio}%`,
    );
  }
  if (f.orden === "recientes") consulta = consulta.order("created_at", { ascending: false });

  const [{ data: ideasR }, { data: pilaresR }, { data: ofertasR }, { data: lanzamientosR }] = await Promise.all([
    consulta,
    supabase.from("pilares").select("id,nombre,color,archivado,orden").order("orden"),
    supabase.from("ofertas").select("id,nombre,archivada").order("nombre"),
    supabase.from("lanzamientos").select("id,nombre").order("fecha_inicio", { ascending: false, nullsFirst: false }),
  ]);

  let ideas = (ideasR ?? []) as Idea[];
  if (f.orden === "prioridad") ideas = [...ideas].sort(compararPrioridad);
  if (f.orden === "tiempo") ideas = [...ideas].sort(compararTiempo);

  const pilares = (pilaresR ?? []) as Pilar[];
  const ofertas = (ofertasR ?? []) as Oferta[];
  const lanzamientos = (lanzamientosR ?? []) as { id: string; nombre: string }[];
  const pilarPorId = new Map(pilares.map((p) => [p.id, p]));
  const opcionesPilares = pilares.map((p) => ({ id: p.id, nombre: p.archivado ? `${p.nombre} (archivada)` : p.nombre }));
  const opcionesOfertas = ofertas.map((o) => ({ id: o.id, nombre: o.archivada ? `${o.nombre} (archivada)` : o.nombre }));
  const opcionesLanzamientos = lanzamientos.map((l) => ({ id: l.id, nombre: l.nombre }));
  const sinFiltros = !hayFiltrosActivos(f);

  return (
    <section className="flex flex-col gap-4">
      <BarraFiltros actual={f} pilares={opcionesPilares} ofertas={opcionesOfertas} lanzamientos={opcionesLanzamientos} />

      {ideas.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-tarjeta border border-borde bg-verde-50 px-6 py-14 text-center">
          <p className="text-tinta-suave">
            {sinFiltros
              ? "Todavía no tienes ideas. En Hoy, pulsa «+ Idea» y guarda la primera."
              : "Ninguna idea coincide con estos filtros. Quita alguno y vuelve a mirar."}
          </p>
          {!sinFiltros && (
            <Link href="/ideas" className="text-sm font-medium text-verde-700">
              Quitar los filtros
            </Link>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {ideas.map((i) => {
            const pilar = i.pilar_id ? pilarPorId.get(i.pilar_id) : undefined;
            const oferta = i.oferta_id ? ofertas.find((o) => o.id === i.oferta_id) : undefined;
            const lanzamiento = i.lanzamiento_id ? lanzamientos.find((l) => l.id === i.lanzamiento_id) : undefined;
            const sinClasificar = !i.pilar_id && !i.oferta_id && !i.tema;
            return (
              <li key={i.id}>
                <Link href={`/ideas/${i.id}`} className="block rounded-tarjeta border border-borde p-4 hover:bg-verde-50">
                  <p className="line-clamp-4 whitespace-pre-wrap">{i.texto}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <EtiquetaTipoIdea tipo={i.tipo} />
                    {i.estado !== "pendiente" && <EtiquetaEstadoIdea estado={i.estado} />}
                    {pilar && <EtiquetaPilar nombre={pilar.nombre} color={pilar.color} />}
                    {oferta && <Etiqueta>{oferta.nombre}</Etiqueta>}
                    {lanzamiento && <Etiqueta tono="menta">{lanzamiento.nombre}</Etiqueta>}
                    {sinClasificar && <Etiqueta tono="aviso">Sin clasificar</Etiqueta>}
                  </div>
                  <p className="mt-2 text-xs text-tinta-suave">
                    {fechaCapturada(i.created_at)}
                    {i.minutos_preparacion != null && ` · ${i.minutos_preparacion} min de preparación`}
                    {i.relevancia != null && ` · Relevancia ${["", "baja", "media", "alta"][i.relevancia]}`}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
