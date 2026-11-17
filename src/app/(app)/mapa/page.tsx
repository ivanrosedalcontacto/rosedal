import { Mapa } from "@/features/mapa/mapa";

export default async function PaginaMapa({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-8 md:px-10 md:py-12">
      <div>
        <h1 className="font-serif text-2xl md:text-[28px]">Mapa de pilares y finalidades</h1>
        <p className="mt-2 text-tinta-suave">Cuántas piezas tiene cada pilar en cada finalidad. Informa, no juzga.</p>
      </div>
      <Mapa sp={sp} />
    </div>
  );
}
