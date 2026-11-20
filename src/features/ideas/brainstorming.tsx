import Link from "next/link";
import type { Pilar } from "@/features/ajustes/esquemas";
import type { Oferta } from "@/features/ofertas/esquemas";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { CAMPOS_IDEAS, type Parametros } from "./consultas";
import { FormularioColumna, FormularioNuevaColumna, SelectorMover, type Columna } from "./controles-tablero";
import { CAMPO_DIMENSION, DIMENSIONES, ETIQUETA_DIMENSION, type Dimension, type Idea } from "./esquemas";
import { EtiquetaTipoIdea } from "./etiquetas-ideas";
import { EtiquetaPilar } from "@/shared/components/etiquetas";

function leerDimension(p: Parametros): Dimension {
  const v = typeof p.por === "string" ? p.por : "";
  return (DIMENSIONES as readonly string[]).includes(v) ? (v as Dimension) : "tema";
}

function valorDe(idea: Idea, dim: Dimension): string {
  return idea[CAMPO_DIMENSION[dim]] ?? "";
}

export async function Brainstorming({ sp }: { sp: Parametros }) {
  const por = leerDimension(sp);
  const supabase = await crearClienteServidor();

  const [{ data: ideasR }, { data: pilaresR }, { data: ofertasR }] = await Promise.all([
    supabase
      .from("ideas")
      .select(CAMPOS_IDEAS)
      .is("eliminado_en", null)
      .neq("estado", "archivada")
      .order("created_at", { ascending: false }),
    supabase.from("pilares").select("id,nombre,color,archivado,orden").order("orden"),
    supabase.from("ofertas").select("id,nombre,archivada").order("nombre"),
  ]);

  const ideas = (ideasR ?? []) as Idea[];
  const pilares = (pilaresR ?? []) as Pilar[];
  const ofertas = (ofertasR ?? []) as Oferta[];

  // Columnas: el catálogo para pilar y oferta; los valores ya usados para tema y problema.
  let columnas: Columna[] = [];
  if (por === "pilar") {
    columnas = pilares.map((p) => ({ valor: p.id, nombre: p.archivado ? `${p.nombre} (archivada)` : p.nombre }));
  } else if (por === "oferta") {
    columnas = ofertas.map((o) => ({ valor: o.id, nombre: o.archivada ? `${o.nombre} (archivada)` : o.nombre }));
  } else {
    const valores = [...new Set(ideas.map((i) => valorDe(i, por).trim()).filter(Boolean))];
    columnas = valores
      .sort((a, b) => a.localeCompare(b, "es"))
      .map((v) => ({ valor: v, nombre: v }));
  }

  const sinAsignar: Idea[] = [];
  const grupos = new Map<string, Idea[]>(columnas.map((c) => [c.valor, []]));
  for (const idea of ideas) {
    const valor = valorDe(idea, por).trim();
    const grupo = valor ? grupos.get(valor) : undefined;
    if (grupo) grupo.push(idea);
    else sinAsignar.push(idea);
  }

  const pilarPorId = new Map(pilares.map((p) => [p.id, p]));
  const sinNombre = "Sin asignar";

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Agrupar por" className="flex flex-wrap gap-2">
          {DIMENSIONES.map((d) => (
            <Link
              key={d}
              href={`/ideas?vista=brainstorming&por=${d}`}
              aria-current={d === por ? "page" : undefined}
              className={`min-h-11 rounded-full px-4 py-2.5 text-sm ${
                d === por ? "bg-acento font-medium text-acento-texto" : "border border-borde text-tinta"
              }`}
            >
              {ETIQUETA_DIMENSION[d]}
            </Link>
          ))}
        </nav>
        {(por === "tema" || por === "problema") && <FormularioNuevaColumna por={por} />}
      </div>

      <p className="text-sm text-tinta-suave">Agrupadas por {ETIQUETA_DIMENSION[por].toLowerCase()}.</p>

      {ideas.length === 0 && (
        <p className="rounded-tarjeta bg-acento-suave px-4 py-6 text-tinta-suave">
          Todavía no tienes ideas para agrupar. Captura una desde Hoy con «+ Idea».
        </p>
      )}

      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:px-0">
        <ColumnaTablero
          titulo={sinNombre}
          ideas={sinAsignar}
          por={por}
          valor=""
          columnas={columnas}
          pilarPorId={pilarPorId}
        />
        {columnas.map((c) => (
          <ColumnaTablero
            key={c.valor}
            titulo={c.nombre}
            ideas={grupos.get(c.valor) ?? []}
            por={por}
            valor={c.valor}
            columnas={columnas}
            pilarPorId={pilarPorId}
          />
        ))}
      </div>
    </section>
  );
}

function ColumnaTablero({
  titulo,
  ideas,
  por,
  valor,
  columnas,
  pilarPorId,
}: {
  titulo: string;
  ideas: Idea[];
  por: Dimension;
  valor: string;
  columnas: Columna[];
  pilarPorId: Map<string, Pilar>;
}) {
  return (
    <div className="flex w-[280px] shrink-0 flex-col gap-3 rounded-tarjeta border border-borde bg-fondo-suave p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="truncate text-sm font-semibold" title={titulo}>
          {titulo}
        </h3>
        <span className="shrink-0 rounded-full bg-fondo px-2 py-0.5 text-xs text-tinta-suave">{ideas.length}</span>
      </div>

      <ul className="flex flex-col gap-2">
        {ideas.map((i) => {
          const pilar = i.pilar_id ? pilarPorId.get(i.pilar_id) : undefined;
          return (
            <li key={i.id} className="rounded-tarjeta border border-borde bg-fondo p-3">
              <Link href={`/ideas/${i.id}`} className="line-clamp-3 whitespace-pre-wrap text-sm">
                {i.texto}
              </Link>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <EtiquetaTipoIdea tipo={i.tipo} />
                {pilar && <EtiquetaPilar nombre={pilar.nombre} color={pilar.color} />}
              </div>
              <div className="mt-2">
                <SelectorMover ideaId={i.id} por={por} valorActual={valorDe(i, por).trim()} columnas={columnas} />
              </div>
            </li>
          );
        })}
      </ul>

      {ideas.length === 0 && <p className="text-xs text-tinta-suave">Sin ideas todavía.</p>}

      <FormularioColumna por={por} valor={valor} nombre={titulo} />
    </div>
  );
}
