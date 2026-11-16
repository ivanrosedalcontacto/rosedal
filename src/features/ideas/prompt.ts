import type { Idea } from "./esquemas";

type DatosPrompt = {
  idea: Pick<Idea, "texto" | "tipo" | "procedencia" | "veces_aparecida">;
  audienciaGeneral: string;
  tonoGeneral: string;
  oferta: { nombre: string; publico: string; propuesta_valor: string } | null;
  ejemplosTono: string[];
};

const bloque = (lineas: (string | false | null | undefined)[]) => lineas.filter(Boolean).join("\n");

/** Compone el texto que la usuaria pega en Claude. Omite lo que esté vacío. */
export function componerPrompt({ idea, audienciaGeneral, tonoGeneral, oferta, ejemplosTono }: DatosPrompt): string {
  const esDeAudiencia = idea.tipo === "pregunta" || idea.tipo === "objecion";
  const audiencia = oferta?.publico || audienciaGeneral;
  const veces = idea.veces_aparecida === 1 ? "1 vez" : `${idea.veces_aparecida} veces`;

  return [
    bloque([
      "Quiero explorar ángulos de contenido para esta idea:",
      `\n«${idea.texto}»`,
      esDeAudiencia &&
        `Son palabras textuales de mi audiencia.${idea.procedencia ? ` Procedencia: ${idea.procedencia}.` : ""} Ha aparecido ${veces}.`,
    ]),
    bloque([
      audiencia && `Mi audiencia: ${audiencia}`,
      oferta && `La oferta relacionada: ${oferta.nombre}.${oferta.propuesta_valor ? ` ${oferta.propuesta_valor}` : ""}`,
      tonoGeneral && `Mi tono: ${tonoGeneral}`,
      ejemplosTono.length > 0 && `Ejemplos de cómo escribo:\n${ejemplosTono.map((e) => `- ${e}`).join("\n")}`,
    ]),
    bloque([
      "Propón un ángulo para cada uno de estos enfoques: tutorial, historia personal, error frecuente, demostración, caso real y objeción de compra.",
      "Para cada uno dame un gancho de una línea, la idea central en dos frases y el formato que mejor le va (reel, carrusel, stories o email).",
    ]),
  ]
    .filter(Boolean)
    .join("\n\n");
}
