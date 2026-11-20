import { Calendario } from "@/features/calendario/calendario";
import type { Parametros } from "@/features/calendario/consultas";

export default async function PaginaCalendario({ searchParams }: { searchParams: Promise<Parametros> }) {
  const sp = await searchParams;
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-8 md:px-10 md:py-12">
      <div>
        <h1 className="font-serif text-2xl md:text-[28px]">Calendario</h1>
        <p className="mt-2 text-tinta-suave">Pulsa «+ Programar» en un día, elige el pilar y la pieza editada que quieres publicar.</p>
      </div>
      <Calendario sp={sp} />
    </div>
  );
}
