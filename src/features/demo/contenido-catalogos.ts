/** Pilares y ofertas del ejemplo (docs/04-datos-demo.md). */

export const PILARES_DEMO = [
  {
    nombre: "Planificación realista",
    descripcion: "Cómo organizar la semana contando con lo que de verdad pasa",
    color: "verde",
  },
  {
    nombre: "Energía y descanso",
    descripcion: "Trabajar a favor de tu energía, no contra ella",
    color: "menta",
  },
  {
    nombre: "Negocio con calma",
    descripcion: "Decisiones de negocio que quitan carga en lugar de añadirla",
    color: "oliva",
  },
  {
    nombre: "Mi método por dentro",
    descripcion: "Cómo trabajo yo y cómo trabajo con mis clientas",
    color: "rosa",
  },
] as const;

export type OfertaDemo = {
  nombre: string;
  tipo: "producto" | "servicio";
  publico: string;
  problema: string;
  propuesta_valor: string;
  via_compra: string;
  via_compra_url: string | null;
  precio: string;
  objeciones: { objecion: string; respuesta: string }[];
};

export const OFERTAS_DEMO: OfertaDemo[] = [
  {
    nombre: "Curso «Semana en Calma»",
    tipo: "producto",
    publico: "autónomas que planifican cada lunes una semana imposible y la abandonan el miércoles",
    problema: "listas infinitas, urgencias de clientes que lo desordenan todo y la sensación de no llegar nunca",
    propuesta_valor:
      "en cuatro semanas montas una planificación semanal que cabe en tu vida real y que sabes rehacer cuando algo se tuerce",
    via_compra: "Compra en este enlace",
    via_compra_url: "https://ejemplo.com/semana-en-calma",
    precio: "147 €",
    objeciones: [
      {
        objecion: "No tengo tiempo para hacer un curso",
        respuesta: "son lecciones de quince minutos y la primera semana ya libera más tiempo del que pide",
      },
      {
        objecion: "Ya he probado agendas y métodos y los dejo",
        respuesta: "no es una agenda nueva, es aprender a decidir qué entra en la semana",
      },
      {
        objecion: "No sé si me basta con el curso o necesito algo individual",
        respuesta: "ver la idea central del ejemplo",
      },
    ],
  },
  {
    nombre: "Asesoría individual «Sesión Brújula»",
    tipo: "servicio",
    publico:
      "quien tiene una situación particular (equipo pequeño, dos negocios, cuidados a cargo) y quiere un plan a la medida",
    problema: "los métodos generales no encajan en su caso y lleva meses dándole vueltas sola",
    propuesta_valor:
      "noventa minutos conmigo y sales con tu semana tipo diseñada y los tres cambios por los que empezar",
    via_compra: "Escríbeme SESIÓN por privado",
    via_compra_url: null,
    precio: "190 €",
    objeciones: [
      {
        objecion: "Es mucho dinero para una sola sesión",
        respuesta: "incluye el análisis previo de tu semana y un mes de seguimiento por mensajes",
      },
      { objecion: "Me da apuro enseñar mi caos", respuesta: "justo para eso está" },
    ],
  },
];

export const ENLACE_CURSO = "https://ejemplo.com/semana-en-calma";
