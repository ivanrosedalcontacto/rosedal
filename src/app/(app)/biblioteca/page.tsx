import Link from "next/link";
import { Biblioteca } from "@/features/piezas/biblioteca";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  return <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-8 md:px-10 md:py-12">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="font-serif text-2xl md:text-[28px]">Biblioteca</h1><p className="mt-2 text-tinta-suave">Todas tus piezas, desde la idea hasta lo publicado.</p></div><Link href="/piezas/nueva" className="rounded-boton bg-verde-700 px-4 py-2 text-sm font-medium text-white">+ Nueva pieza</Link></div>
    <Biblioteca sp={sp} />
  </div>;
}
