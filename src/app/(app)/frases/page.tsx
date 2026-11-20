import { PestanasFiltros } from "@/shared/components/pestanas-filtros";
import { ElegirFrase, FormularioFrase, TarjetaFrase } from "@/features/frases/banco-frases";
import type { Frase, FraseVista, UsoFrase } from "@/features/frases/esquemas";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";

type Parametros = Record<string, string | string[] | undefined>;

function valor(p: Parametros, clave: string) {
  return typeof p[clave] === "string" ? p[clave] : "";
}

export default async function Frases({ searchParams }: { searchParams: Promise<Parametros> }) {
  const sp = await searchParams;
  const filtro = ["todas", "sin_usar", "usadas", "favoritas"].includes(valor(sp, "filtro")) ? valor(sp, "filtro") : "todas";
  const supabase = await crearClienteServidor();
  const consulta = supabase.from("frases").select("*").is("eliminado_en", null).eq("archivada", false).order("created_at", { ascending: false });
  const [{ data: frasesR }, { data: usosR }, { data: reelsR }] = await Promise.all([
    consulta,
    supabase.from("frase_usos").select("id,frase_id,pieza_id,fecha,url,texto_usado").order("fecha", { ascending: false }),
    supabase.from("piezas").select("id,frase_id,fecha_prevista,estado").eq("formato", "reel_prueba").is("eliminado_en", null).neq("estado", "publicado"),
  ]);
  const frases = (frasesR ?? []) as Frase[];
  const usos = (usosR ?? []) as UsoFrase[];
  const reels = (reelsR ?? []) as { id: string; frase_id: string | null; fecha_prevista: string | null }[];
  const porUso = new Map<string, UsoFrase[]>();
  for (const uso of usos) porUso.set(uso.frase_id, [...(porUso.get(uso.frase_id) ?? []), uso]);
  const porReel = new Map<string, { id: string; fecha_prevista: string | null }[]>();
  for (const reel of reels) if (reel.frase_id) porReel.set(reel.frase_id, [...(porReel.get(reel.frase_id) ?? []), { id: reel.id, fecha_prevista: reel.fecha_prevista }]);
  const origenes = new Map(frases.map((f) => [f.id, f.texto]));
  const vistas: FraseVista[] = frases.map((frase) => ({
    ...frase,
    usos: porUso.get(frase.id) ?? [],
    reelsPrevistos: porReel.get(frase.id) ?? [],
    variantes: frases.filter((x) => x.frase_origen_id === frase.id).length,
    origenTexto: frase.frase_origen_id ? origenes.get(frase.frase_origen_id) ?? null : null,
  })).filter((frase) => filtro === "todas" || (filtro === "sin_usar" && frase.usos.length === 0) || (filtro === "usadas" && frase.usos.length > 0) || (filtro === "favoritas" && frase.favorita));

  return <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-8 md:px-10 md:py-12">
    <div><h1 className="font-serif text-2xl md:text-[28px]">Frases</h1><p className="mt-2 text-tinta-suave">Frases para B-roll: entra, copia una y sigue con tu día.</p></div>
    <details className="rounded-tarjeta border border-borde bg-fondo-suave p-4"><summary className="cursor-pointer font-medium">+ Frase</summary><div className="mt-4"><FormularioFrase /></div></details>
    <PestanasFiltros activos={filtro === "todas" ? 0 : 1} total={vistas.length} limpiar="/frases" filtros={<form className="flex flex-col gap-3 rounded-tarjeta border border-borde bg-fondo-suave p-4 sm:flex-row sm:items-end">
      <label className="text-sm font-medium sm:min-w-[240px]">Mostrar<select name="filtro" defaultValue={filtro} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2"><option value="todas">Todas</option><option value="sin_usar">Sin usar</option><option value="usadas">Ya utilizadas</option><option value="favoritas">Favoritas</option></select></label>
      <button className="rounded-boton bg-verde-700 px-4 py-2 text-sm font-medium text-white">Aplicar</button>
    </form>}>
      <div className="flex flex-col gap-6">
        <ElegirFrase frases={vistas} />
        {vistas.length === 0 ? <p className="rounded-tarjeta bg-verde-50 p-6 text-center text-tinta-suave">{filtro === "todas" ? "No hay frases aquí todavía. Guarda la primera desde «+ Frase»." : "Ninguna frase cumple este filtro."}</p> : <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{vistas.map((frase) => <TarjetaFrase key={frase.id} frase={frase} />)}</section>}
      </div>
    </PestanasFiltros>
  </div>;
}
