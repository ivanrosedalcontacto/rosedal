import type { crearClienteServidor } from "@/shared/lib/supabase/servidor";

type Cliente = Awaited<ReturnType<typeof crearClienteServidor>>;

/** Mapas de nombres a ids ya sembrados. */
export type Contexto = {
  dia: (n: number) => string;
  pilares: Map<string, string>;
  ofertas: Map<string, string>;
  lanzamiento: string | null;
  fases: Map<string, string> | null;
};

/** Contexto mínimo para las piezas que no dependen del lanzamiento. */
export type ContextoSimple = {
  dia: (n: number) => string;
  pilares: Map<string, string>;
  ofertas: Map<string, string>;
};

/** Inserta una pieza y devuelve su id; el contenido se escribe en la misma llamada. */
export async function crearPieza(
  supabase: Cliente,
  valores: Record<string, unknown>,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("piezas")
    .insert({ ...valores, es_demo: true })
    .select("id")
    .single();
  if (error || !data) return null;
  return data.id as string;
}

/** Inserta una versión de guion. */
export async function crearGuion(
  supabase: Cliente,
  piezaId: string,
  nombre: string,
  gancho: string,
  desarrollo: string,
  cierre: string,
  elegida: boolean,
  orden = 0,
): Promise<void> {
  await supabase.from("pieza_versiones").insert({
    es_demo: true,
    pieza_id: piezaId,
    tipo: "guion",
    nombre,
    gancho,
    desarrollo,
    cierre,
    elegida,
    orden,
  });
}

/** Inserta los asuntos de un correo y devuelve el elegido. */
export async function crearAsuntos(
  supabase: Cliente,
  piezaId: string,
  asuntos: { texto: string; elegida: boolean }[],
): Promise<void> {
  if (asuntos.length === 0) return;
  await supabase.from("pieza_versiones").insert(
    asuntos.map((a, i) => ({
      es_demo: true,
      pieza_id: piezaId,
      tipo: "asunto",
      nombre: a.elegida ? "Elegido" : `Alternativo ${i}`,
      asunto: a.texto,
      elegida: a.elegida,
      orden: i,
    })),
  );
}
