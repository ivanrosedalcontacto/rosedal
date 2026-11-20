import Link from "next/link";
import { crearDerivada } from "@/features/piezas/acciones";
import { ETIQUETA_FINALIDAD, ETIQUETA_FORMATO, type Finalidad, type FormatoPieza } from "@/features/piezas/esquemas";
import { PublicarAhora } from "@/features/hoy/publicar-ahora";
import { CambiarFecha } from "@/features/calendario/cambiar-fecha";
import { Etiqueta } from "@/shared/components/etiquetas";
import { BotonCopiar } from "@/shared/components/boton-copiar";
import { botonDiscreto } from "@/shared/components/estilos";
import { formatearFecha, lunesDe, sumarDias } from "@/shared/lib/fechas";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { resumenCopiable } from "@/features/mejoras/resumen";
import { FormularioAprendizaje, FormularioMetricas, FormularioRetomar } from "./formularios";
import { ETIQUETA_METRICA, ETIQUETA_ATRIBUCION, type MetricaPieza } from "./esquemas";

type Parametros = Record<string, string | string[] | undefined>;

type PiezaRevision = {
  id: string;
  titulo: string;
  formato: string;
  estado: string;
  finalidad: string | null;
  fecha_prevista: string | null;
  fecha_real: string | null;
  url_publicada: string | null;
  aprendizaje: string | null;
  retomar_el: string | null;
  nota_retomar: string | null;
};

const CAMPOS = "id,titulo,formato,estado,finalidad,fecha_prevista,fecha_real,url_publicada,aprendizaje,retomar_el,nota_retomar";

function tituloSemana(inicio: string, fin: string): string {
  const dia = new Intl.DateTimeFormat("es-ES", { day: "numeric", timeZone: "UTC" });
  const mes = new Intl.DateTimeFormat("es-ES", { month: "long", timeZone: "UTC" });
  const m1 = mes.format(new Date(`${inicio}T00:00:00Z`));
  const m2 = mes.format(new Date(`${fin}T00:00:00Z`));
  if (m1 === m2) return `Semana del ${dia.format(new Date(`${inicio}T00:00:00Z`))} al ${dia.format(new Date(`${fin}T00:00:00Z`))} de ${m1}`;
  return `Semana del ${dia.format(new Date(`${inicio}T00:00:00Z`))} de ${m1} al ${dia.format(new Date(`${fin}T00:00:00Z`))} de ${m2}`;
}

export async function Revision({ sp }: { sp: Parametros }) {
  const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
  const pedida = typeof sp.semana === "string" ? sp.semana : "";
  const inicio = lunesDe(/^\d{4}-\d{2}-\d{2}$/.test(pedida) ? pedida : hoy);
  const fin = sumarDias(inicio, 6);
  const supabase = await crearClienteServidor();

  const [{ data: piezasR }, { data: metricasR }] = await Promise.all([
    supabase.from("piezas").select(CAMPOS).is("eliminado_en", null),
    supabase.from("pieza_metricas").select("id,pieza_id,clave,valor,atribucion"),
  ]);

  const piezas = (piezasR ?? []) as PiezaRevision[];
  const metricas = (metricasR ?? []) as MetricaPieza[];
  const metricasPorPieza = new Map<string, MetricaPieza[]>();
  for (const m of metricas) {
    metricasPorPieza.set(m.pieza_id, [...(metricasPorPieza.get(m.pieza_id) ?? []), m]);
  }

  const salidas = piezas
    .filter((p) => p.fecha_real && p.fecha_real >= inicio && p.fecha_real <= fin)
    .sort((a, b) => (a.fecha_real ?? "").localeCompare(b.fecha_real ?? ""));
  const noSalidas = piezas
    .filter((p) => p.estado !== "publicado" && p.fecha_prevista && p.fecha_prevista >= inicio && p.fecha_prevista <= fin)
    .sort((a, b) => (a.fecha_prevista ?? "").localeCompare(b.fecha_prevista ?? ""));
  const arrastre = piezas.filter((p) => {
    if (!p.fecha_real || p.fecha_real >= inicio) return false;
    const suyas = metricasPorPieza.get(p.id) ?? [];
    return suyas.some((m) => m.valor === null);
  });

  const pendientesDeDatos = salidas.filter((p) =>
    (metricasPorPieza.get(p.id) ?? []).some((m) => m.valor === null),
  ).length;

  const dias = Array.from({ length: 7 }, (_, i) => sumarDias(inicio, i));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-tarjeta bg-fondo-suave px-4 py-2">
        <Link href={`/revision?semana=${sumarDias(inicio, -7)}`} className="text-verde-700">
          ← Semana anterior
        </Link>
        <p className="font-medium">{tituloSemana(inicio, fin)}</p>
        <Link href={`/revision?semana=${sumarDias(inicio, 7)}`} className="text-verde-700">
          Semana siguiente →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <p className="rounded-tarjeta border border-borde p-3 text-sm">
          <strong>{salidas.length}</strong> {salidas.length === 1 ? "pieza salió" : "piezas salieron"}
        </p>
        <p className="rounded-tarjeta border border-borde p-3 text-sm">
          <strong>{noSalidas.length}</strong> {noSalidas.length === 1 ? "prevista no salió" : "previstas no salieron"}
        </p>
        <p className="rounded-tarjeta border border-borde p-3 text-sm">
          <strong>{pendientesDeDatos}</strong> {pendientesDeDatos === 1 ? "pieza con datos pendientes" : "piezas con datos pendientes"}
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Lo que salió</h2>
          <BotonCopiar texto={resumenCopiable(salidas.map((p) => ({ titulo: p.titulo, formato: p.formato, fecha_real: p.fecha_real, metricas: metricasPorPieza.get(p.id) ?? [] })))} etiqueta="Copiar resumen" />
        </div>
        {salidas.length === 0 ? (
          <p className="rounded-tarjeta bg-acento-suave px-4 py-6 text-tinta-suave">Esta semana no salió ninguna pieza.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {salidas.map((pieza) => {
              const suyas = metricasPorPieza.get(pieza.id) ?? [];
              const previstaDistinta = pieza.fecha_prevista && pieza.fecha_prevista !== pieza.fecha_real;
              return (
                <li key={pieza.id} className="rounded-tarjeta border border-borde p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link href={`/piezas/${pieza.id}`} className="font-semibold hover:text-verde-700">
                        {pieza.titulo}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <Etiqueta tono="gris">{ETIQUETA_FORMATO[pieza.formato as FormatoPieza] ?? pieza.formato}</Etiqueta>
                        {pieza.finalidad && <Etiqueta>{ETIQUETA_FINALIDAD[pieza.finalidad as Finalidad]}</Etiqueta>}
                        <Etiqueta tono="verde">Publicada el {pieza.fecha_real ? formatearFecha(pieza.fecha_real) : ""}</Etiqueta>
                        {previstaDistinta && (
                          <Etiqueta tono="gris">Prevista: {pieza.fecha_prevista ? formatearFecha(pieza.fecha_prevista) : ""}</Etiqueta>
                        )}
                      </div>
                      {pieza.url_publicada && (
                        <a href={pieza.url_publicada} className="mt-1 block text-sm text-verde-700">
                          Ver la publicación
                        </a>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <form action={crearDerivada.bind(null, pieza.id, "adaptacion")}>
                        <button className={botonDiscreto}>Crear adaptación</button>
                      </form>
                      <form action={crearDerivada.bind(null, pieza.id, "reutilizacion")}>
                        <button className={botonDiscreto}>Reutilizar</button>
                      </form>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <h3 className="text-sm font-semibold">Métricas</h3>
                      <FormularioMetricas
                        piezaId={pieza.id}
                        metricas={suyas}
                        finalidad={pieza.finalidad}
                        esCorreo={pieza.formato === "email"}
                      />
                      {suyas.length > 0 && (
                        <p className="text-xs text-tinta-suave">
                          {suyas.filter((m) => m.valor === null).length === 0 ? "Todas registradas." : "Pendiente: " + suyas.filter((m) => m.valor === null).map((m) => ETIQUETA_METRICA[m.clave] ?? m.clave).join(", ")}
                          {suyas.some((m) => m.atribucion) &&
                            ` · ${suyas.filter((m) => m.atribucion).map((m) => `${ETIQUETA_METRICA[m.clave] ?? m.clave}: ${ETIQUETA_ATRIBUCION[m.atribucion ?? ""] ?? ""}`).join(" · ")}`}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-3">
                      <div>
                        <h3 className="text-sm font-semibold">Qué aprendiste</h3>
                        <FormularioAprendizaje piezaId={pieza.id} aprendizaje={pieza.aprendizaje} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">Retomar el…</h3>
                        <FormularioRetomar piezaId={pieza.id} retomarEl={pieza.retomar_el} nota={pieza.nota_retomar} />
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Lo que no salió</h2>
        {noSalidas.length === 0 ? (
          <p className="rounded-tarjeta bg-acento-suave px-4 py-6 text-tinta-suave">Todo lo previsto para esta semana salió.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {noSalidas.map((pieza) => (
              <li key={pieza.id} className="flex flex-wrap items-center justify-between gap-2 rounded-tarjeta border border-borde p-3">
                <div className="min-w-0">
                  <Link href={`/piezas/${pieza.id}`} className="font-medium hover:text-verde-700">
                    {pieza.titulo}
                  </Link>
                  <p className="mt-1 text-xs text-tinta-suave">
                    Prevista: {pieza.fecha_prevista ? formatearFecha(pieza.fecha_prevista) : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="w-[170px]">
                    <CambiarFecha piezaId={pieza.id} fechaActual={pieza.fecha_prevista} dias={dias} />
                  </div>
                  <PublicarAhora piezaId={pieza.id} esCorreo={pieza.formato === "email"} fechaPorDefecto={pieza.fecha_prevista ?? hoy} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Datos que arrastro</h2>
        {arrastre.length === 0 ? (
          <p className="rounded-tarjeta bg-acento-suave px-4 py-6 text-tinta-suave">No queda ninguna métrica sin registrar.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {arrastre.map((pieza) => (
              <li key={pieza.id} className="rounded-tarjeta border border-borde p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={`/piezas/${pieza.id}`} className="font-medium hover:text-verde-700">
                      {pieza.titulo}
                    </Link>
                    <p className="mt-1 text-xs text-tinta-suave">
                      Publicada el {pieza.fecha_real ? formatearFecha(pieza.fecha_real) : ""} · sin registrar:{" "}
                      {(metricasPorPieza.get(pieza.id) ?? [])
                        .filter((m) => m.valor === null)
                        .map((m) => ETIQUETA_METRICA[m.clave] ?? m.clave)
                        .join(", ")}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <FormularioMetricas
                    piezaId={pieza.id}
                    metricas={metricasPorPieza.get(pieza.id) ?? []}
                    finalidad={pieza.finalidad}
                    esCorreo={pieza.formato === "email"}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
