import Link from "next/link";
import type { Oferta } from "@/features/ofertas/esquemas";
import { Etiqueta } from "@/shared/components/etiquetas";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { ETIQUETA_PROGRAMACION, ETIQUETA_TIPO_SECUENCIA, type Secuencia } from "./esquemas";
import { FormularioDesdePlantilla, FormularioNuevaSecuencia } from "./formularios-secuencia";

type PasoConPieza = {
  secuencia_id: string;
  piezas: { estado: string } | { estado: string }[] | null;
};

function estadoDePaso(paso: PasoConPieza): string | null {
  const pieza = Array.isArray(paso.piezas) ? paso.piezas[0] : paso.piezas;
  return pieza?.estado ?? null;
}

export async function Secuencias() {
  const supabase = await crearClienteServidor();
  const [{ data: secuenciasR }, { data: pasosR }, { data: ofertasR }, { data: plantillasR }] = await Promise.all([
    supabase.from("secuencias_email").select("*").order("created_at", { ascending: false }),
    supabase.from("secuencia_pasos").select("secuencia_id,piezas(estado)"),
    supabase.from("ofertas").select("id,nombre,archivada").order("nombre"),
    supabase.from("plantillas").select("id,nombre,descripcion").eq("tipo", "secuencia_email").order("created_at", { ascending: false }),
  ]);
  const secuencias = (secuenciasR ?? []) as Secuencia[];
  const pasos = (pasosR ?? []) as PasoConPieza[];
  const ofertas = (ofertasR ?? []) as Oferta[];
  const plantillas = (plantillasR ?? []) as { id: string; nombre: string; descripcion: string }[];
  const ofertaPorId = new Map(ofertas.map((o) => [o.id, o]));
  const datos = secuencias.map((secuencia) => {
    const suyos = pasos.filter((p) => p.secuencia_id === secuencia.id);
    const porEscribir = suyos.filter((p) => ["borrador"].includes(estadoDePaso(p) ?? "")).length;
    return { secuencia, total: suyos.length, porEscribir };
  });

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-tinta-suave">Secuencias de bienvenida, lanzamiento, poscompra o upsell. Sus pasos son los mismos correos que ves en la biblioteca.</p>
        <details className="rounded-tarjeta border border-borde p-4">
          <summary className="cursor-pointer font-medium text-verde-700">+ Nueva secuencia</summary>
          <div className="mt-4"><FormularioNuevaSecuencia ofertas={ofertas.map((o) => ({ id: o.id, nombre: o.archivada ? `${o.nombre} (archivada)` : o.nombre }))} /></div>
        </details>
        <FormularioDesdePlantilla plantillas={plantillas} />
      </div>

      {datos.length === 0 ? (
        <p className="rounded-tarjeta bg-acento-suave p-6 text-center text-tinta-suave">Todavía no hay secuencias. Crea la primera o parte de una plantilla.</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {datos.map(({ secuencia, total, porEscribir }) => {
            const oferta = secuencia.oferta_id ? ofertaPorId.get(secuencia.oferta_id) : undefined;
            return (
              <li key={secuencia.id}>
                <Link href={`/email/secuencias/${secuencia.id}`} className="block h-full rounded-tarjeta border border-borde p-4 hover:bg-verde-50">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="font-semibold">{secuencia.nombre}</h2>
                    <Etiqueta>{ETIQUETA_TIPO_SECUENCIA[secuencia.tipo]}</Etiqueta>
                  </div>
                  <p className="mt-1 text-sm text-tinta-suave">
                    {total} {total === 1 ? "correo" : "correos"}
                    {porEscribir > 0 ? ` · ${porEscribir} por escribir` : " · todo escrito"}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Etiqueta tono="gris">{ETIQUETA_PROGRAMACION[secuencia.programacion]}</Etiqueta>
                    {oferta && <Etiqueta tono="neutro">{oferta.nombre}</Etiqueta>}
                  </div>
                  {secuencia.objetivo && <p className="mt-2 line-clamp-2 text-sm">{secuencia.objetivo}</p>}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
