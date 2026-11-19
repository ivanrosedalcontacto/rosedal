import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import type { Pilar } from "@/features/ajustes/esquemas";
import { HEX_PILAR } from "@/shared/constants/colores-pilar";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { EtiquetasPieza } from "./etiquetas-piezas";
import { ListaPendientes, type PiezaDeLista } from "./seleccion-piezas";

export const SIN_PILAR = "sin-pilar";

/** Carpeta de un pilar: lo que queda por grabar a la vista y lo ya grabado plegado. */
export async function CarpetaPilar({ pilarId }: { pilarId: string }) {
  const esSinPilar = pilarId === SIN_PILAR;
  if (!esSinPilar && !z.string().uuid().safeParse(pilarId).success) notFound();
  const supabase = await crearClienteServidor();
  let consulta = supabase
    .from("piezas")
    .select("id,titulo,formato,estado,finalidad")
    .is("eliminado_en", null)
    .order("created_at", { ascending: false });
  consulta = esSinPilar ? consulta.is("pilar_id", null) : consulta.eq("pilar_id", pilarId);
  const [{ data: piezasR }, { data: pilarR }] = await Promise.all([
    consulta,
    esSinPilar ? Promise.resolve({ data: null }) : supabase.from("pilares").select("id,nombre,color,archivado").eq("id", pilarId).maybeSingle(),
  ]);
  const pilar = pilarR as Pick<Pilar, "id" | "nombre" | "color" | "archivado"> | null;
  if (!esSinPilar && !pilar) notFound();
  const piezas = (piezasR ?? []) as PiezaDeLista[];
  const pendientes = piezas.filter((p) => p.estado === "borrador");
  const grabadas = piezas.filter((p) => p.estado !== "borrador");
  const nombre = pilar?.nombre ?? "Sin pilar";
  const color = pilar ? HEX_PILAR[pilar.color] : "var(--color-borde)";
  const nueva = esSinPilar ? "/piezas/nueva" : `/piezas/nueva?pilar=${pilarId}`;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/biblioteca" className="text-sm text-verde-700">← Biblioteca</Link>
      <header className="flex flex-wrap items-end justify-between gap-3 border-l-8 pl-4" style={{ borderColor: color }}>
        <div>
          <h1 className="font-serif text-2xl md:text-[28px]">{nombre}</h1>
          <p className="mt-1 text-tinta-suave">
            {pendientes.length === 1 ? "1 pieza por grabar" : `${pendientes.length} piezas por grabar`}
            {pilar?.archivado && " · pilar archivado"}
          </p>
        </div>
        <Link href={nueva} className="rounded-boton bg-verde-700 px-4 py-2.5 text-sm font-medium text-white">+ Nueva pieza</Link>
      </header>
      <ListaPendientes piezas={pendientes} />
      {grabadas.length > 0 && (
        <details className="rounded-tarjeta border border-borde bg-fondo-suave p-4">
          <summary className="cursor-pointer font-medium">Ya grabadas ({grabadas.length})</summary>
          <ul className="mt-3 flex flex-col gap-2">
            {grabadas.map((pieza) => (
              <li key={pieza.id} className="rounded-tarjeta border border-borde bg-fondo p-3">
                <Link href={`/piezas/${pieza.id}`} className="font-medium hover:text-verde-700">{pieza.titulo}</Link>
                <div className="mt-2"><EtiquetasPieza formato={pieza.formato} estado={pieza.estado} finalidad={pieza.finalidad} /></div>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
