import Link from "next/link";
import { z } from "zod";
import { FormularioNuevaPieza } from "@/features/piezas/formularios";
import { FORMATOS_PIEZA, type FormatoPieza } from "@/features/piezas/esquemas";
import { ETIQUETA_FASE, type TipoFase } from "@/features/lanzamientos/esquemas";
import { FormularioDesdePlantillaStories } from "@/features/plantillas/formulario-desde-plantilla-stories";
import { esFecha } from "@/shared/lib/fechas";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";

type Parametros = {
  idea?: string;
  titulo?: string;
  formato?: string;
  oferta?: string;
  lanzamiento?: string;
  fase?: string;
  fecha?: string;
};

const uuid = z.string().uuid();

async function contextoDeLaPieza(sp: Parametros): Promise<string | undefined> {
  const partes: string[] = [];
  const supabase = await crearClienteServidor();
  if (sp.oferta && uuid.safeParse(sp.oferta).success) {
    const { data } = await supabase.from("ofertas").select("nombre").eq("id", sp.oferta).maybeSingle();
    if (data) partes.push(`para la oferta «${data.nombre}»`);
  }
  if (sp.fase && uuid.safeParse(sp.fase).success) {
    const { data } = await supabase.from("lanzamiento_fases").select("tipo").eq("id", sp.fase).maybeSingle();
    if (data) partes.push(`de la fase «${ETIQUETA_FASE[data.tipo as TipoFase]}»`);
  }
  if (sp.lanzamiento && uuid.safeParse(sp.lanzamiento).success) {
    const { data } = await supabase.from("lanzamientos").select("nombre").eq("id", sp.lanzamiento).maybeSingle();
    if (data) partes.push(`del lanzamiento «${data.nombre}»`);
  }
  if (partes.length === 0) return undefined;
  const fecha = sp.fecha && esFecha(sp.fecha) ? ` con fecha prevista ${sp.fecha}` : "";
  return `Vas a crear una pieza ${partes.join(" ")}${fecha}.`;
}

export default async function NuevaPieza({ searchParams }: { searchParams: Promise<Parametros> }) {
  const sp = await searchParams;
  const formato = (FORMATOS_PIEZA as readonly string[]).includes(sp.formato ?? "") ? (sp.formato as FormatoPieza) : undefined;
  const contexto = await contextoDeLaPieza(sp);
  const supabase = await crearClienteServidor();
  const { data: plantillasR } = await supabase
    .from("plantillas")
    .select("id,nombre,descripcion")
    .eq("tipo", "stories")
    .order("created_at");
  const plantillas = (plantillasR ?? []) as { id: string; nombre: string; descripcion: string }[];
  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-6 px-4 py-8 md:py-12">
      <Link href="/biblioteca" className="text-sm text-verde-700">← Biblioteca</Link>
      <div>
        <h1 className="font-serif text-2xl">Nueva pieza</h1>
        <p className="mt-2 text-tinta-suave">Empieza con una idea y dale el formato que necesitas.</p>
      </div>
      <FormularioNuevaPieza
        ideaId={sp.idea}
        titulo={sp.titulo}
        formatoInicial={formato}
        ofertaId={sp.oferta}
        lanzamientoId={sp.lanzamiento}
        faseId={sp.fase}
        fechaPrevista={sp.fecha && esFecha(sp.fecha) ? sp.fecha : undefined}
        contexto={contexto}
      />
      {plantillas.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Crear una secuencia de stories desde una plantilla</h2>
          <FormularioDesdePlantillaStories plantillas={plantillas} />
        </section>
      )}
    </div>
  );
}
