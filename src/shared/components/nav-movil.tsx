"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, BookOpen, Menu, Sun } from "lucide-react";
import { MenuCaptura } from "@/features/captura/menu-captura";

const ENLACES = [
  { href: "/hoy", nombre: "Hoy", icono: Sun },
  { href: "/calendario", nombre: "Calendario", icono: CalendarDays },
  null,
  { href: "/biblioteca", nombre: "Biblioteca", icono: BookOpen },
  { href: "/mas", nombre: "Más", icono: Menu },
] as const;

export function NavMovil() {
  const ruta = usePathname();
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-borde bg-fondo pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-5 items-center">
        {ENLACES.map((e) =>
          e === null ? (
            <li key="captura">
              <MenuCaptura variante="movil" />
            </li>
          ) : (
            <li key={e.href}>
              <Link
                href={e.href}
                aria-current={ruta === e.href ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs ${
                  ruta === e.href ? "font-medium text-verde-700" : "text-tinta-suave"
                }`}
              >
                <e.icono className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                {e.nombre}
              </Link>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}
