import Link from "next/link";
import { quitarRecurso } from "@/features/recursos/acciones";
import { INFO_TIPO, TIPOS_RECURSO, type Recurso, type TipoRecurso } from "@/features/recursos/esquemas";
import { FormularioRecurso } from "@/features/recursos/formulario";
import { BotonCopiar } from "@/shared/components/boton-copiar";
import { botonDiscreto } from "@/shared/components/estilos";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";

export default async function Recursos({ searchParams }: { searchParams: Promise<{ tipo?: string }> }) {
  const { tipo: tipoParam } = await searchParams;
  const tipo: TipoRecurso = (TIPOS_RECURSO as readonly string[]).includes(tipoParam ?? "")
    ? (tipoParam as TipoRecurso)
    : "tono";

  const supabase = await crearClienteServidor();
  const { data } = await supabase
    .from("recursos_marca")
    .select("id,tipo,titulo,texto,url,autor,autorizado")
    .eq("tipo", tipo)
    .is("eliminado_en", null)
    .order("created_at", { ascending: false });
  const lista = (data ?? []) as Recurso[];

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-8 px-4 py-8 md:px-10 md:py-12">
      <div>
        <h1 className="font-serif text-2xl md:text-[28px]">Recursos de marca</h1>
        <p className="mt-2 text-tinta-suave">{INFO_TIPO[tipo].ayuda}</p>
      </div>

      <nav aria-label="Tipo de recurso" className="flex flex-wrap gap-2">
        {TIPOS_RECURSO.map((t) => (
          <Link
            key={t}
            href={`/recursos?tipo=${t}`}
            aria-current={t === tipo ? "page" : undefined}
            className={`min-h-11 rounded-full px-4 py-2.5 text-sm ${
              t === tipo ? "bg-verde-100 font-medium text-verde-700" : "border border-borde text-tinta"
            }`}
          >
            {INFO_TIPO[t].plural}
          </Link>
        ))}
      </nav>

      {lista.length === 0 ? (
        <p className="rounded-tarjeta bg-verde-50 px-4 py-6 text-tinta-suave">
          Aún no hay nada aquí. Añade tu primer {INFO_TIPO[tipo].singular} abajo.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {lista.map((x) => (
            <li key={x.id} className="rounded-tarjeta border border-borde p-4">
              {x.titulo && <p className="font-medium">{x.titulo}</p>}
              <p className="whitespace-pre-wrap">{x.texto}</p>
              {x.url && (
                <p className="mt-1 break-all text-sm text-verde-700">{x.url}</p>
              )}
              {x.tipo === "testimonio" && (
                <p className={`mt-2 text-sm ${x.autorizado ? "text-tinta-suave" : "text-aviso"}`}>
                  {x.autor ? `${x.autor} · ` : ""}
                  {x.autorizado ? "Autorizado" : "Sin autorización registrada"}
                </p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <BotonCopiar texto={x.texto} />
                <form action={quitarRecurso.bind(null, x.id)}>
                  <button type="submit" className={botonDiscreto}>
                    Quitar
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Añadir</h2>
        <FormularioRecurso tipo={tipo} />
      </section>
    </div>
  );
}
