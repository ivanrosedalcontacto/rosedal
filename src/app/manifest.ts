import type { MetadataRoute } from "next";

/** Manifiesto de la app instalable (A1): acceso directo a las tres capturas. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rosedal",
    short_name: "Rosedal",
    description: "Tu estudio editorial: ideas, piezas, lanzamientos y revisión.",
    start_url: "/hoy",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3d6b52",
    lang: "es",
    icons: [
      { src: "/icono.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icono-mascara.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Nueva idea", short_name: "Idea", url: "/hoy?captura=idea" },
      { name: "Nueva frase", short_name: "Frase", url: "/hoy?captura=frase" },
      { name: "Nueva idea de email", short_name: "Email", url: "/hoy?captura=idea_email" },
    ],
  };
}
