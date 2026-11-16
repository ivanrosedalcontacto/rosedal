export type TipoCaptura = "idea" | "frase" | "idea_email";

export const INFO_CAPTURA: Record<
  TipoCaptura,
  { boton: string; titulo: string; ayuda: string; destino: string; enlace: string }
> = {
  idea: {
    boton: "+ Idea",
    titulo: "Nueva idea",
    ayuda: "Escribe lo que se te ha ocurrido. Clasificarlo puede esperar.",
    destino: "Ideas",
    enlace: "/ideas",
  },
  frase: {
    boton: "+ Frase para B-roll",
    titulo: "Nueva frase",
    ayuda: "Escribe la frase tal cual. Se guardan los saltos de línea.",
    destino: "Frases",
    enlace: "/frases",
  },
  idea_email: {
    boton: "+ Idea de email",
    titulo: "Nueva idea de email",
    ayuda: "Un asunto, una anécdota, una pregunta o un argumento.",
    destino: "Ideas de email",
    enlace: "/ideas?tipo=idea_email",
  },
};

export const TIPOS_CAPTURA = Object.keys(INFO_CAPTURA) as TipoCaptura[];
