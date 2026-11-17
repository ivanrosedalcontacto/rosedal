import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import type { Oferta } from "@/features/ofertas/esquemas";
import { Etiqueta } from "@/shared/components/etiquetas";
import { botonPrincipal } from "@/shared/components/estilos";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { anadirPasoNuevo } from "@/features/email/acciones-secuencias";
import { Cronologia, piezaDelPaso, type FilaPaso, type PasoConPieza } from "@/features/email/cronologia";
import { ETIQUETA_PROGRAMACION, ETIQUETA_TIPO_SECUENCIA, type Secuencia } from "@/features/email/esquemas";
import { FormularioPasoExistente } from "@/features/email/formulario-paso-existente";
import { FormularioComoTemplate, FormularioEditarSecuencia } from "@/features/email/formularios-secuencia";

export default async function FichaSecuencia({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const supabase = await crearClienteServidor();
  const [{ data: secuenciaR }, { data: filasR }, { data: ofertasR }] = await Promise.all([
    supabase.from("secuencias_email").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("secuencia_pasos")
      .select("id,pieza_id,orden,plazo_cantidad,plazo_unidad,piezas(id,titulo,estado,finalidad,fecha_prevista,email_preview)")
      .eq("secuencia_id", id)
      .order("orden"),
    supabase.from("ofertas").select("id,nombre,archivada").order("nombre"),
  ]);
  if (!secuenciaR) notFound();
  const secuencia = secuenciaR as Secuencia;
  const filas = (filasR ?? []) as FilaPaso[];
  const pasos = filas
    .map((fila) => {
      const pieza = piezaDelPaso(fila);
      return pieza ? ({ ...fila, pieza } satisfies PasoConPieza) : null;
    })
    .filter((paso): paso is PasoConPieza => paso !== null);
  const ofertas = (ofertasR ?? []) as Oferta[];
  const ids = pasos.map((p) => p.pieza_id);
  const [{ data: asuntosR }, { data: todosPasosR }, { data: correosR }] = await Promise.all([
    ids.length > 0
      ? supabase.from("pieza_versiones").select("pieza_id,asunto").eq("tipo", "asunto").eq("elegida", true).in("pieza_id", ids)
      : Promise.resolve({ data: [] as { pieza_id: string; asunto: string }[] }),
    supabase.from("secuencia_pasos").select("pieza_id"),
    supabase.from("piezas").select("id,titulo,estado").eq("formato", "email").is("eliminado_en", null).order("titulo"),
  ]);
  const asuntoPorPieza = new Map((asuntosR ?? []).map((a) => [a.pieza_id as string, a.asunto as string]));
  const yaEnSecuencia = new Set((todosPasosR ?? []).map((p) => p.pieza_id as string));
  const correosLibres = ((correosR ?? []) as { id: string; titulo: string; estado: string }[]).filter((c) => !yaEnSecuencia.has(c.id));
  const relativa = secuencia.programacion === "relativa";
  const porEscribir = pasos.filter((p) => ["borrador", "en_preparacion"].includes(p.pieza.estado)).length;

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6 px-4 py-8 md:px-10 md:py-12">
      <Link href="/email?vista=secuencias" className="text-sm text-verde-700">← Secuencias</Link>
      <header className="flex flex-col gap-3 border-b border-borde pb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-serif text-2xl md:text-[28px]">{secuencia.nombre}</h1>
          <div className="flex flex-wrap gap-2">
            <Etiqueta>{ETIQUETA_TIPO_SECUENCIA[secuencia.tipo]}</Etiqueta>
            <Etiqueta tono="gris">{ETIQUETA_PROGRAMACION[secuencia.programacion]}</Etiqueta>
          </div>
        </div>
        <p className="text-sm text-tinta-suave">
          {pasos.length} {pasos.length === 1 ? "correo" : "correos"}
          {porEscribir > 0 ? ` · ${porEscribir} por escribir` : " · todo escrito"}
          {relativa ? " · sus pasos no aparecen en Broadcasts ni en el calendario" : " · sus pasos aparecen en Broadcasts y en el calendario"}
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <p className="rounded-tarjeta bg-fondo-suave p-3 text-sm"><strong>A quién va dirigida</strong><br />{secuencia.audiencia || "Sin definir"}</p>
          <p className="rounded-tarjeta bg-fondo-suave p-3 text-sm"><strong>Qué la inicia</strong><br />{secuencia.disparador || "Sin definir"}</p>
          <p className="rounded-tarjeta bg-fondo-suave p-3 text-sm"><strong>Qué busca conseguir</strong><br />{secuencia.objetivo || "Sin definir"}</p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <main className="flex flex-col gap-6">
          <h2 className="text-xl font-semibold">Cronología</h2>
          <Cronologia secuencia={secuencia} pasos={pasos} asuntoPorPieza={asuntoPorPieza} />

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold">Añadir paso</h2>
            <form action={anadirPasoNuevo.bind(null, secuencia.id)}>
              <button className={botonPrincipal}>Escribir un correo nuevo</button>
            </form>
            <details className="rounded-tarjeta border border-borde p-4">
              <summary className="cursor-pointer font-medium text-verde-700">Incorporar un correo existente</summary>
              <div className="mt-3"><FormularioPasoExistente secuenciaId={secuencia.id} correos={correosLibres} programacion={secuencia.programacion} /></div>
            </details>
          </section>
        </main>

        <aside className="flex flex-col gap-5">
          <section>
            <h2 className="mb-3 text-xl font-semibold">Datos de la secuencia</h2>
            <FormularioEditarSecuencia secuencia={secuencia} ofertas={ofertas.map((o) => ({ id: o.id, nombre: o.archivada ? `${o.nombre} (archivada)` : o.nombre }))} />
          </section>
          <FormularioComoTemplate secuenciaId={secuencia.id} />
        </aside>
      </div>
    </div>
  );
}
