import { archivarPilar } from "@/features/ajustes/acciones";
import { HEX_PILAR, type Pilar } from "@/features/ajustes/esquemas";
import { FormularioEditarPilar, FormularioMarca, FormularioPilar } from "@/features/ajustes/formularios";
import { DatosDeEjemplo } from "@/features/demo/ajustes-demo";
import { PasosPorFormato, RitmoSemanal } from "@/features/mejoras/ajustes-calidad";
import { CopiaDeSeguridad } from "@/features/mejoras/copia-seguridad";
import { FechasSenaladas } from "@/features/mejoras/fechas-senaladas";
import { PapeleraAjustes } from "@/features/mejoras/papelera-ajustes";
import { PlantillasAjustes } from "@/features/plantillas/ajustes-plantillas";
import { botonDiscreto } from "@/shared/components/estilos";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";

export default async function Ajustes() {
  const supabase = await crearClienteServidor();
  const [
    { data: pilares },
    { data: ajustes },
    piezasDemo,
    ideasDemo,
    frasesDemo,
    ofertasDemo,
    hitosDemo,
    { data: senaladasR },
  ] = await Promise.all([
    supabase.from("pilares").select("id,nombre,descripcion,color,orden,archivado").order("orden"),
    supabase.from("ajustes").select("nombre_marca,audiencia_general,tono_general,ritmo_semanal,pasos_por_formato").maybeSingle(),
    supabase.from("piezas").select("id", { count: "exact", head: true }).eq("es_demo", true),
    supabase.from("ideas").select("id", { count: "exact", head: true }).eq("es_demo", true),
    supabase.from("frases").select("id", { count: "exact", head: true }).eq("es_demo", true),
    supabase.from("ofertas").select("id", { count: "exact", head: true }).eq("es_demo", true),
    supabase.from("lanzamiento_hitos").select("id", { count: "exact", head: true }).eq("es_demo", true),
    supabase.from("fechas_senaladas").select("id,titulo,fecha_inicio,fecha_fin,nota").order("fecha_inicio"),
  ]);
  const lista = (pilares ?? []) as Pilar[];
  const marca = ajustes ?? { nombre_marca: "Rosedal", audiencia_general: "", tono_general: "" };
  const conteo = {
    piezas: piezasDemo.count ?? 0,
    ideas: ideasDemo.count ?? 0,
    frases: frasesDemo.count ?? 0,
    ofertas: ofertasDemo.count ?? 0,
    hitos: hitosDemo.count ?? 0,
  };
  const ritmo = (ajustes?.ritmo_semanal as { reels: number; correos: number; posts: number } | null) ?? { reels: 0, correos: 0, posts: 0 };
  const pasosPorFormato = (ajustes?.pasos_por_formato as Record<string, string[]> | null) ?? {};
  const senaladas = (senaladasR ?? []) as { id: string; titulo: string; fecha_inicio: string; fecha_fin: string | null; nota: string }[];

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

      <PlantillasAjustes />

      <RitmoSemanal ritmo={ritmo} />

      <PasosPorFormato pasos={pasosPorFormato} />

      <FechasSenaladas fechas={senaladas} />

      <CopiaDeSeguridad />

      <PapeleraAjustes />

      <DatosDeEjemplo conteo={conteo} />
    </div>
  );
}
