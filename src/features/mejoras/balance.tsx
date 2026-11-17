import { BotonCopiar } from "@/shared/components/boton-copiar";
import { balanceDeLanzamiento, textoDelBalance, type PiezaResumen } from "@/features/mejoras/resumen";

/** Balance del lanzamiento (B8): lo confirmado, lo que no se sabe y qué repetir. */
export function BalanceDelLanzamiento({ nombre, piezas }: { nombre: string; piezas: PiezaResumen[] }) {
  const balance = balanceDeLanzamiento(piezas);
  const claves = [...new Set([...Object.keys(balance.confirmados), ...Object.keys(balance.sinAtribuir)])];
  if (claves.length === 0 && balance.pendientes.length === 0) {
    return (
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Balance</h2>
        <p className="rounded-tarjeta bg-verde-50 px-4 py-5 text-sm text-tinta-suave">
          Todavía no hay métricas de solicitudes, reservas, compras o ingresos en este lanzamiento.
        </p>
      </section>
    );
  }
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Balance</h2>
        <BotonCopiar texto={textoDelBalance(balance, nombre)} etiqueta="Copiar balance" />
      </div>
      <div className="overflow-x-auto rounded-tarjeta border border-borde">
        <table className="w-full min-w-[420px] text-sm">
          <thead className="bg-fondo-suave text-left">
            <tr>
              <th scope="col" className="px-3 py-2 font-medium">Métrica</th>
              <th scope="col" className="px-3 py-2 font-medium">Confirmadas</th>
              <th scope="col" className="px-3 py-2 font-medium">Sin atribuir</th>
            </tr>
          </thead>
          <tbody>
            {claves.map((clave) => (
              <tr key={clave} className="border-t border-borde">
                <td className="px-3 py-2">{clave.replace("_", " ")}</td>
                <td className="px-3 py-2">{balance.confirmados[clave] ?? 0}</td>
                <td className="px-3 py-2">{balance.sinAtribuir[clave] ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {balance.pendientes.length > 0 && (
        <p className="text-sm text-tinta-suave">Pendiente de registrar: {balance.pendientes.join(" · ")}</p>
      )}
      {balance.queRepetir.length > 0 && (
        <p className="text-sm">
          <strong>Qué repetir:</strong> {balance.queRepetir.join(" · ")}
        </p>
      )}
      {balance.queNo.length > 0 && (
        <p className="text-sm">
          <strong>Qué no:</strong> {balance.queNo.join(" · ")}
        </p>
      )}
    </section>
  );
}
