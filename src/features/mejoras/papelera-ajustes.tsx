import { botonDiscreto } from "@/shared/components/estilos";
import { formatearFecha } from "@/shared/lib/fechas";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { restaurarDeLaPapelera, vaciarPapelera } from "./acciones";

type Elemento = { id: string; texto: string; tipo: "idea" | "pieza" | "frase" | "recurso"; fecha: string | null };

/** Papelera: lo que se borró, para devolverlo o vaciarlo de verdad. */
export async function PapeleraAjustes() {
  const supabase = await crearClienteServidor();
  const [{ data: ideasR }, { data: piezasR }, { data: frasesR }, { data: recursosR }] = await Promise.all([
    supabase.from("ideas").select("id,texto,eliminado_en").not("eliminado_en", "is", null).order("eliminado_en", { ascending: false }),
    supabase.from("piezas").select("id,titulo,eliminado_en").not("eliminado_en", "is", null).order("eliminado_en", { ascending: false }),
    supabase.from("frases").select("id,texto,eliminado_en").not("eliminado_en", "is", null).order("eliminado_en", { ascending: false }),
    supabase.from("recursos_marca").select("id,texto,titulo,eliminado_en").not("eliminado_en", "is", null).order("eliminado_en", { ascending: false }),
  ]);

  const elementos: Elemento[] = [
    ...((ideasR ?? []) as { id: string; texto: string; eliminado_en: string }[]).map((i) => ({ id: i.id, texto: i.texto, tipo: "idea" as const, fecha: i.eliminado_en })),
    ...((piezasR ?? []) as { id: string; titulo: string; eliminado_en: string }[]).map((p) => ({ id: p.id, texto: p.titulo, tipo: "pieza" as const, fecha: p.eliminado_en })),
    ...((frasesR ?? []) as { id: string; texto: string; eliminado_en: string }[]).map((f) => ({ id: f.id, texto: f.texto.split("\n")[0] ?? "", tipo: "frase" as const, fecha: f.eliminado_en })),
    ...((recursosR ?? []) as { id: string; texto: string; titulo: string; eliminado_en: string }[]).map((r) => ({ id: r.id, texto: r.titulo || r.texto, tipo: "recurso" as const, fecha: r.eliminado_en })),
  ];

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-semibold">Papelera</h2>
        <p className="mt-1 text-sm text-tinta-suave">
          Nada se borra al momento: queda aquí y puedes devolverlo. Vaciar la papelera sí borra de verdad.
        </p>
      </div>
      {elementos.length === 0 ? (
        <p className="rounded-tarjeta bg-fondo-suave px-4 py-5 text-sm text-tinta-suave">La papelera está vacía.</p>
      ) : (
        <>
          <ul className="overflow-hidden rounded-tarjeta border border-borde">
            {elementos.map((elemento) => (
              <li key={`${elemento.tipo}-${elemento.id}`} className="flex flex-wrap items-center justify-between gap-2 border-b border-borde px-4 py-3 last:border-b-0">
                <div className="min-w-0">
                  <p className="truncate text-sm">{elemento.texto}</p>
                  <p className="text-xs text-tinta-suave">
                    {elemento.tipo === "idea" ? "Idea" : elemento.tipo === "pieza" ? "Pieza" : elemento.tipo === "frase" ? "Frase" : "Recurso"}
                    {elemento.fecha && ` · ${formatearFecha(elemento.fecha.slice(0, 10))}`}
                  </p>
                </div>
                <form action={restaurarDeLaPapelera.bind(null, elemento.tipo, elemento.id)}>
                  <button type="submit" className={botonDiscreto}>
                    Restaurar
                  </button>
                </form>
              </li>
            ))}
          </ul>
          <form action={vaciarPapelera}>
            <button type="submit" className={botonDiscreto}>
              Vaciar la papelera ({elementos.length})
            </button>
          </form>
        </>
      )}
    </section>
  );
}
