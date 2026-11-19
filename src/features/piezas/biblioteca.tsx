import Link from "next/link";
import type { Pilar } from "@/features/ajustes/esquemas";
import { EtiquetaPilar } from "@/shared/components/etiquetas";
import { hoyMadrid, sumarDias } from "@/shared/lib/fechas";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import { EtiquetasPieza } from "./etiquetas-piezas";
import { SelectorEstadoTablero } from "./controles-clientes";
import { CANALES_PIEZA, ESTADOS_GRABADOS, ESTADOS_PIEZA, ETIQUETA_CANAL, ETIQUETA_ESTADO, ETIQUETA_FINALIDAD, ETIQUETA_FORMATO, FINALIDADES, FORMATOS_PIEZA, faltaCta, type Pieza } from "./esquemas";

type Parametros = Record<string, string | string[] | undefined>;
const valor = (p: Parametros, clave: string) => (typeof p[clave] === "string" ? p[clave] : "");

export async function Biblioteca({ sp }: { sp: Parametros }) {
  const formato = valor(sp, "formato");
  const canal = valor(sp, "canal");
  const estado = valor(sp, "estado");
  const finalidad = valor(sp, "finalidad");
  const pilar = valor(sp, "pilar");
  const oferta = valor(sp, "oferta");
  const grabado = valor(sp, "grabado");
  const desde = valor(sp, "desde");
  const hasta = valor(sp, "hasta");
  const idea = valor(sp, "idea");
  const lanzamiento = valor(sp, "lanzamiento");
  const orden = ["recientes", "titulo", "fecha"].includes(valor(sp, "orden")) ? valor(sp, "orden") : "recientes";
  const vista = valor(sp, "vista") === "tablero" ? "tablero" : "lista";
  const q = valor(sp, "q").replace(/[\\,()%*"]/g, "").trim();
  const supabase = await crearClienteServidor();
  let consulta = supabase.from("piezas").select("*").is("eliminado_en", null);
  const { data: metricasR } = await supabase.from("pieza_metricas").select("pieza_id,valor");
  const metricasConValor = new Set(
    ((metricasR ?? []) as { pieza_id: string; valor: number | null }[])
      .filter((m) => (m.valor ?? 0) > 0)
      .map((m) => m.pieza_id),
  );
  if ((FORMATOS_PIEZA as readonly string[]).includes(formato)) consulta = consulta.eq("formato", formato);
  if ((CANALES_PIEZA as readonly string[]).includes(canal)) consulta = consulta.eq("canal", canal);
  if ((ESTADOS_PIEZA as readonly string[]).includes(estado)) consulta = consulta.eq("estado", estado);
  if ((FINALIDADES as readonly string[]).includes(finalidad)) consulta = consulta.eq("finalidad", finalidad);
  if (pilar) consulta = consulta.eq("pilar_id", pilar);
  if (oferta) consulta = consulta.eq("oferta_id", oferta);
  if (idea) consulta = consulta.eq("idea_id", idea);
  if (lanzamiento === "habitual") consulta = consulta.is("lanzamiento_id", null);
  else if (lanzamiento) consulta = consulta.eq("lanzamiento_id", lanzamiento);
  if (grabado === "si") consulta = consulta.in("estado", [...ESTADOS_GRABADOS]);
  if (grabado === "no") consulta = consulta.eq("estado", "borrador");
  if (/^\d{4}-\d{2}-\d{2}$/.test(desde)) consulta = consulta.gte("fecha_prevista", desde);
  if (/^\d{4}-\d{2}-\d{2}$/.test(hasta)) consulta = consulta.lte("fecha_prevista", hasta);
  if (q) consulta = consulta.or(`titulo.ilike.%${q}%,texto_publicacion.ilike.%${q}%,texto_en_pantalla.ilike.%${q}%,notas.ilike.%${q}%`);
  consulta = orden === "titulo" ? consulta.order("titulo") : orden === "fecha" ? consulta.order("fecha_prevista", { nullsFirst: false }) : consulta.order("created_at", { ascending: false });
  const [{ data: piezasR }, { data: pilaresR }, { data: ofertasR }, { data: lanzamientosR }, { data: ideasR }] = await Promise.all([
    consulta,
    supabase.from("pilares").select("id,nombre,color,archivado").order("orden"),
    supabase.from("ofertas").select("id,nombre,archivada").order("nombre"),
    supabase.from("lanzamientos").select("id,nombre,estado").order("fecha_inicio", { ascending: false, nullsFirst: false }),
    supabase.from("ideas").select("id,texto").is("eliminado_en", null).order("created_at", { ascending: false }).limit(100),
  ]);
  const piezas = (piezasR ?? []) as Pieza[];
  const pilares = new Map(((pilaresR ?? []) as Pilar[]).map((p) => [p.id, p]));
  const opcionesPilares = (pilaresR ?? []) as Pilar[];
  const opcionesOfertas = (ofertasR ?? []) as { id: string; nombre: string; archivada: boolean }[];
  const lanzamientos = new Map(((lanzamientosR ?? []) as { id: string; nombre: string }[]).map((l) => [l.id, l]));
  const opcionesLanzamientos = (lanzamientosR ?? []) as { id: string; nombre: string }[];
  const opcionesIdeas = (ideasR ?? []) as { id: string; texto: string }[];

  // «Para retomar» (B5): lo perenne y lo que dio buenos resultados hace tiempo.
  const paraRetomar = piezas.filter((p) => {
    if (p.perenne) return true;
    if (!metricasConValor.has(p.id)) return false;
    if (p.estado !== "publicado") return false;
    const fecha = p.fecha_real ?? p.fecha_prevista;
    if (!fecha) return false;
    return fecha < sumarDias(hoyMadrid(), -90);
  });

  const tarjetas = piezas.map((pieza) => {
    const pilar = pieza.pilar_id ? pilares.get(pieza.pilar_id) : undefined;
    const enLanzamiento = pieza.lanzamiento_id ? lanzamientos.get(pieza.lanzamiento_id) : undefined;
    return <Link key={pieza.id} href={`/piezas/${pieza.id}`} className="block rounded-tarjeta border border-borde bg-fondo p-3 transition hover:bg-verde-50">
      <h2 className="line-clamp-2 font-semibold">{pieza.titulo}</h2><div className="mt-2"><EtiquetasPieza formato={pieza.formato} estado={pieza.estado} finalidad={pieza.finalidad} /></div>
      {pilar && <EtiquetaPilar nombre={pilar.nombre} color={pilar.color} className="mt-2" />}
      {enLanzamiento && <p className="mt-2 text-xs text-tinta-suave">Lanzamiento: {enLanzamiento.nombre}</p>}
      {faltaCta(pieza) && ["editado", "publicado"].includes(pieza.estado) && <p className="mt-2 text-sm font-medium text-aviso">Falta la llamada a la acción</p>}
      <p className="mt-2 text-sm text-tinta-suave">{pieza.fecha_prevista ? `Prevista: ${pieza.fecha_prevista}` : "Sin fecha prevista"} · {ETIQUETA_CANAL[pieza.canal]}</p>
    </Link>;
  });
  return <section className="flex flex-col gap-5">
    <nav aria-label="Vista de biblioteca" className="flex gap-2"><Link href="/biblioteca" className={`rounded-full px-4 py-2 text-sm ${vista === "lista" ? "bg-verde-100 text-verde-700" : "border border-borde"}`}>Lista</Link><Link href="/biblioteca?vista=tablero" className={`rounded-full px-4 py-2 text-sm ${vista === "tablero" ? "bg-verde-100 text-verde-700" : "border border-borde"}`}>Tablero</Link></nav>
    <form className="grid gap-3 rounded-tarjeta border border-borde bg-fondo-suave p-4 sm:grid-cols-4">
      <input type="hidden" name="vista" value={vista} />
      <label className="text-sm font-medium sm:col-span-2">Buscar
        <input name="q" defaultValue={q} placeholder="Título, texto o notas" className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2" />
      </label>
      <label className="text-sm font-medium">Formato
        <select name="formato" defaultValue={formato} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2"><option value="">Todos</option>{FORMATOS_PIEZA.map((x) => <option key={x} value={x}>{ETIQUETA_FORMATO[x]}</option>)}</select>
      </label>
      <label className="text-sm font-medium">Estado
        <select name="estado" defaultValue={estado} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2"><option value="">Todos</option>{ESTADOS_PIEZA.map((x) => <option key={x} value={x}>{ETIQUETA_ESTADO[x]}</option>)}</select>
      </label>
      <label className="text-sm font-medium">Canal
        <select name="canal" defaultValue={canal} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2"><option value="">Todos</option>{CANALES_PIEZA.map((x) => <option key={x} value={x}>{ETIQUETA_CANAL[x]}</option>)}</select>
      </label>
      <label className="text-sm font-medium">Finalidad
        <select name="finalidad" defaultValue={finalidad} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2"><option value="">Todas</option>{FINALIDADES.map((x) => <option key={x} value={x}>{ETIQUETA_FINALIDAD[x]}</option>)}</select>
      </label>
      <label className="text-sm font-medium">Pilar
        <select name="pilar" defaultValue={pilar} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2"><option value="">Cualquier pilar</option>{opcionesPilares.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}</select>
      </label>
      <label className="text-sm font-medium">Oferta
        <select name="oferta" defaultValue={oferta} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2"><option value="">Cualquier oferta</option>{opcionesOfertas.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}</select>
      </label>
      <label className="text-sm font-medium">Lanzamiento
        <select name="lanzamiento" defaultValue={lanzamiento} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2">
          <option value="">Todo el contenido</option>
          <option value="habitual">Solo lo habitual (sin lanzamiento)</option>
          {opcionesLanzamientos.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
        </select>
      </label>
      <label className="text-sm font-medium">Grabación
        <select name="grabado" defaultValue={grabado} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2"><option value="">Todas</option><option value="si">Ya grabadas</option><option value="no">Pendientes de grabar</option></select>
      </label>
      <label className="text-sm font-medium">Idea de origen
        <select name="idea" defaultValue={idea} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2"><option value="">Cualquier idea</option>{opcionesIdeas.map((x) => <option key={x.id} value={x.id}>{x.texto.slice(0, 70)}</option>)}</select>
      </label>
      <label className="text-sm font-medium">Ordenar por
        <select name="orden" defaultValue={orden} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2"><option value="recientes">Más recientes</option><option value="titulo">Título</option><option value="fecha">Fecha prevista</option></select>
      </label>
      <label className="text-sm font-medium">Desde<input name="desde" type="date" defaultValue={desde} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2" /></label>
      <label className="text-sm font-medium">Hasta<input name="hasta" type="date" defaultValue={hasta} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2" /></label>
      <div className="flex items-end gap-3"><button className="rounded-boton bg-verde-700 px-4 py-2 text-sm font-medium text-white">Aplicar</button><Link href="/biblioteca" className="py-2 text-sm text-verde-700">Limpiar</Link></div>
    </form>
    {piezas.length === 0 ? <div className="rounded-tarjeta bg-verde-50 px-5 py-10 text-center text-tinta-suave">Todavía no hay piezas. Crea una desde una idea o empieza una nueva.</div> :
      vista === "lista" ? <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{tarjetas.map((tarjeta) => <li key={tarjeta.key}>{tarjeta}</li>)}</ul> :
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:px-0">{ESTADOS_PIEZA.map((e) => <section key={e} className="flex w-72 shrink-0 flex-col gap-3 rounded-tarjeta bg-fondo-suave p-3"><h2 className="font-semibold">{ETIQUETA_ESTADO[e]}</h2>{piezas.filter((pieza) => pieza.estado === e).map((pieza) => <article key={pieza.id} className="rounded-tarjeta border border-borde bg-fondo p-3"><Link href={`/piezas/${pieza.id}`} className="font-semibold hover:text-verde-700">{pieza.titulo}</Link><div className="mt-2"><EtiquetasPieza formato={pieza.formato} estado={pieza.estado} finalidad={pieza.finalidad} /></div>{pieza.lanzamiento_id && lanzamientos.get(pieza.lanzamiento_id) && <p className="mt-2 text-xs text-tinta-suave">Lanzamiento: {lanzamientos.get(pieza.lanzamiento_id)?.nombre}</p>}<SelectorEstadoTablero piezaId={pieza.id} estado={pieza.estado} formato={pieza.formato} /></article>)}</section>)}</div>}
    {paraRetomar.length > 0 && (
      <details className="rounded-tarjeta border border-borde bg-fondo-suave p-4">
        <summary className="cursor-pointer font-medium">
          Para retomar
          <span className="ml-2 text-sm font-normal text-tinta-suave">
            {paraRetomar.length === 1 ? "1 pieza que merece volver" : `${paraRetomar.length} piezas que merecen volver`}
          </span>
        </summary>
        <ul className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {paraRetomar.map((pieza) => (
            <li key={pieza.id}>
              <Link href={`/piezas/${pieza.id}`} className="block rounded-tarjeta border border-borde bg-fondo p-3 hover:bg-verde-50">
                <p className="font-medium">{pieza.titulo}</p>
                <p className="mt-1 text-xs text-tinta-suave">
                  {pieza.perenne ? "Perenne" : "Rindió bien hace tiempo"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </details>
    )}
  </section>;
}
