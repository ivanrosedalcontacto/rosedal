import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Grid3x3,
  Lightbulb,
  Mail,
  Quote,
  Rocket,
  Settings,
  Sparkles,
  Sun,
  Tag,
  type LucideIcon,
} from "lucide-react";

export type Seccion = {
  href: string;
  nombre: string;
  icono: LucideIcon;
  descripcion: string;
};

export type GrupoSecciones = { titulo: string | null; secciones: Seccion[] };

const s = (href: string, nombre: string, icono: LucideIcon, descripcion: string): Seccion => ({
  href,
  nombre,
  icono,
  descripcion,
});

export const GRUPOS_NAV: GrupoSecciones[] = [
  { titulo: null, secciones: [s("/hoy", "Hoy", Sun, "Qué preparar, qué sale hoy y tu próximo hito.")] },
  {
    titulo: "Pensar",
    secciones: [
      s("/ideas", "Ideas", Lightbulb, "Bandeja, brainstorming, preguntas y objeciones."),
      s("/frases", "Frases", Quote, "Tu banco de frases para B-rolls y reels de prueba."),
    ],
  },
  {
    titulo: "Crear",
    secciones: [
      s("/biblioteca", "Biblioteca", BookOpen, "Todas tus piezas en lista y tablero."),
      s("/email", "Email", Mail, "Ideas de email, broadcasts y secuencias."),
    ],
  },
  {
    titulo: "Planificar",
    secciones: [
      s("/calendario", "Calendario", CalendarDays, "Semana y mes, con tu bandeja sin fecha."),
      s("/lanzamientos", "Lanzamientos", Rocket, "Fases, hitos y contenido de campaña."),
      s("/ofertas", "Ofertas", Tag, "Tus productos y servicios."),
    ],
  },
  {
    titulo: "Revisar",
    secciones: [
      s("/mapa", "Mapa", Grid3x3, "Pilares por finalidades."),
      s("/revision", "Revisión semanal", ClipboardCheck, "Métricas manuales y decisiones."),
    ],
  },
  {
    titulo: null,
    secciones: [
      s("/recursos", "Recursos", Sparkles, "Tono, CTA, testimonios, planos y enlaces."),
      s("/ajustes", "Ajustes", Settings, "Pilares, marca, plantillas y datos."),
    ],
  },
];

export const TODAS_LAS_SECCIONES: Seccion[] = GRUPOS_NAV.flatMap((g) => g.secciones);

/** Elementos de la barra inferior en móvil (el «+» central se añade aparte). */
export const NAV_MOVIL_IZQUIERDA = ["/hoy", "/calendario"];
export const NAV_MOVIL_DERECHA = ["/biblioteca"];
