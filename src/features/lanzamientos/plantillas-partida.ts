import type { crearClienteServidor } from "@/shared/lib/supabase/servidor";
import type { ContenidoPlantillaLanzamiento } from "./esquemas";

type Cliente = Awaited<ReturnType<typeof crearClienteServidor>>;

type PlantillaDePartida = {
  clave: string;
  nombre: string;
  descripcion: string;
  contenido: ContenidoPlantillaLanzamiento;
};

/** Las dos plantillas que vienen con la app, con el contenido de `docs/04-datos-demo.md`. */
export const PLANTILLAS_PARTIDA: PlantillaDePartida[] = [
  {
    clave: "lanzamiento_producto_digital",
    nombre: "Lanzar un producto digital",
    descripcion: "Dos semanas de expectación y venta alrededor de la apertura de un curso o una descarga.",
    contenido: {
      fases: [
        { tipo: "expectacion", nombre: "Expectación", inicio_dias: -7, fin_dias: -1, notas: "Que se reconozcan en el problema y sepan que viene algo." },
        { tipo: "apertura", nombre: "Apertura", inicio_dias: 0, fin_dias: 1, notas: "Anunciar que se abren las plazas." },
        { tipo: "venta", nombre: "Venta", inicio_dias: 2, fin_dias: 5, notas: "Resolver dudas y objeciones." },
        { tipo: "cierre", nombre: "Cierre", inicio_dias: 6, fin_dias: 7, notas: "Último aviso." },
        { tipo: "seguimiento", nombre: "Seguimiento", inicio_dias: 8, fin_dias: 14, notas: "Dar la bienvenida y recoger impresiones." },
      ],
      hitos: [
        { titulo: "Abrir lista de espera", dias: -6, fase: "expectacion" },
        { titulo: "Abrir inscripciones", dias: 0, fase: "apertura" },
        { titulo: "Directo de preguntas", dias: 3, fase: "venta" },
        { titulo: "Cierre de inscripciones", dias: 7, fase: "cierre" },
        { titulo: "Empieza el producto", dias: 14, fase: "seguimiento" },
      ],
      piezas: [
        { titulo: "Reel para atraer", formato: "reel", finalidad: "attract", dias: -6, fase: "expectacion" },
        { titulo: "Carrusel para atraer", formato: "carrusel", finalidad: "attract", dias: -4, fase: "expectacion" },
        { titulo: "Stories para cultivar", formato: "stories", finalidad: "nurture", dias: -2, fase: "expectacion" },
        { titulo: "Correo para cultivar", formato: "email", finalidad: "nurture", dias: -3, fase: "expectacion" },
        { titulo: "Correo «mañana abro»", formato: "email", finalidad: "convert", dias: -1, fase: "expectacion" },
        { titulo: "Correo de apertura", formato: "email", finalidad: "convert", dias: 0, fase: "apertura" },
        { titulo: "Reel de apertura", formato: "reel", finalidad: "convert", dias: 0, fase: "apertura" },
        { titulo: "Stories de apertura", formato: "stories", finalidad: "convert", dias: 0, fase: "apertura" },
        { titulo: "Reel con caso real", formato: "reel", finalidad: "position", dias: 2, fase: "venta" },
        { titulo: "Correo sobre objeciones", formato: "email", finalidad: "position", dias: 3, fase: "venta" },
        { titulo: "Stories con preguntas", formato: "stories", finalidad: "nurture", dias: 4, fase: "venta" },
        { titulo: "Carrusel sobre el método", formato: "carrusel", finalidad: "position", dias: 5, fase: "venta" },
        { titulo: "Correo «último día»", formato: "email", finalidad: "convert", dias: 7, fase: "cierre" },
        { titulo: "Stories de último día", formato: "stories", finalidad: "convert", dias: 7, fase: "cierre" },
        { titulo: "Correo de agradecimiento", formato: "email", finalidad: "nurture", dias: 9, fase: "seguimiento" },
        { titulo: "Publicación de bienvenida", formato: "post", finalidad: "nurture", dias: 10, fase: "seguimiento" },
      ],
    },
  },
  {
    clave: "lanzamiento_servicio",
    nombre: "Lanzar un servicio",
    descripcion: "Tres semanas con expectación larga y una ventana de plazas limitadas.",
    contenido: {
      fases: [
        { tipo: "expectacion", nombre: "Expectación", inicio_dias: -10, fin_dias: -1, notas: "Que se reconozcan en el problema y sepan que viene algo." },
        { tipo: "apertura", nombre: "Apertura", inicio_dias: 0, fin_dias: 2, notas: "Anunciar que se abre la agenda." },
        { tipo: "venta", nombre: "Venta", inicio_dias: 3, fin_dias: 9, notas: "Resolver dudas y objeciones." },
        { tipo: "cierre", nombre: "Cierre", inicio_dias: 10, fin_dias: 11, notas: "Último aviso." },
        { tipo: "seguimiento", nombre: "Seguimiento", inicio_dias: 12, fin_dias: 20, notas: "Acompañar y recoger impresiones." },
      ],
      hitos: [
        { titulo: "Definir plazas", dias: -10, fase: "expectacion" },
        { titulo: "Abrir agenda", dias: 0, fase: "apertura" },
        { titulo: "Mitad de plazas", dias: 6, fase: "venta" },
        { titulo: "Cerrar agenda", dias: 11, fase: "cierre" },
        { titulo: "Primeras sesiones", dias: 14, fase: "seguimiento" },
      ],
      piezas: [
        { titulo: "Reel sobre el problema", formato: "reel", finalidad: "attract", dias: -9, fase: "expectacion" },
        { titulo: "Carrusel sobre cómo trabajo", formato: "carrusel", finalidad: "position", dias: -6, fase: "expectacion" },
        { titulo: "Correo con un caso", formato: "email", finalidad: "nurture", dias: -4, fase: "expectacion" },
        { titulo: "Stories con preguntas", formato: "stories", finalidad: "nurture", dias: -2, fase: "expectacion" },
        { titulo: "Correo de apertura", formato: "email", finalidad: "convert", dias: 0, fase: "apertura" },
        { titulo: "Stories de apertura", formato: "stories", finalidad: "convert", dias: 0, fase: "apertura" },
        { titulo: "Reel de posicionamiento", formato: "reel", finalidad: "position", dias: 1, fase: "apertura" },
        { titulo: "Reel con testimonio", formato: "reel", finalidad: "position", dias: 4, fase: "venta" },
        { titulo: "Correo sobre objeciones", formato: "email", finalidad: "position", dias: 5, fase: "venta" },
        { titulo: "Stories «quedan plazas»", formato: "stories", finalidad: "convert", dias: 7, fase: "venta" },
        { titulo: "Correo de cierre", formato: "email", finalidad: "convert", dias: 11, fase: "cierre" },
        { titulo: "Stories de cierre", formato: "stories", finalidad: "convert", dias: 11, fase: "cierre" },
        { titulo: "Correo para quien no entró", formato: "email", finalidad: "nurture", dias: 13, fase: "seguimiento" },
        { titulo: "Publicación de seguimiento", formato: "post", finalidad: "nurture", dias: 16, fase: "seguimiento" },
      ],
    },
  },
];

/** Crea las plantillas de partida que falten; se puede llamar en cada visita sin duplicar. */
export async function sembrarPlantillasPartida(supabase: Cliente): Promise<void> {
  const { data: existentes } = await supabase.from("plantillas").select("clave").eq("tipo", "lanzamiento").not("clave", "is", null);
  const claves = new Set((existentes ?? []).map((p) => p.clave as string));
  const faltantes = PLANTILLAS_PARTIDA.filter((p) => !claves.has(p.clave));
  if (faltantes.length === 0) return;
  await supabase.from("plantillas").insert(
    faltantes.map((p) => ({
      tipo: "lanzamiento",
      clave: p.clave,
      nombre: p.nombre,
      descripcion: p.descripcion,
      contenido: p.contenido,
    })),
  );
}
