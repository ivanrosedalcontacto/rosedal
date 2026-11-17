/** Tonos pastel de la paleta; se muestran como un punto junto al nombre del pilar. */
export const COLORES_PILAR = ["verde", "menta", "oliva", "rosa", "frambuesa", "melocoton", "salvia", "malva"] as const;
export type ColorPilar = (typeof COLORES_PILAR)[number];

export const HEX_PILAR: Record<ColorPilar, string> = {
  verde: "#A9CBB0",
  menta: "#8FCDB8",
  oliva: "#C5CF9E",
  rosa: "#EDB1BF",
  frambuesa: "#D98BA3",
  melocoton: "#F4C6A8",
  salvia: "#BFD3C1",
  malva: "#D6B8D2",
};
