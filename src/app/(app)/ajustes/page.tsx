import { archivarPilar } from "@/features/ajustes/acciones";
import { HEX_PILAR, type Pilar } from "@/features/ajustes/esquemas";
import { FormularioEditarPilar, FormularioMarca, FormularioPilar } from "@/features/ajustes/formularios";
import { botonDiscreto } from "@/shared/components/estilos";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";

export default async function Ajustes() {
  const supabase = await crearClienteServidor();
  const [{ data: pilares }, { data: ajustes }] = await Promise.all([
    supabase.from("pilares").select("id,nombre,descripcion,color,orden,archivado").order("orden"),
    supabase.from("ajustes").select("nombre_marca,audiencia_general,tono_general").maybeSingle(),
  ]);
  const lista = (pilares ?? []) as Pilar[];
  const marca = ajustes ?? { nombre_marca: "Rosedal", audiencia_general: "", tono_general: "" };

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-10 px-4 py-8 md:px-10 md:py-12">
      <h1 className="font-serif text-2xl md:text-[28px]">Ajustes</h1>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Mi marca</h2>
        <FormularioMarca marca={marca} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Mis pilares</h2>
        {lista.length === 0 ? (
          <p className="rounded-tarjeta bg-verde-50 px-4 py-6 text-tinta-suave">
            Aún no tienes pilares. Un pilar es de qué hablas; crea el primero.
          </p>
        ) : (
          <ul className="overflow-hidden rounded-tarjeta border border-borde">
            {lista.map((p) => (
              <li key={p.id} className="border-b border-borde px-4 py-3 last:border-b-0">
                <div className="flex items-start justify-between gap-3">
                  <div className={`flex gap-3 ${p.archivado ? "opacity-50" : ""}`}>
                    <span
                      aria-hidden
                      className="mt-1.5 h-3 w-3 shrink-0 rounded-full"
                      style={{ background: HEX_PILAR[p.color] }}
                    />
                    <div>
                      <p className="font-medium">
                        {p.nombre}
                        {p.archivado && <span className="ml-2 text-xs text-tinta-suave">Archivado</span>}
                      </p>
                      {p.descripcion && <p className="text-sm text-tinta-suave">{p.descripcion}</p>}
                    </div>
                  </div>
                  <form action={archivarPilar.bind(null, p.id, !p.archivado)}>
                    <button type="submit" className={botonDiscreto}>
                      {p.archivado ? "Restaurar" : "Archivar"}
                    </button>
                  </form>
                </div>
                <details className="mt-1">
                  <summary className="min-h-11 cursor-pointer py-2 text-sm text-verde-700">Editar</summary>
                  <FormularioEditarPilar pilar={p} />
                </details>
              </li>
            ))}
          </ul>
        )}
        <h3 className="mt-2 font-medium">Añadir un pilar</h3>
        <FormularioPilar />
      </section>
    </div>
  );
}
