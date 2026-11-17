import { Revision } from "@/features/revision/revision";

export default async function PaginaRevision({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6 px-4 py-8 md:px-10 md:py-12">
      <div>
        <h1 className="font-serif text-2xl md:text-[28px]">Revisión semanal</h1>
        <p className="mt-2 text-tinta-suave">Lo que salió, lo que no y qué te tienes que apuntar de cada pieza.</p>
      </div>
      <Revision sp={sp} />
    </div>
  );
}
