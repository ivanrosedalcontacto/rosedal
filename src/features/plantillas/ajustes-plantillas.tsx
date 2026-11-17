import { EditorPlantilla } from "@/features/lanzamientos/formulario-plantilla";
import { sembrarPlantillasPartida } from "@/features/lanzamientos/plantillas-partida";
import type { PlantillaLanzamiento } from "@/features/lanzamientos/esquemas";
import { botonDiscreto } from "@/shared/components/estilos";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { duplicarPlantilla, eliminarPlantilla } from "./acciones";
import { EditorPlantillaSecuencia, EditorPlantillaStories } from "./formularios-plantilla";
import { textoPlazo, type PasoSecuencia, type TarjetaStories } from "./esquemas";
import { sembrarPlantillasDePartida } from "./plantillas-partida";

type Plantilla = {
  id: string;
  tipo: "lanzamiento" | "stories" | "secuencia_email";
  nombre: string;
  descripcion: string;
  clave: string | null;
  contenido: unknown;
};

type PlantillaSecuencia = Plantilla & { contenido: { tipo: string; programacion: string; pasos: PasoSecuencia[] } };
type PlantillaStories = Plantilla & { contenido: { tarjetas: TarjetaStories[] } };

/** Plantillas de la app: de lanzamiento, de secuencia de correo y de stories. */
export async function PlantillasAjustes() {
  const supabase = await crearClienteServidor();
  await sembrarPlantillasPartida(supabase);
  await sembrarPlantillasDePartida(supabase);
  const { data } = await supabase
    .from("plantillas")
    .select("id,tipo,nombre,descripcion,clave,contenido")
    .order("tipo")
    .order("created_at");
  const plantillas = (data ?? []) as Plantilla[];
  const deLanzamiento = plantillas.filter((p) => p.tipo === "lanzamiento") as PlantillaLanzamiento[];
  const deSecuencia = plantillas.filter((p) => p.tipo === "secuencia_email") as PlantillaSecuencia[];
  const deStories = plantillas.filter((p) => p.tipo === "stories") as PlantillaStories[];

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Plantillas</h2>
        <p className="mt-1 text-sm text-tinta-suave">
          Estructuras guardadas: de lanzamiento, de secuencia de correo y de stories. Las que vienen con la app no se
          pueden quitar, pero se pueden copiar y editar.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Lanzamientos</h3>
        <ul className="flex flex-col gap-3">
          {deLanzamiento.map((plantilla) => (
            <li key={plantilla.id} className="rounded-tarjeta border border-borde p-4">
              <EncabezadoPlantilla plantilla={plantilla} />
              <details className="mt-2">
                <summary className="min-h-11 cursor-pointer py-2 text-sm text-verde-700">Editar plantilla</summary>
                <div className="mt-2">
                  <EditorPlantilla plantilla={plantilla} />
                </div>
              </details>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Secuencias de correo</h3>
        <ul className="flex flex-col gap-3">
          {deSecuencia.map((plantilla) => (
            <li key={plantilla.id} className="rounded-tarjeta border border-borde p-4">
              <EncabezadoPlantilla plantilla={plantilla} />
              <p className="mt-1 text-xs text-tinta-suave">
                {plantilla.contenido.pasos.length} pasos ·{" "}
                {plantilla.contenido.programacion === "relativa" ? "plazos relativos" : "fechas fijas"}
              </p>
              <ul className="mt-2 flex flex-col gap-1">
                {plantilla.contenido.pasos.map((paso, i) => (
                  <li key={`${plantilla.id}-${i}`} className="text-xs text-tinta-suave">
                    {i + 1}. {paso.proposito} · {textoPlazo(paso)}
                  </li>
                ))}
              </ul>
              <details className="mt-2">
                <summary className="min-h-11 cursor-pointer py-2 text-sm text-verde-700">Editar plantilla</summary>
                <div className="mt-2">
                  <EditorPlantillaSecuencia plantilla={plantilla} />
                </div>
              </details>
            </li>
          ))}
        </ul>
        <details className="rounded-tarjeta border border-borde p-4">
          <summary className="cursor-pointer text-sm font-medium text-verde-700">+ Nueva plantilla de correo</summary>
          <div className="mt-3">
            <EditorPlantillaSecuencia />
          </div>
        </details>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Secuencias de stories</h3>
        <ul className="flex flex-col gap-3">
          {deStories.map((plantilla) => (
            <li key={plantilla.id} className="rounded-tarjeta border border-borde p-4">
              <EncabezadoPlantilla plantilla={plantilla} />
              <p className="mt-1 text-xs text-tinta-suave">{plantilla.contenido.tarjetas.length} tarjetas</p>
              <ul className="mt-2 flex flex-col gap-1">
                {plantilla.contenido.tarjetas.map((tarjeta, i) => (
                  <li key={`${plantilla.id}-${i}`} className="text-xs text-tinta-suave">
                    {i + 1}. {tarjeta.titulo}
                  </li>
                ))}
              </ul>
              <details className="mt-2">
                <summary className="min-h-11 cursor-pointer py-2 text-sm text-verde-700">Editar plantilla</summary>
                <div className="mt-2">
                  <EditorPlantillaStories plantilla={plantilla} />
                </div>
              </details>
            </li>
          ))}
        </ul>
        <details className="rounded-tarjeta border border-borde p-4">
          <summary className="cursor-pointer text-sm font-medium text-verde-700">+ Nueva plantilla de stories</summary>
          <div className="mt-3">
            <EditorPlantillaStories />
          </div>
        </details>
      </div>
    </section>
  );
}

function EncabezadoPlantilla({ plantilla }: { plantilla: { id: string; nombre: string; descripcion: string; clave: string | null } }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div>
        <p className="font-medium">{plantilla.nombre}</p>
        {plantilla.descripcion && <p className="text-sm text-tinta-suave">{plantilla.descripcion}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        <form action={duplicarPlantilla.bind(null, plantilla.id)}>
          <button type="submit" className={botonDiscreto}>
            Duplicar
          </button>
        </form>
        {plantilla.clave === null && (
          <form action={eliminarPlantilla.bind(null, plantilla.id)}>
            <button type="submit" className={botonDiscreto}>
              Quitar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
