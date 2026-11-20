"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cerrarSesion } from "@/app/(auth)/login/acciones";
import { MenuCaptura } from "@/features/captura/menu-captura";
import { BuscadorGlobal } from "@/features/mejoras/buscador-global";
import { GRUPOS_NAV } from "@/shared/constants/secciones";

export function NavLateral() {
  const ruta = usePathname();
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-5 overflow-y-auto border-r border-borde bg-fondo-suave px-4 py-6 md:flex">
      <Link href="/hoy" className="px-2 font-serif text-2xl text-verde-700">
        Rosedal
      </Link>
      <MenuCaptura variante="lateral" />
      {/* Sin botón: la búsqueda global queda solo con Ctrl + K. */}
      <BuscadorGlobal />
      <nav aria-label="Principal" className="flex flex-1 flex-col gap-4">
        {GRUPOS_NAV.map((g, i) => (
          <div key={g.titulo ?? i} className={g.titulo === null && i > 0 ? "mt-auto" : ""}>
            {g.titulo && (
              <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-tinta-suave">{g.titulo}</p>
            )}
            <ul className="flex flex-col gap-0.5">
              {g.secciones.map(({ href, nombre, icono: Icono }) => {
                const activa = ruta === href || ruta.startsWith(href + "/");
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={activa ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-boton px-2 py-2 transition-colors ${
                        activa ? "bg-verde-100 font-medium text-verde-700" : "text-tinta hover:bg-verde-50"
                      }`}
                    >
                      <Icono className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden />
                      {nombre}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <form action={cerrarSesion}>
        <button
          type="submit"
          className="min-h-11 w-full rounded-boton px-2 py-2 text-left text-sm text-tinta-suave hover:bg-verde-50"
        >
          Cerrar sesión
        </button>
      </form>
    </aside>
  );
}
