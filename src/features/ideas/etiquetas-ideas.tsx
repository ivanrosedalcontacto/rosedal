import { Etiqueta, type TonoEtiqueta } from "@/shared/components/etiquetas";
import { ETIQUETA_ESTADO, ETIQUETA_TIPO, type EstadoIdea, type TipoIdea } from "./esquemas";

const TONO_TIPO: Record<TipoIdea, TonoEtiqueta> = {
  idea: "verde",
  idea_email: "menta",
  pregunta: "rosa",
  objecion: "rosa",
};

const TONO_ESTADO: Record<EstadoIdea, TonoEtiqueta> = {
  pendiente: "neutro",
  en_desarrollo: "aviso",
  archivada: "gris",
};

/** Etiqueta de tipo de idea con el mismo aspecto en lista, tablero y ficha. */
export function EtiquetaTipoIdea({ tipo }: { tipo: TipoIdea }) {
  return <Etiqueta tono={TONO_TIPO[tipo]}>{ETIQUETA_TIPO[tipo]}</Etiqueta>;
}

/** Etiqueta de estado de idea con el mismo aspecto en toda la app. */
export function EtiquetaEstadoIdea({ estado }: { estado: EstadoIdea }) {
  return <Etiqueta tono={TONO_ESTADO[estado]}>{ETIQUETA_ESTADO[estado]}</Etiqueta>;
}
