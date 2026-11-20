import Link from "next/link";
import { convertirIdeaEnBroadcast } from "./acciones";
import { FormularioPasoEmail } from "./formulario-paso-email";
import { EtiquetaEstadoIdea } from "@/features/ideas/etiquetas-ideas";
import type { EstadoIdea } from "@/features/ideas/esquemas";
import { Etiqueta } from "@/shared/components/etiquetas";
import { botonPrincipal } from "@/shared/components/estilos";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";

type IdeaEmail = {
  id: string;
  texto: string;
  estado: EstadoIdea;
  created_at: string;
  email_tematica?: string | null;
};

type CorreoCreado = { id: string; titulo: string; idea_id: string | null };

export async function IdeasEmail() {
  const supabase = await crearClienteServidor();
  const [{ data: ideasR }, { data: correosR }, { data: secuenciasR }] = await Promise.all([
    supabase.from("ideas").select("id,texto,estado,created_at").eq("tipo", "idea_email").is("eliminado_en", null).neq("estado", "archivada").order("created_at", { ascending: false }),
    supabase.from("piezas").select("id,titulo,idea_id").eq("formato", "email").is("eliminado_en", null).not("idea_id", "is", null),
    supabase.from("secuencias_email").select("id,nombre").order("created_at", { ascending: false }),
  ]);
  const ideas = (ideasR ?? []) as IdeaEmail[];
  const correos = (correosR ?? []) as CorreoCreado[];
  const secuencias = (secuenciasR ?? []) as { id: string; nombre: string }[];
  const porIdea = new Map<string, CorreoCreado[]>();
  for (const correo of correos) {
    if (!correo.idea_id) continue;
    porIdea.set(correo.idea_id, [...(porIdea.get(correo.idea_id) ?? []), correo]);
  }

  return (
    <section className="flex flex-col gap-4">
      <p className="text-sm text-tinta-suave">Asuntos, anécdotas, preguntas o argumentos que quieres convertir en correo.</p>
      {ideas.length === 0 ? (
        <p className="rounded-tarjeta bg-acento-suave p-6 text-center text-tinta-suave">
          Todavía no tienes ideas de email. Añádelas desde <Link href="/ideas" className="text-verde-700">Ideas</Link> eligiendo el tipo «Idea de email».
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {ideas.map((idea) => {
            const creados = porIdea.get(idea.id) ?? [];
            return (
              <li key={idea.id} className="flex flex-col gap-3 rounded-tarjeta border border-borde p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <Link href={`/ideas/${idea.id}`} className="min-w-0 flex-1 whitespace-pre-wrap font-medium hover:text-verde-700">{idea.texto}</Link>
                  <EtiquetaEstadoIdea estado={idea.estado} />
                </div>
                {creados.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-tinta-suave">Ya tiene correo:</span>
                    {creados.map((c) => <Link key={c.id} href={`/piezas/${c.id}`} className="text-verde-700">{c.titulo}</Link>)}
                  </div>
                )}
                <div className="flex flex-wrap items-start gap-3">
                  <form action={convertirIdeaEnBroadcast.bind(null, idea.id)}>
                    <button className={botonPrincipal}>Convertir en broadcast</button>
                  </form>
                  <Etiqueta tono="neutro">o</Etiqueta>
                  <div className="min-w-[260px] flex-1">
                    <FormularioPasoEmail ideaId={idea.id} secuencias={secuencias} />
                  </div>
                </div>
                <p className="text-xs text-tinta-suave">La idea pasará a «En desarrollo» y quedará enlazada al correo creado.</p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
