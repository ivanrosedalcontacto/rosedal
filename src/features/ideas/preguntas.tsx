import Link from "next/link";
import { sumarAparicion } from "./acciones";
import type { Idea, TipoIdea } from "./esquemas";
import { EtiquetaTipoIdea } from "./etiquetas-ideas";
import { FormularioPregunta } from "./formulario-pregunta";
import { CAMPOS_IDEAS, type Parametros } from "./consultas";
import { Etiqueta } from "@/shared/components/etiquetas";
import { botonDiscreto } from "@/shared/components/estilos";
import type { Oferta } from "@/features/ofertas/esquemas";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";

const TIPOS_PREGUNTA: TipoIdea[] = ["pregunta", "objecion"];

export async function Preguntas({ sp }: { sp: Parametros }) {
  const ordenAsc = sp.orden === "asc";
  const supabase = await crearClienteServidor();

  const [{ data: ideasR }, { data: ofertasR }] = await Promise.all([
    supabase
      .from("ideas")
      .select(CAMPOS_IDEAS)
      .is("eliminado_en", null)
      .neq("estado", "archivada")
      .in("tipo", TIPOS_PREGUNTA)
      .order("veces_aparecida", { ascending: ordenAsc })
      .order("created_at", { ascending: false }),
    supabase.from("ofertas").select("id,nombre,archivada").order("nombre"),
  ]);

  const ideas = (ideasR ?? []) as Idea[];
  const ofertas = (ofertasR ?? []) as Oferta[];
  const opcionesOfertas = ofertas.map((o) => ({ id: o.id, nombre: o.archivada ? `${o.nombre} (archivada)` : o.nombre }));

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-tinta-suave">
          Las palabras con las que te preguntan o te ponen pegas, con su procedencia y cuántas veces han aparecido.
        </p>
        <Link
          href={`/ideas?vista=preguntas&orden=${ordenAsc ? "desc" : "asc"}`}
          className="text-sm font-medium text-verde-700"
        >
          {ordenAsc ? "Ver primero las que más han aparecido" : "Ver primero las que menos han aparecido"}
        </Link>
      </div>

      {ideas.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-tarjeta border border-borde bg-verde-50 px-6 py-14 text-center">
          <p className="text-tinta-suave">
            Todavía no has guardado ninguna pregunta u objeción. Apunta la primera abajo, con sus palabras.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {ideas.map((i) => {
            const oferta = i.oferta_id ? ofertas.find((o) => o.id === i.oferta_id) : undefined;
            const veces = i.veces_aparecida === 1 ? "1 vez" : `${i.veces_aparecida} veces`;
            return (
              <li key={i.id} className="rounded-tarjeta border border-borde p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <EtiquetaTipoIdea tipo={i.tipo} />
                  {oferta && <Etiqueta>{oferta.nombre}</Etiqueta>}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-[17px] leading-[1.6]">
                  «{i.palabras_originales ?? i.texto}»
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-tinta-suave">
                    {i.procedencia && <span>Procedencia: {i.procedencia}</span>}
                    <span>Ha aparecido {veces}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={sumarAparicion.bind(null, i.id)}>
                      <button type="submit" className={botonDiscreto}>
                        Ha vuelto a aparecer
                      </button>
                    </form>
                    <Link href={`/ideas/${i.id}`} className={botonDiscreto}>
                      Abrir
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Nueva pregunta u objeción</h2>
        <FormularioPregunta ofertas={opcionesOfertas} />
      </section>
    </section>
  );
}
