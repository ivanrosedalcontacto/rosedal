import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { archivarOferta, borrarObjecion } from "@/features/ofertas/acciones";
import type { Objecion, Oferta } from "@/features/ofertas/esquemas";
import { FormularioObjecion, FormularioOferta } from "@/features/ofertas/formularios";
import { ETIQUETA_ESTADO, ETIQUETA_FINALIDAD, ETIQUETA_FORMATO, FINALIDADES, type Finalidad, type FormatoPieza } from "@/features/piezas/esquemas";
import { ETIQUETA_TIPO_SECUENCIA, type TipoSecuencia } from "@/features/email/esquemas";
import { Etiqueta } from "@/shared/components/etiquetas";
import { BotonCopiar } from "@/shared/components/boton-copiar";
import { botonDiscreto, botonPrincipal } from "@/shared/components/estilos";
import { formatearFechaCorta } from "@/shared/lib/fechas";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";

/** Ideas de tipo objeción vinculadas a esta oferta desde la sección Ideas. */
type ObjecionIdea = {
  id: string;
  texto: string;
  palabras_originales: string | null;
  procedencia: string | null;
  veces_aparecida: number;
};

type PiezaDeOferta = {
  id: string;
  titulo: string;
  formato: string;
  estado: string;
  finalidad: string | null;
  fecha_prevista: string | null;
};

type LanzamientoDeOferta = {
  id: string;
  nombre: string;
  estado: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
};

type SecuenciaDeOferta = { id: string; nombre: string; tipo: string; programacion: string };

function FilaPiezaOferta({ pieza }: { pieza: PiezaDeOferta }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 border-b border-borde px-3 py-2 last:border-b-0">
      <Link href={`/piezas/${pieza.id}`} className="min-w-0 font-medium hover:text-verde-700">{pieza.titulo}</Link>
      <span className="flex flex-wrap items-center gap-2 text-xs text-tinta-suave">
        <Etiqueta tono="gris">{ETIQUETA_FORMATO[pieza.formato as FormatoPieza] ?? pieza.formato}</Etiqueta>
        <Etiqueta tono={pieza.estado === "publicado" ? "verde" : "neutro"}>{ETIQUETA_ESTADO[pieza.estado as keyof typeof ETIQUETA_ESTADO] ?? pieza.estado}</Etiqueta>
        {pieza.fecha_prevista && <span>{formatearFechaCorta(pieza.fecha_prevista)}</span>}
      </span>
    </li>
  );
}

function ContenidoDeOferta({
  oferta,
  piezas,
  lanzamientos,
  secuencias,
}: {
  oferta: Oferta;
  piezas: PiezaDeOferta[];
  lanzamientos: LanzamientoDeOferta[];
  secuencias: SecuenciaDeOferta[];
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Contenido de esta oferta</h2>
        <Link href={`/piezas/nueva?oferta=${oferta.id}`} className={botonPrincipal}>Crear pieza para esta oferta</Link>
      </div>

      {piezas.length === 0 ? (
        <p className="rounded-tarjeta bg-acento-suave px-4 py-5 text-sm text-tinta-suave">
          Todavía no hay piezas que promocionen esta oferta.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {FINALIDADES.map((finalidad) => {
            const grupo = piezas.filter((p) => p.finalidad === (finalidad as Finalidad));
            if (grupo.length === 0) return null;
            return (
              <div key={finalidad}>
                <h3 className="mb-1 text-sm font-semibold">{ETIQUETA_FINALIDAD[finalidad]}</h3>
                <ul className="overflow-hidden rounded-tarjeta border border-borde">
                  {grupo.map((pieza) => <FilaPiezaOferta key={pieza.id} pieza={pieza} />)}
                </ul>
              </div>
            );
          })}
          {piezas.filter((p) => !p.finalidad).length > 0 && (
            <div>
              <h3 className="mb-1 text-sm font-semibold">Sin finalidad</h3>
              <ul className="overflow-hidden rounded-tarjeta border border-borde">
                {piezas.filter((p) => !p.finalidad).map((pieza) => <FilaPiezaOferta key={pieza.id} pieza={pieza} />)}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="mb-1 text-sm font-semibold">Lanzamientos</h3>
          {lanzamientos.length === 0 ? (
            <p className="text-sm text-tinta-suave">Ninguno todavía. <Link href="/lanzamientos" className="text-verde-700">Crear un lanzamiento</Link>.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {lanzamientos.map((l) => (
                <li key={l.id}>
                  <Link href={`/lanzamientos/${l.id}`} className="text-sm text-verde-700 hover:underline">{l.nombre}</Link>
                  <span className="text-xs text-tinta-suave">
                    {l.fecha_inicio ? ` · ${formatearFechaCorta(l.fecha_inicio)}` : ""}{l.fecha_fin ? ` – ${formatearFechaCorta(l.fecha_fin)}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h3 className="mb-1 text-sm font-semibold">Secuencias de correo</h3>
          {secuencias.length === 0 ? (
            <p className="text-sm text-tinta-suave">Ninguna todavía. <Link href="/email?vista=secuencias" className="text-verde-700">Crear una secuencia</Link>.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {secuencias.map((s) => (
                <li key={s.id}>
                  <Link href={`/email/secuencias/${s.id}`} className="text-sm text-verde-700 hover:underline">{s.nombre}</Link>
                  <span className="text-xs text-tinta-suave"> · {ETIQUETA_TIPO_SECUENCIA[s.tipo as TipoSecuencia] ?? s.tipo}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}


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
  const [{ data: oferta }, { data: objeciones }, { data: objecionesIdeas }, { data: piezasR }, { data: lanzamientosR }, { data: secuenciasR }] = await Promise.all([
    supabase.from("ofertas").select("*").eq("id", id).maybeSingle(),
    supabase.from("oferta_objeciones").select("id,objecion,respuesta,orden").eq("oferta_id", id).order("orden"),
    supabase
      .from("ideas")
      .select("id,texto,palabras_originales,procedencia,veces_aparecida")
      .eq("oferta_id", id)
      .eq("tipo", "objecion")
      .is("eliminado_en", null)
      .order("veces_aparecida", { ascending: false }),
    supabase
      .from("piezas")
      .select("id,titulo,formato,estado,finalidad,fecha_prevista")
      .eq("oferta_id", id)
      .is("eliminado_en", null)
      .order("fecha_prevista", { nullsFirst: false }),
    supabase.from("lanzamientos").select("id,nombre,estado,fecha_inicio,fecha_fin").eq("oferta_id", id).order("fecha_inicio", { ascending: false, nullsFirst: false }),
    supabase.from("secuencias_email").select("id,nombre,tipo,programacion").eq("oferta_id", id).order("created_at", { ascending: false }),
  ]);
  if (!oferta) notFound();
  const o = oferta as Oferta;
  const lista = (objeciones ?? []) as Objecion[];
  const vinculadas = (objecionesIdeas ?? []) as ObjecionIdea[];
  const piezas = (piezasR ?? []) as PiezaDeOferta[];
  const lanzamientos = (lanzamientosR ?? []) as LanzamientoDeOferta[];
  const secuencias = (secuenciasR ?? []) as SecuenciaDeOferta[];

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
          <p className="rounded-tarjeta bg-acento-suave px-4 py-6 text-tinta-suave">
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

      {vinculadas.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Objeciones que han aparecido en Ideas</h2>
          <p className="text-sm text-tinta-suave">
            Palabras de tu audiencia vinculadas a esta oferta desde la sección Ideas.
          </p>
          <ul className="overflow-hidden rounded-tarjeta border border-borde">
            {vinculadas.map((x) => (
              <li key={x.id} className="border-b border-borde px-4 py-3 last:border-b-0">
                <p className="font-medium">«{x.palabras_originales ?? x.texto}»</p>
                <p className="mt-1 text-sm text-tinta-suave">
                  {x.procedencia ? `${x.procedencia} · ` : ""}
                  Ha aparecido {x.veces_aparecida === 1 ? "1 vez" : `${x.veces_aparecida} veces`}
                </p>
                <Link href={`/ideas/${x.id}`} className="mt-1 inline-block text-sm text-verde-700">
                  Abrir en Ideas
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ContenidoDeOferta oferta={o} piezas={piezas} lanzamientos={lanzamientos} secuencias={secuencias} />
    </div>
  );
}
