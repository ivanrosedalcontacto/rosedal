import { Etiqueta } from "@/shared/components/etiquetas";
import { ETIQUETA_ESTADO, ETIQUETA_FINALIDAD, ETIQUETA_FORMATO, type EstadoPieza, type Finalidad, type FormatoPieza } from "./esquemas";

export function EtiquetasPieza({ formato, estado, finalidad }: { formato: FormatoPieza; estado: EstadoPieza; finalidad: Finalidad | null }) {
  return <div className="flex flex-wrap gap-2">
    <Etiqueta>{ETIQUETA_FORMATO[formato]}</Etiqueta>
    <Etiqueta tono={estado === "publicado" ? "verde" : "neutro"}>{ETIQUETA_ESTADO[estado]}</Etiqueta>
    {finalidad && <Etiqueta tono={finalidad === "convert" ? "aviso" : "neutro"}>{ETIQUETA_FINALIDAD[finalidad]}</Etiqueta>}
  </div>;
}
