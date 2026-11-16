import { TODAS_LAS_SECCIONES } from "@/shared/constants/secciones";

/** Pantalla provisional de una sección mientras se construye su fase. */
export function PaginaVacia({ href }: { href: string }) {
  const seccion = TODAS_LAS_SECCIONES.find((s) => s.href === href);
  const Icono = seccion?.icono;
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-10 md:py-12">
      <h1 className="font-serif text-2xl md:text-[28px]">{seccion?.nombre}</h1>
      <p className="mt-2 text-tinta-suave">{seccion?.descripcion}</p>
      <div className="mt-8 flex flex-col items-center gap-3 rounded-tarjeta border border-borde bg-verde-50 px-6 py-14 text-center">
        {Icono && <Icono className="h-8 w-8 text-verde-700" strokeWidth={1.5} aria-hidden />}
        <p className="text-tinta-suave">Esta sección se construirá en las próximas fases.</p>
      </div>
    </div>
  );
}
