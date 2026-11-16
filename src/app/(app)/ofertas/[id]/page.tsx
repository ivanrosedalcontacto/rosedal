import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { archivarOferta, borrarObjecion } from "@/features/ofertas/acciones";
import type { Objecion, Oferta } from "@/features/ofertas/esquemas";
import { FormularioObjecion, FormularioOferta } from "@/features/ofertas/formularios";
import { BotonCopiar } from "@/shared/components/boton-copiar";
import { botonDiscreto } from "@/shared/components/estilos";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";

function argumentario(o: Oferta, objeciones: Objecion[]): string {
  const partes = [
    o.nombre,
    o.publico && `Para quién es: ${o.publico}`,
    o.problema && `Problema que resuelve: ${o.problema}`,
    o.propuesta_valor && `Propuesta de valor: ${o.propuesta_valor}`,
    o.via_compra && `Cómo comprarlo o reservarlo: ${o.via_compra}${o.via_compra_url ? ` (${o.via_compra_url})` : ""}`,
    o.precio && `Precio: ${o.precio}`,
    ...objeciones.map((x) => `Objeción: ${x.objecion}${x.respuesta ? `\nRespuesta: ${x.respuesta}` : ""}`),
  ];
  return partes.filter(Boolean).join("\n\n");
}

export default async function FichaOferta({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const supabase = await crearClienteServidor();
  const [{ data: oferta }, { data: objeciones }] = await Promise.all([
    supabase.from("ofertas").select("*").eq("id", id).maybeSingle(),
    supabase.from("oferta_objeciones").select("id,objecion,respuesta,orden").eq("oferta_id", id).order("orden"),
  ]);
  if (!oferta) notFound();
  const o = oferta as Oferta;
  const lista = (objeciones ?? []) as Objecion[];

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-10 px-4 py-8 md:px-10 md:py-12">
      <div>
        <Link href="/ofertas" className="text-sm text-verde-700">
          ← Ofertas
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif text-2xl md:text-[28px]">{o.nombre}</h1>
          <div className="flex items-center gap-2">
            <BotonCopiar texto={argumentario(o, lista)} etiqueta="Copiar argumentario" />
            <form action={archivarOferta.bind(null, o.id, !o.archivada)}>
              <button type="submit" className={botonDiscreto}>
                {o.archivada ? "Restaurar" : "Archivar"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Datos de la oferta</h2>
        <FormularioOferta oferta={o} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Objeciones frecuentes</h2>
        {lista.length === 0 ? (
          <p className="rounded-tarjeta bg-verde-50 px-4 py-6 text-tinta-suave">
            Apunta aquí lo que te dicen antes de comprar y cómo lo respondes.
          </p>
        ) : (
          <ul className="overflow-hidden rounded-tarjeta border border-borde">
            {lista.map((x) => (
              <li key={x.id} className="flex items-start justify-between gap-3 border-b border-borde px-4 py-3 last:border-b-0">
                <div>
                  <p className="font-medium">«{x.objecion}»</p>
                  {x.respuesta && <p className="mt-1 whitespace-pre-wrap text-sm text-tinta-suave">{x.respuesta}</p>}
                </div>
                <form action={borrarObjecion.bind(null, o.id, x.id)}>
                  <button type="submit" className={botonDiscreto}>
                    Quitar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
        <FormularioObjecion ofertaId={o.id} />
      </section>
    </div>
  );
}
