import Link from "next/link";
import { FormularioNuevaOferta } from "@/features/ofertas/formularios";
import type { Oferta } from "@/features/ofertas/esquemas";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";

export default async function Ofertas() {
  const supabase = await crearClienteServidor();
  const { data } = await supabase
    .from("ofertas")
    .select("id,nombre,tipo,via_compra,precio,archivada")
    .order("created_at", { ascending: false });
  const lista = (data ?? []) as Pick<Oferta, "id" | "nombre" | "tipo" | "via_compra" | "precio" | "archivada">[];

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-10 px-4 py-8 md:px-10 md:py-12">
      <div>
        <h1 className="font-serif text-2xl md:text-[28px]">Ofertas</h1>
        <p className="mt-2 text-tinta-suave">Tus productos y servicios, con lo que necesitas para hablar de ellos.</p>
      </div>

      {lista.length === 0 ? (
        <p className="rounded-tarjeta bg-verde-50 px-4 py-6 text-tinta-suave">
          Aún no has registrado ninguna oferta. Crea la primera abajo.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {lista.map((o) => (
            <li key={o.id}>
              <Link
                href={`/ofertas/${o.id}`}
                className={`block rounded-tarjeta border border-borde p-4 hover:bg-verde-50 ${o.archivada ? "opacity-50" : ""}`}
              >
                <p className="font-medium">{o.nombre}</p>
                <p className="mt-1 text-sm text-tinta-suave">
                  {o.tipo === "producto" ? "Producto" : "Servicio"}
                  {o.precio ? ` · ${o.precio}` : ""}
                  {o.archivada ? " · Archivada" : ""}
                </p>
                {o.via_compra && <p className="mt-2 text-sm">{o.via_compra}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Nueva oferta</h2>
        <FormularioNuevaOferta />
      </section>
    </div>
  );
}
