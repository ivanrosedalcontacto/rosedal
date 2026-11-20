import Link from "next/link";
import { CambiarFecha } from "@/features/calendario/cambiar-fecha";
import { ETIQUETA_ESTADO, ETIQUETA_FINALIDAD, ETIQUETA_FORMATO, faltaCta, type EstadoPieza, type Finalidad, type FormatoPieza } from "@/features/piezas/esquemas";
import { Etiqueta } from "@/shared/components/etiquetas";
import { formatearFecha, hoyMadrid, lunesDe, sumarDias } from "@/shared/lib/fechas";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { PublicarAhora } from "./publicar-ahora";

type PiezaHoy = {
  id: string;
  titulo: string;
  formato: string;
  estado: string;
  finalidad: Finalidad | null;
  fecha_prevista: string | null;
  fecha_real: string | null;
  oferta_id: string | null;
  cta_accion: string | null;
  cta_como: string | null;
  url_publicada: string | null;
  grabado: boolean;
  retomar_el: string | null;
};

const CAMPOS_PIEZA =
  "id,titulo,formato,estado,finalidad,fecha_prevista,fecha_real,oferta_id,cta_accion,cta_como,url_publicada,grabado,retomar_el";

/** Formatos que se graban: para ellos «sin grabar» es una falta real. */
const SE_GRABAN = ["reel", "reel_prueba"];

/** Formatos con guion propio: el correo y las stories llevan su texto en otro sitio. */
const TIENEN_GUION = ["reel", "reel_prueba", "carrusel", "post", "otro"];

export async function Hoy() {
  const hoy = hoyMadrid();
  const dentroDeSiete = sumarDias(hoy, 7);
  const supabase = await crearClienteServidor();

  const [
    { data: piezasR },
    { data: versionesR },
    { data: hitosR },
    { data: lanzamientosR },
    { data: fasesR },
    { data: ideasR },
    { data: frasesR },
    { data: usosR },
    { data: ajustesR },
  ] = await Promise.all([
    supabase.from("piezas").select(CAMPOS_PIEZA).is("eliminado_en", null),
    supabase.from("pieza_versiones").select("pieza_id,tipo,gancho,desarrollo").eq("tipo", "guion"),
    supabase.from("lanzamiento_hitos").select("id,titulo,fecha,hecho,lanzamiento_id,fase_id").eq("hecho", false).gte("fecha", hoy).order("fecha"),
    supabase.from("lanzamientos").select("id,nombre"),
    supabase.from("lanzamiento_fases").select("id,nombre,tipo,fecha_inicio,fecha_fin,lanzamiento_id"),
    supabase.from("ideas").select("id,pilar_id,oferta_id,tema").is("eliminado_en", null).eq("estado", "pendiente"),
    supabase.from("frases").select("id").is("eliminado_en", null).eq("archivada", false),
    supabase.from("frase_usos").select("id,frase_id"),
    supabase.from("ajustes").select("ritmo_semanal").maybeSingle(),
  ]);

  const piezas = (piezasR ?? []) as PiezaHoy[];
  const guionPorPieza = new Set(
    (versionesR ?? []).filter((v) => (v.gancho as string) || (v.desarrollo as string)).map((v) => v.pieza_id as string),
  );
  const nombreLanzamiento = new Map(((lanzamientosR ?? []) as { id: string; nombre: string }[]).map((l) => [l.id, l.nombre]));
  const fases = (fasesR ?? []) as {
    id: string;
    nombre: string;
    tipo: string;
    fecha_inicio: string | null;
    fecha_fin: string | null;
    lanzamiento_id: string;
  }[];

  const paraHoy = piezas
    .filter((p) => p.estado !== "publicado" && p.fecha_prevista === hoy)
    .sort((a, b) => a.titulo.localeCompare(b.titulo));
  const atrasadas = piezas
    .filter((p) => p.estado !== "publicado" && p.fecha_prevista !== null && p.fecha_prevista < hoy)
    .sort((a, b) => (b.fecha_prevista ?? "").localeCompare(a.fecha_prevista ?? ""));
  const preparar = piezas
    .filter(
      (p) =>
        ["borrador"].includes(p.estado) &&
        p.fecha_prevista !== null &&
        p.fecha_prevista >= hoy &&
        p.fecha_prevista <= dentroDeSiete,
    )
    .sort((a, b) => (a.fecha_prevista ?? "").localeCompare(b.fecha_prevista ?? ""));
  const paraRetomar = piezas.filter((p) => p.retomar_el !== null && p.retomar_el <= hoy && p.estado !== "publicado");

  const hito = ((hitosR ?? []) as { id: string; titulo: string; fecha: string; lanzamiento_id: string; fase_id: string | null }[])[0];
  const faseDelHito = hito?.fase_id ? fases.find((f) => f.id === hito.fase_id) : undefined;
  const faseEnCurso = hito
    ? fases.find((f) => f.lanzamiento_id === hito.lanzamiento_id && f.fecha_inicio && f.fecha_fin && f.fecha_inicio <= hoy && f.fecha_fin >= hoy)
    : undefined;

  const ideasSinClasificar = ((ideasR ?? []) as { id: string; pilar_id: string | null; oferta_id: string | null; tema: string | null }[]).filter(
    (i) => !i.pilar_id && !i.oferta_id && !i.tema,
  ).length;
  const frasesConUso = new Set(((usosR ?? []) as { frase_id: string }[]).map((u) => u.frase_id));
  const frasesSinUsar = ((frasesR ?? []) as { id: string }[]).filter((f) => !frasesConUso.has(f.id)).length;

  // Ritmo semanal (B2): solo si la usuaria lo ha puesto.
  const ritmo = (ajustesR?.ritmo_semanal as { reels: number; correos: number; posts: number } | null) ?? null;
  const lunes = lunesDe(hoy);
  const domingo = sumarDias(lunes, 6);
  const deEstaSemana = piezas.filter(
    (p) => p.fecha_prevista && p.fecha_prevista >= lunes && p.fecha_prevista <= domingo && p.estado !== "borrador",
  );
  const cuentaReels = deEstaSemana.filter((p) => ["reel", "reel_prueba"].includes(p.formato)).length;
  const cuentaCorreos = deEstaSemana.filter((p) => p.formato === "email").length;
  const cuentaPosts = deEstaSemana.filter((p) => ["post", "carrusel"].includes(p.formato)).length;
  const hayRitmo = Boolean(ritmo && (ritmo.reels > 0 || ritmo.correos > 0 || ritmo.posts > 0));

  const diasProximos = Array.from({ length: 14 }, (_, i) => sumarDias(hoy, i + 1));

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Hoy publico o envío</h2>
        {paraHoy.length === 0 && atrasadas.length === 0 ? (
          <p className="rounded-tarjeta bg-acento-suave px-4 py-6 text-tinta-suave">Hoy no tienes nada previsto.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {paraHoy.map((pieza) => (
              <li key={pieza.id} className="flex flex-wrap items-center justify-between gap-2 rounded-tarjeta border border-borde p-3">
                <div className="min-w-0">
                  <Link href={`/piezas/${pieza.id}`} className="font-medium hover:text-verde-700">
                    {pieza.titulo}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Etiqueta tono="gris">{ETIQUETA_FORMATO[pieza.formato as FormatoPieza] ?? pieza.formato}</Etiqueta>
                    {pieza.finalidad && <Etiqueta>{ETIQUETA_FINALIDAD[pieza.finalidad as Finalidad]}</Etiqueta>}
                    <Etiqueta tono="neutro">{ETIQUETA_ESTADO[pieza.estado as EstadoPieza] ?? pieza.estado}</Etiqueta>
                  </div>
                </div>
                <PublicarAhora piezaId={pieza.id} esCorreo={pieza.formato === "email"} fechaPorDefecto={hoy} />
              </li>
            ))}
            {atrasadas.map((pieza) => (
              <li key={pieza.id} className="flex flex-wrap items-center justify-between gap-2 rounded-tarjeta border border-borde bg-aviso-fondo/40 p-3">
                <div className="min-w-0">
                  <Link href={`/piezas/${pieza.id}`} className="font-medium hover:text-verde-700">
                    {pieza.titulo}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Etiqueta tono="aviso">Atrasada desde {pieza.fecha_prevista ? formatearFecha(pieza.fecha_prevista) : ""}</Etiqueta>
                    <Etiqueta tono="gris">{ETIQUETA_FORMATO[pieza.formato as FormatoPieza] ?? pieza.formato}</Etiqueta>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <PublicarAhora piezaId={pieza.id} esCorreo={pieza.formato === "email"} fechaPorDefecto={hoy} />
                  <div className="w-[170px]">
                    <CambiarFecha piezaId={pieza.id} fechaActual={pieza.fecha_prevista} dias={diasProximos} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {(paraHoy.length > 5 || atrasadas.length > 5) && (
          <Link href="/calendario" className="text-sm text-verde-700">
            Ver todo en el calendario
          </Link>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Tengo que preparar</h2>
        {preparar.length === 0 && paraRetomar.length === 0 ? (
          <p className="rounded-tarjeta bg-acento-suave px-4 py-6 text-tinta-suave">No hay nada vencido en los próximos siete días.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {preparar.map((pieza) => {
              const faltas: string[] = [];
              if (TIENEN_GUION.includes(pieza.formato) && !guionPorPieza.has(pieza.id)) faltas.push("Sin guion");
              if (faltaCta(pieza)) faltas.push("Falta la llamada a la acción");
              if (SE_GRABAN.includes(pieza.formato) && pieza.estado === "borrador") faltas.push("Sin grabar");
              return (
                <li key={pieza.id} className="flex flex-wrap items-center justify-between gap-2 rounded-tarjeta border border-borde p-3">
                  <div className="min-w-0">
                    <Link href={`/piezas/${pieza.id}`} className="font-medium hover:text-verde-700">
                      {pieza.titulo}
                    </Link>
                    <p className="mt-1 text-xs text-tinta-suave">
                      {pieza.fecha_prevista ? formatearFecha(pieza.fecha_prevista) : "Sin fecha"}
                      {faltas.length > 0 && ` · ${faltas.join(" · ")}`}
                    </p>
                  </div>
                  <Etiqueta tono="neutro">{ETIQUETA_ESTADO[pieza.estado as EstadoPieza] ?? pieza.estado}</Etiqueta>
                </li>
              );
            })}
            {paraRetomar.map((pieza) => (
              <li key={pieza.id} className="flex flex-wrap items-center justify-between gap-2 rounded-tarjeta border border-borde p-3">
                <Link href={`/piezas/${pieza.id}`} className="font-medium hover:text-verde-700">
                  {pieza.titulo}
                </Link>
                <Etiqueta tono="aviso">Marcada para retomar</Etiqueta>
              </li>
            ))}
          </ul>
        )}
        {preparar.length > 5 && (
          <Link href="/calendario" className="text-sm text-verde-700">
            Ver todo en el calendario
          </Link>
        )}
      </section>

      {hayRitmo && ritmo && (
        <section className="flex flex-wrap gap-4 rounded-tarjeta bg-fondo-suave px-4 py-3 text-sm">
          {ritmo.reels > 0 && (
            <p>
              Reels: <strong>{cuentaReels}</strong> de {ritmo.reels}
            </p>
          )}
          {ritmo.correos > 0 && (
            <p>
              Correos: <strong>{cuentaCorreos}</strong> de {ritmo.correos}
            </p>
          )}
          {ritmo.posts > 0 && (
            <p>
              Publicaciones: <strong>{cuentaPosts}</strong> de {ritmo.posts}
            </p>
          )}
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Próximo hito</h2>
        {!hito ? (
          <p className="rounded-tarjeta bg-acento-suave px-4 py-6 text-tinta-suave">
            No hay hitos a la vista. <Link href="/lanzamientos" className="text-verde-700">Mira tus lanzamientos</Link>.
          </p>
        ) : (
          <div className="rounded-tarjeta border border-borde p-4">
            <p className="font-medium">
              <Link href={`/lanzamientos/${hito.lanzamiento_id}`} className="hover:text-verde-700">
                {nombreLanzamiento.get(hito.lanzamiento_id) ?? "Lanzamiento"}
              </Link>
            </p>
            {(faseEnCurso ?? faseDelHito) && (
              <p className="mt-1 text-sm text-tinta-suave">
                {(faseEnCurso ?? faseDelHito)?.nombre}
                {faseEnCurso ? " · fase en curso" : ""}
              </p>
            )}
            <p className="mt-2">
              {hito.titulo} · {formatearFecha(hito.fecha)}
            </p>
            <p className="text-sm text-tinta-suave">
              {faltanDias(hoy, hito.fecha) === 0 ? "es hoy" : `faltan ${faltanDias(hoy, hito.fecha)} días`}
            </p>
          </div>
        )}
      </section>

      <section className="flex flex-wrap gap-4 border-t border-borde pt-4 text-sm">
        <Link href="/ideas?vista=bandeja" className="text-verde-700">
          {ideasSinClasificar} {ideasSinClasificar === 1 ? "idea sin clasificar" : "ideas sin clasificar"}
        </Link>
        <Link href="/frases" className="text-verde-700">
          {frasesSinUsar} {frasesSinUsar === 1 ? "frase sin usar" : "frases sin usar"}
        </Link>
      </section>
    </div>
  );
}

/** Días que faltan entre hoy y la fecha dada. */
function faltanDias(hoy: string, fecha: string): number {
  const a = Date.parse(`${hoy}T00:00:00Z`);
  const b = Date.parse(`${fecha}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}
