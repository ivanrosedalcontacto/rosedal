import { ETIQUETA_METRICA } from "@/features/revision/esquemas";
import { formatearFecha } from "@/shared/lib/fechas";

export type MetricaResumen = { clave: string; valor: number | null; atribucion: "confirmada" | "sin_atribuir" | null };
export type PiezaResumen = { titulo: string; formato: string; fecha_real: string | null; metricas: MetricaResumen[] };

/** Texto copiable de lo publicado en la revisión (B7). */
export function resumenCopiable(salidas: PiezaResumen[]): string {
  if (salidas.length === 0) return "Esta semana no salió ninguna pieza.";
  const lineas = ["Lo publicado esta semana:", ""];
  for (const pieza of salidas) {
    lineas.push(`- ${pieza.titulo} (${pieza.formato})${pieza.fecha_real ? ` · ${formatearFecha(pieza.fecha_real)}` : ""}`);
    for (const metrica of pieza.metricas) {
      const nombre = ETIQUETA_METRICA[metrica.clave] ?? metrica.clave;
      if (metrica.valor === null) {
        lineas.push(`  · ${nombre}: pendiente`);
      } else {
        const atribucion = metrica.atribucion ? ` · atribución ${metrica.atribucion}` : "";
        lineas.push(`  · ${nombre}: ${metrica.valor}${atribucion}`);
      }
    }
  }
  const pendientes = salidas.flatMap((p) => p.metricas.filter((m) => m.valor === null).map((m) => `${p.titulo}: ${ETIQUETA_METRICA[m.clave] ?? m.clave}`));
  if (pendientes.length > 0) {
    lineas.push("", "Pendiente de registrar:");
    for (const p of pendientes) lineas.push(`- ${p}`);
  }
  return lineas.join("\n");
}

export type Balance = {
  confirmados: Record<string, number>;
  sinAtribuir: Record<string, number>;
  pendientes: string[];
  queRepetir: string[];
  queNo: string[];
};

/** Suma de solicitudes, reservas, compras e ingresos de un lanzamiento (B8). */
export function balanceDeLanzamiento(piezas: PiezaResumen[]): Balance {
  const confirmados: Record<string, number> = {};
  const sinAtribuir: Record<string, number> = {};
  const pendientes: string[] = [];
  const queRepetir: string[] = [];
  const queNo: string[] = [];
  const cuenta = ["solicitudes", "reservas", "compras", "ingresos"];

  for (const pieza of piezas) {
    let tieneResultado = false;
    for (const metrica of pieza.metricas) {
      if (!cuenta.includes(metrica.clave)) continue;
      if (metrica.valor === null) {
        pendientes.push(`${pieza.titulo}: ${ETIQUETA_METRICA[metrica.clave] ?? metrica.clave}`);
        continue;
      }
      tieneResultado = true;
      const destino = metrica.atribucion === "confirmada" ? confirmados : sinAtribuir;
      destino[metrica.clave] = (destino[metrica.clave] ?? 0) + metrica.valor;
    }
    if (tieneResultado) {
      const dioResultados = (piezas.find((p) => p.titulo === pieza.titulo)?.metricas ?? []).some(
        (m) => (m.clave === "compras" || m.clave === "reservas") && (m.valor ?? 0) > 0,
      );
      if (dioResultados) queRepetir.push(pieza.titulo);
      else queNo.push(pieza.titulo);
    }
  }
  return { confirmados, sinAtribuir, pendientes, queRepetir, queNo };
}

/** Texto copiable del balance (B7). */
export function textoDelBalance(balance: Balance, nombreLanzamiento: string): string {
  const lineas = [`Balance de ${nombreLanzamiento}:`, ""];
  const claves = new Set([...Object.keys(balance.confirmados), ...Object.keys(balance.sinAtribuir)]);
  for (const clave of claves) {
    const nombre = ETIQUETA_METRICA[clave] ?? clave;
    lineas.push(`- ${nombre}: ${balance.confirmados[clave] ?? 0} confirmadas · ${balance.sinAtribuir[clave] ?? 0} sin atribuir`);
  }
  if (balance.pendientes.length > 0) {
    lineas.push("", "Pendiente:");
    for (const p of balance.pendientes) lineas.push(`- ${p}`);
  }
  if (balance.queRepetir.length > 0) {
    lineas.push("", "Qué repetir:");
    for (const p of balance.queRepetir) lineas.push(`- ${p}`);
  }
  if (balance.queNo.length > 0) {
    lineas.push("", "Qué no:");
    for (const p of balance.queNo) lineas.push(`- ${p}`);
  }
  return lineas.join("\n");
}
