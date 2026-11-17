import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { alternarGrabadaEnSesion, alternarPreparadoEnSesion } from "@/features/stories/acciones";
import { botonPrincipal } from "@/shared/components/estilos";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";

type PiezaSesion = { id: string; titulo: string; plano: string | null; preparacion: string | null; duracion_seg: number | null; grabado: boolean };
type Version = { pieza_id: string; gancho: string; desarrollo: string; cierre: string };

function guion(v: Version | undefined) {
  if (!v) return "Sin guion elegido.";
  return [["Gancho", v.gancho], ["Desarrollo", v.desarrollo], ["Cierre", v.cierre]].filter(([, texto]) => texto).map(([titulo, texto]) => `${titulo}\n${texto}`).join("\n\n");
}

export default async function SesionGrabacion({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const supabase = await crearClienteServidor();
  const [{ data: sesion }, { data: relaciones }, { data: versiones }] = await Promise.all([
    supabase.from("sesiones_grabacion").select("id,nombre,fecha,notas").eq("id", id).maybeSingle(),
    supabase.from("sesion_piezas").select("pieza_id,orden,preparado,piezas(id,titulo,plano,preparacion,duracion_seg,grabado)").eq("sesion_id", id).order("orden"),
    supabase.from("pieza_versiones").select("pieza_id,gancho,desarrollo,cierre").eq("tipo", "guion").eq("elegida", true),
  ]);
  if (!sesion) notFound();
  const piezas = (relaciones ?? []).map((r) => r.piezas as unknown as PiezaSesion).filter(Boolean).sort((a, b) => Number(a.grabado) - Number(b.grabado));
  const preparados = new Set(
    ((relaciones ?? []) as { pieza_id: string; preparado: boolean }[]).filter((r) => r.preparado).map((r) => r.pieza_id),
  );
  const porVersion = new Map((versiones ?? []).map((v) => [v.pieza_id, v as Version]));
  const grabadas = piezas.filter((p) => p.grabado).length;
  const segundos = piezas.filter((p) => !p.grabado).reduce((total, p) => total + (p.duracion_seg ?? 0), 0);
  return <div className="mx-auto flex max-w-[760px] flex-col gap-6 px-4 py-8 md:py-12"><Link href="/grabacion" className="text-sm text-verde-700">← Grabación</Link><header><h1 className="font-serif text-2xl">{sesion.nombre}</h1><p className="mt-2 text-tinta-suave">{grabadas} de {piezas.length} grabados · quedan unos {Math.ceil(segundos / 60)} minutos</p>{sesion.notas && <p className="mt-2 whitespace-pre-wrap text-sm">{sesion.notas}</p>}</header>
    <section><h2 className="text-xl font-semibold">Qué necesito preparar</h2><ul className="mt-3 space-y-2">{piezas.filter((p) => p.preparacion).map((p) => <li key={p.id} className="rounded-tarjeta bg-fondo-suave p-3"><strong>{p.titulo}</strong><p className="whitespace-pre-wrap">{p.preparacion}</p></li>)}{!piezas.some((p) => p.preparacion) && <p className="text-tinta-suave">No has anotado preparativos todavía.</p>}</ul></section>
    <section className="flex flex-col gap-4">{piezas.map((p) => <article key={p.id} className={`rounded-tarjeta border border-borde p-4 ${p.grabado ? "opacity-60" : ""}`}><h2 className="text-lg font-semibold">{p.titulo}</h2><p className="mt-2 whitespace-pre-wrap text-sm">{guion(porVersion.get(p.id))}</p>{p.plano && <p className="mt-3 text-sm"><strong>Plano:</strong> {p.plano}</p>}<p className="mt-1 text-sm text-tinta-suave">{p.duracion_seg ? `${p.duracion_seg} segundos` : "Duración sin estimar"}</p><form className="mt-3" action={alternarGrabadaEnSesion.bind(null, id, p.id, !p.grabado)}><button className={botonPrincipal}>{p.grabado ? "Marcar como pendiente" : "Ya grabado"}</button></form><form className="mt-2" action={alternarPreparadoEnSesion.bind(null, id, p.id, !preparados.has(p.id))}><button className="text-sm text-tinta-suave">{preparados.has(p.id) ? "Quitar «preparado»" : "Marcar como preparado"}</button></form></article>)}</section>
  </div>;
}
