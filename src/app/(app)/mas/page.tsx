import Link from "next/link";
import { cerrarSesion } from "@/app/(auth)/login/acciones";
import { GRUPOS_NAV } from "@/shared/constants/secciones";

export default function Mas() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <h1 className="font-serif text-2xl">Más</h1>
      <div className="mt-6 flex flex-col gap-6">
        {GRUPOS_NAV.map((g, i) => (
          <section key={g.titulo ?? i}>
            {g.titulo && <h2 className="mb-2 text-sm font-semibold text-tinta-suave">{g.titulo}</h2>}
            <ul className="overflow-hidden rounded-tarjeta border border-borde">
              {g.secciones.map(({ href, nombre, icono: Icono }) => (
                <li key={href} className="border-b border-borde last:border-b-0">
                  <Link href={href} className="flex min-h-11 items-center gap-3 px-4 py-3">
                    <Icono className="h-5 w-5 text-verde-700" strokeWidth={1.5} aria-hidden />
                    {nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <form action={cerrarSesion}>
          <button type="submit" className="min-h-11 w-full rounded-tarjeta border border-borde px-4 py-3 text-left text-tinta-suave">
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
