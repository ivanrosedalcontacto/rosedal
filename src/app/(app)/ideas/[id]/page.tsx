import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { cambiarEstadoIdea, quitarIdea, sumarAparicion } from "@/features/ideas/acciones";
import { Angulos } from "@/features/ideas/angulos";
import type { Idea, TipoAngulo } from "@/features/ideas/esquemas";
import { EtiquetaEstadoIdea, EtiquetaTipoIdea } from "@/features/ideas/etiquetas-ideas";
import { FormularioIdea } from "@/features/ideas/formulario-idea";
import { componerPrompt } from "@/features/ideas/prompt";
import { FormularioNuevaPieza } from "@/features/piezas/formularios";
import { ETIQUETA_FORMATO, ETIQUETA_ESTADO, type EstadoPieza, type FormatoPieza } from "@/features/piezas/esquemas";
import type { Pilar } from "@/features/ajustes/esquemas";
import type { Oferta } from "@/features/ofertas/esquemas";
import { BotonCopiar } from "@/shared/components/boton-copiar";
import { botonDiscreto } from "@/shared/components/estilos";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";

type FilaAngulo = { tipo: TipoAngulo; nota: string };
type FilaAjustes = { audiencia_general: string; tono_general: string };
type FilaTexto = { tema: string | null };
type FilaProblema = { problema_audiencia: string | null };
type PiezaDeIdea = { id: string; titulo: string; formato: FormatoPieza; finalidad: string | null; estado: EstadoPieza; fecha_prevista: string | null };

function primeraLinea(texto: string): string {
  const linea = texto.split("\n")[0].trim();
  return linea.length > 90 ? `${linea.slice(0, 90)}…` : linea;
}

function unicos(valores: (string | null)[]): string[] {
  return [...new Set(valores)].filter((v): v is string => Boolean(v));
}

export default async function FichaIdea({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const supabase = await crearClienteServidor();
  const { data: crudo } = await supabase.from("ideas").select("*").eq("id", id).is("eliminado_en", null).maybeSingle();
  if (!crudo) notFound();
  const idea = crudo as Idea;

  const [angulosR, pilaresR, ofertasR, lanzamientosR, ajustesR, tonosR, temasR, problemasR, piezasR] = await Promise.all([
    supabase.from("idea_angulos").select("tipo,nota").eq("idea_id", id),
    supabase.from("pilares").select("id,nombre,descripcion,color,orden,archivado").order("orden"),
    supabase
      .from("ofertas")
      .select("id,nombre,tipo,publico,problema,propuesta_valor,via_compra,via_compra_url,precio,archivada")
      .order("nombre"),
    supabase.from("lanzamientos").select("id,nombre").order("fecha_inicio", { ascending: false, nullsFirst: false }),
    supabase.from("ajustes").select("audiencia_general,tono_general").maybeSingle(),
    supabase.from("recursos_marca").select("texto").eq("tipo", "tono").is("eliminado_en", null).order("created_at").limit(3),
    supabase.from("ideas").select("tema").not("tema", "is", null).is("eliminado_en", null).neq("estado", "archivada").limit(200),
    supabase
      .from("ideas")
      .select("problema_audiencia")
      .not("problema_audiencia", "is", null)
      .is("eliminado_en", null)
      .neq("estado", "archivada")
      .limit(200),
    supabase.from("piezas").select("id,titulo,formato,finalidad,estado,fecha_prevista").eq("idea_id", id).is("eliminado_en", null).order("created_at", { ascending: false }),
  ]);

  const angulos = (angulosR.data ?? []) as FilaAngulo[];
  const pilares = (pilaresR.data ?? []) as Pilar[];
  const ofertas = (ofertasR.data ?? []) as Oferta[];
  const lanzamientos = (lanzamientosR.data ?? []) as { id: string; nombre: string }[];
  const ajustes = (ajustesR.data ?? null) as FilaAjustes | null;
  const tonos = (tonosR.data ?? []) as { texto: string }[];
  const temas = unicos(((temasR.data ?? []) as FilaTexto[]).map((x) => x.tema));
  const problemas = unicos(((problemasR.data ?? []) as FilaProblema[]).map((x) => x.problema_audiencia));
  const piezas = (piezasR.data ?? []) as PiezaDeIdea[];

  const ofertaIdea = idea.oferta_id ? (ofertas.find((o) => o.id === idea.oferta_id) ?? null) : null;
  const prompt = componerPrompt({
    idea: { texto: idea.texto, tipo: idea.tipo, procedencia: idea.procedencia, veces_aparecida: idea.veces_aparecida },
    audienciaGeneral: ajustes?.audiencia_general ?? "",
    tonoGeneral: ajustes?.tono_general ?? "",
    oferta: ofertaIdea
      ? { nombre: ofertaIdea.nombre, publico: ofertaIdea.publico, propuesta_valor: ofertaIdea.propuesta_valor }
      : null,
    ejemplosTono: tonos.slice(0, 3).map((t) => t.texto),
  });

  const esDeAudiencia = idea.tipo === "pregunta" || idea.tipo === "objecion";
  const veces = idea.veces_aparecida === 1 ? "1 vez" : `${idea.veces_aparecida} veces`;
  const archivada = idea.estado === "archivada";

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-10 px-4 py-8 md:px-10 md:py-12">
      <div>
        <Link href="/ideas" className="text-sm text-verde-700">
          ← Ideas
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif text-2xl md:text-[28px]">{primeraLinea(idea.texto)}</h1>
          <div className="flex items-center gap-2">
            <form action={cambiarEstadoIdea.bind(null, idea.id, archivada ? "pendiente" : "archivada")}>
              <button type="submit" className={botonDiscreto}>
                {archivada ? "Restaurar" : "Archivar"}
              </button>
            </form>
            <form action={quitarIdea.bind(null, idea.id)}>
              <button type="submit" className={botonDiscreto}>
                Enviar a la papelera
              </button>
            </form>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <EtiquetaTipoIdea tipo={idea.tipo} />
          <EtiquetaEstadoIdea estado={idea.estado} />
        </div>
      </div>

      {esDeAudiencia && (
        <section className="rounded-tarjeta bg-rosa-50 px-4 py-4">
          <h2 className="text-lg font-semibold">Palabras de tu audiencia</h2>
          <p className="mt-2 whitespace-pre-wrap text-[17px] leading-[1.6]">«{idea.palabras_originales ?? idea.texto}»</p>
          {idea.procedencia && <p className="mt-2 text-sm text-tinta-suave">Procedencia: {idea.procedencia}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="text-sm">Ha aparecido {veces}</p>
            <form action={sumarAparicion.bind(null, idea.id)}>
              <button type="submit" className={botonDiscreto}>
                Ha vuelto a aparecer
              </button>
            </form>
          </div>
        </section>
      )}

      <FormularioIdea idea={idea} pilares={pilares} ofertas={ofertas} lanzamientos={lanzamientos} temas={temas} problemas={problemas} />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Ángulos</h2>
        <p className="text-sm text-tinta-suave">Piensa cómo contarías esta idea desde cada enfoque.</p>
        <Angulos ideaId={idea.id} angulos={angulos} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Explorar ángulos</h2>
        <p className="text-sm text-tinta-suave">
          Reúne la idea, tu audiencia, la oferta y tu tono en un texto para pegarlo en Claude.
        </p>
        <div>
          <BotonCopiar texto={prompt} etiqueta="Copiar prompt para explorar ángulos" />
        </div>
      </section>

       <section className="flex flex-col gap-3">
         <h2 className="text-lg font-semibold">Piezas creadas a partir de esta idea</h2>
         {piezas.length === 0 ? <p className="rounded-tarjeta bg-verde-50 px-4 py-6 text-tinta-suave">Aún no hay piezas a partir de esta idea. Crea la primera cuando quieras desarrollarla.</p> : <ul className="rounded-tarjeta border border-borde">{piezas.map((pieza) => <li key={pieza.id} className="border-b border-borde px-4 py-3 last:border-b-0"><Link href={`/piezas/${pieza.id}`} className="font-medium text-verde-700">{ETIQUETA_FORMATO[pieza.formato]} · {pieza.titulo}</Link><p className="mt-1 text-sm text-tinta-suave">{pieza.finalidad ?? "Sin finalidad"} · {ETIQUETA_ESTADO[pieza.estado]}{pieza.fecha_prevista ? ` · ${pieza.fecha_prevista}` : ""}</p></li>)}</ul>}
         <FormularioNuevaPieza ideaId={idea.id} titulo={primeraLinea(idea.texto)} />
       </section>
    </div>
  );
}
