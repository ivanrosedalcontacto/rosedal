import Link from "next/link";
import { FormularioSesion } from "@/features/grabacion/formularios";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";

type Sesion = { id: string; nombre: string; fecha: string | null };

export default async function Grabacion() {
  const supabase = await crearClienteServidor();
  const [{ data: sesionesR }, { data: piezasR }, { data: versionesR }, { data: relacionesR }] = await Promise.all([
    supabase.from("sesiones_grabacion").select("id,nombre,fecha").order("fecha", { ascending: true, nullsFirst: false }),
    supabase.from("piezas").select("id,titulo,formato,duracion_seg,grabado,estado").is("eliminado_en", null).eq("grabado", false).neq("estado", "publicado"),
    supabase.from("pieza_versiones").select("pieza_id,gancho,desarrollo,cierre").eq("tipo", "guion").eq("elegida", true),
    supabase.from("sesion_piezas").select("sesion_id,pieza_id"),
  ]);
  const conGuion = new Set((versionesR ?? []).filter((x) => Boolean(x.gancho || x.desarrollo || x.cierre)).map((x) => x.pieza_id));
  const piezas = (piezasR ?? []).filter((p) => conGuion.has(p.id));
  const relaciones = relacionesR ?? [];
  const sesiones = (sesionesR ?? []) as Sesion[];
  return <div className="mx-auto flex max-w-[1000px] flex-col gap-8 px-4 py-8 md:px-10 md:py-12">
    <div><h1 className="font-serif text-2xl md:text-[28px]">Grabación</h1><p className="mt-2 text-tinta-suave">Reúne los guiones que quieres grabar y sigue el orden junto a la cámara.</p></div>
    <details className="rounded-tarjeta border border-borde p-4"><summary className="cursor-pointer font-medium">+ Crear día de grabación</summary><div className="mt-4"><FormularioSesion piezas={piezas} /></div></details>
    <section><h2 className="text-xl font-semibold">Tus sesiones</h2>{sesiones.length === 0 ? <p className="mt-3 rounded-tarjeta bg-verde-50 p-5 text-tinta-suave">Todavía no tienes días de grabación.</p> : <ul className="mt-3 grid gap-3 sm:grid-cols-2">{sesiones.map((s) => { const numero = relaciones.filter((r) => r.sesion_id === s.id).length; return <li key={s.id}><Link href={`/grabacion/${s.id}`} className="block rounded-tarjeta border border-borde p-4 hover:bg-verde-50"><h3 className="font-semibold">{s.nombre}</h3><p className="mt-1 text-sm text-tinta-suave">{s.fecha ?? "Sin fecha"} · {numero} {numero === 1 ? "pieza" : "piezas"}</p></Link></li>; })}</ul>}</section>
  </div>;
}
