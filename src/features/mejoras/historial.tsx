import { formatearFecha } from "@/shared/lib/fechas";

type Cambio = {
  id: string;
  fecha_anterior: string | null;
  fecha_nueva: string | null;
  cambiado_en: string;
};

/** Historial de fechas previstas (A8): cada cambio queda anotado. */
export function HistorialDeFechas({ cambios }: { cambios: Cambio[] }) {
  if (cambios.length === 0) {
    return <p className="text-sm text-tinta-suave">La fecha prevista no ha cambiado todavía.</p>;
  }
  return (
    <ul className="flex flex-col gap-1 text-sm">
      {cambios.map((cambio) => (
        <li key={cambio.id} className="text-tinta-suave">
          {cambio.fecha_anterior ? formatearFecha(cambio.fecha_anterior) : "sin fecha"} →{" "}
          {cambio.fecha_nueva ? formatearFecha(cambio.fecha_nueva) : "sin fecha"}
        </li>
      ))}
    </ul>
  );
}
