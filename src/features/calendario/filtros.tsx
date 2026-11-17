import Link from "next/link";
import { ETIQUETA_CANAL, ETIQUETA_ESTADO, ETIQUETA_FINALIDAD, ETIQUETA_FORMATO } from "@/features/piezas/esquemas";
import {
  CANALES_FILTRO,
  ESTADOS_FILTRO,
  FINALIDADES_FILTRO,
  FORMATOS_FILTRO,
  type FiltrosCalendario,
} from "./esquemas";

type Opcion = { id: string; nombre: string };

type Props = {
  filtros: FiltrosCalendario;
  vista: string;
  fecha: string;
  pilares: Opcion[];
  ofertas: Opcion[];
  lanzamientos: Opcion[];
};

/** Filtros del calendario: se aplican con GET y se reflejan en la dirección. */
export function FiltrosCalendarioUI({ filtros, vista, fecha, pilares, ofertas, lanzamientos }: Props) {
  return (
    <form method="get" className="grid gap-3 rounded-tarjeta border border-borde bg-fondo-suave p-4 sm:grid-cols-2 lg:grid-cols-4">
      <input type="hidden" name="vista" value={vista} />
      <input type="hidden" name="fecha" value={fecha} />
      <label className="text-sm font-medium">
        Formato
        <select name="formato" defaultValue={filtros.formato} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2">
          <option value="">Todos</option>
          {FORMATOS_FILTRO.map((f) => (
            <option key={f} value={f}>
              {ETIQUETA_FORMATO[f]}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium">
        Canal
        <select name="canal" defaultValue={filtros.canal} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2">
          <option value="">Todos</option>
          {CANALES_FILTRO.map((c) => (
            <option key={c} value={c}>
              {ETIQUETA_CANAL[c]}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium">
        Finalidad
        <select name="finalidad" defaultValue={filtros.finalidad} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2">
          <option value="">Todas</option>
          {FINALIDADES_FILTRO.map((f) => (
            <option key={f} value={f}>
              {ETIQUETA_FINALIDAD[f]}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium">
        Estado
        <select name="estado" defaultValue={filtros.estado} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2">
          <option value="">Todos</option>
          {ESTADOS_FILTRO.map((e) => (
            <option key={e} value={e}>
              {ETIQUETA_ESTADO[e]}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium">
        Pilar
        <select name="pilar" defaultValue={filtros.pilar} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2">
          <option value="">Cualquier pilar</option>
          {pilares.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium">
        Oferta
        <select name="oferta" defaultValue={filtros.oferta} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2">
          <option value="">Cualquier oferta</option>
          {ofertas.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nombre}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium">
        Lanzamiento
        <select name="lanzamiento" defaultValue={filtros.lanzamiento} className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2">
          <option value="">Todo el contenido</option>
          {lanzamientos.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nombre}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end gap-3">
        <button className="rounded-boton bg-verde-700 px-4 py-2 text-sm font-medium text-white">Aplicar</button>
        <Link href={`/calendario?vista=${vista}&fecha=${fecha}`} className="py-2 text-sm text-verde-700">
          Limpiar
        </Link>
      </div>
    </form>
  );
}
