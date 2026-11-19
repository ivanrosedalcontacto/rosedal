import Link from "next/link";
import type { Pilar } from "@/features/ajustes/esquemas";
import { HEX_PILAR } from "@/shared/constants/colores-pilar";
import { hoyMadrid, sumarDias } from "@/shared/lib/fechas";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { EtiquetasPieza } from "./etiquetas-piezas";
import { SelectorEstadoTablero } from "./controles-clientes";
import { SIN_PILAR } from "./carpeta-pilar";
import { ESTADOS_PIEZA, ETIQUETA_ESTADO, type Pieza } from "./esquemas";

type Parametros = Record<string, string | string[] | undefined>;
type PiezaBiblioteca = Pick<Pieza, "id" | "titulo" | "formato" | "estado" | "finalidad" | "pilar_id" | "perenne" | "fecha_real" | "fecha_prevista">;
type Carpeta = { id: string; nombre: string; color: string; pendientes: number; grabadas: number; archivado: boolean };

const pestana = (activa: boolean) => `rounded-full px-4 py-2 text-sm ${activa ? "bg-verde-100 text-verde-700" : "border border-borde"}`;

/** Una carpeta por pilar activo; los archivados solo si aún tienen piezas; «Sin pilar» si hace falta. */
function carpetas(pilares: Pilar[], piezas: PiezaBiblioteca[]): Carpeta[] {
  const contar = (pilarId: string | null) => {
    const suyas = piezas.filter((p) => p.pilar_id === pilarId);
    return { pendientes: suyas.filter((p) => p.estado === "borrador").length, grabadas: suyas.filter((p) => p.estado !== "borrador").length };
  };
  const lista = pilares
    .map((p) => ({ id: p.id, nombre: p.nombre, color: HEX_PILAR[p.color], archivado: p.archivado, ...contar(p.id) }))
    .filter((c) => !c.archivado || c.pendientes + c.grabadas > 0)
    .sort((a, b) => Number(a.archivado) - Number(b.archivado));
  const sinPilar = contar(null);
  if (sinPilar.pendientes + sinPilar.grabadas > 0) {
    lista.push({ id: SIN_PILAR, nombre: "Sin pilar", color: "var(--color-borde)", archivado: false, ...sinPilar });
  }
  return lista;
}

function TarjetasPilares({ lista }: { lista: Carpeta[] }) {
  if (lista.length === 0) {
    return <p className="rounded-tarjeta bg-fondo-suave px-5 py-10 text-center text-tinta-suave">Crea tus pilares en Ajustes y aparecerán aquí como carpetas.</p>;
  }
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {lista.map((c) => (
        <li key={c.id}>
          <Link href={`/biblioteca/${c.id}`} className="block h-full rounded-tarjeta border border-borde border-t-8 bg-fondo p-4 transition hover:bg-fondo-suave" style={{ borderTopColor: c.color }}>
            <h2 className="font-serif text-xl">{c.nombre}</h2>
            <p className="mt-2 text-sm">{c.pendientes === 1 ? "1 por grabar" : `${c.pendientes} por grabar`}</p>
            <p className="mt-1 text-xs text-tinta-suave">{c.grabadas === 1 ? "1 ya grabada" : `${c.grabadas} ya grabadas`}{c.archivado && " · archivado"}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Tablero({ piezas }: { piezas: PiezaBiblioteca[] }) {
  return (
    <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:px-0">
      {ESTADOS_PIEZA.map((e) => (
        <section key={e} className="flex w-72 shrink-0 flex-col gap-3 rounded-tarjeta bg-fondo-suave p-3">
          <h2 className="font-semibold">{ETIQUETA_ESTADO[e]}</h2>
          {piezas.filter((p) => p.estado === e).map((pieza) => (
            <article key={pieza.id} className="rounded-tarjeta border border-borde bg-fondo p-3">
              <Link href={`/piezas/${pieza.id}`} className="font-semibold hover:text-verde-700">{pieza.titulo}</Link>
              <div className="mt-2"><EtiquetasPieza formato={pieza.formato} estado={pieza.estado} finalidad={pieza.finalidad} /></div>
              <SelectorEstadoTablero piezaId={pieza.id} estado={pieza.estado} formato={pieza.formato} />
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}

function ParaRetomar({ piezas }: { piezas: PiezaBiblioteca[] }) {
  if (piezas.length === 0) return null;
  return (
    <details className="rounded-tarjeta border border-borde bg-fondo-suave p-4">
      <summary className="cursor-pointer font-medium">
        Para retomar
        <span className="ml-2 text-sm font-normal text-tinta-suave">{piezas.length === 1 ? "1 pieza que merece volver" : `${piezas.length} piezas que merecen volver`}</span>
      </summary>
      <ul className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {piezas.map((pieza) => (
          <li key={pieza.id}>
            <Link href={`/piezas/${pieza.id}`} className="block rounded-tarjeta border border-borde bg-fondo p-3 hover:bg-verde-50">
              <p className="font-medium">{pieza.titulo}</p>
              <p className="mt-1 text-xs text-tinta-suave">{pieza.perenne ? "Perenne" : "Rindió bien hace tiempo"}</p>
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}

export async function Biblioteca({ sp }: { sp: Parametros }) {
  const vista = sp.vista === "tablero" ? "tablero" : "pilares";
  const supabase = await crearClienteServidor();
  const [{ data: piezasR }, { data: pilaresR }, { data: metricasR }] = await Promise.all([
    supabase.from("piezas").select("id,titulo,formato,estado,finalidad,pilar_id,perenne,fecha_real,fecha_prevista").is("eliminado_en", null).order("created_at", { ascending: false }),
    supabase.from("pilares").select("id,nombre,descripcion,color,orden,archivado").order("orden"),
    supabase.from("pieza_metricas").select("pieza_id,valor"),
  ]);
  const piezas = (piezasR ?? []) as PiezaBiblioteca[];
  const conResultados = new Set(((metricasR ?? []) as { pieza_id: string; valor: number | null }[]).filter((m) => (m.valor ?? 0) > 0).map((m) => m.pieza_id));
  // «Para retomar» (B5): lo perenne y lo publicado que dio resultados hace más de 90 días.
  const haceTiempo = sumarDias(hoyMadrid(), -90);
  const paraRetomar = piezas.filter((p) => {
    if (p.perenne) return true;
    const fecha = p.fecha_real ?? p.fecha_prevista;
    return p.estado === "publicado" && conResultados.has(p.id) && Boolean(fecha) && (fecha ?? "") < haceTiempo;
  });

  return (
    <section className="flex flex-col gap-5">
      <nav aria-label="Vista de biblioteca" className="flex gap-2">
        <Link href="/biblioteca" className={pestana(vista === "pilares")}>Pilares</Link>
        <Link href="/biblioteca?vista=tablero" className={pestana(vista === "tablero")}>Tablero</Link>
      </nav>
      {vista === "pilares" ? <TarjetasPilares lista={carpetas((pilaresR ?? []) as Pilar[], piezas)} /> : <Tablero piezas={piezas} />}
      <ParaRetomar piezas={paraRetomar} />
    </section>
  );
}
