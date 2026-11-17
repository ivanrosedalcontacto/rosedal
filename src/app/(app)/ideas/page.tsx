import Link from "next/link";
import { Bandeja } from "@/features/ideas/bandeja";
import { Brainstorming } from "@/features/ideas/brainstorming";
import { Preguntas } from "@/features/ideas/preguntas";
import type { Parametros } from "@/features/ideas/consultas";

const VISTAS = [
  { valor: "bandeja", nombre: "Bandeja" },
  { valor: "brainstorming", nombre: "Brainstorming" },
  { valor: "preguntas", nombre: "Preguntas y objeciones" },
] as const;

type Vista = (typeof VISTAS)[number]["valor"];

function leerVista(p: Parametros): Vista {
  const v = typeof p.vista === "string" ? p.vista : "";
  return (VISTAS.map((x) => x.valor) as string[]).includes(v) ? (v as Vista) : "bandeja";
}

export default async function Ideas({ searchParams }: { searchParams: Promise<Parametros> }) {
  const sp = await searchParams;
  const vista = leerVista(sp);

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-8 md:px-10 md:py-12">
      <div>
        <h1 className="font-serif text-2xl md:text-[28px]">Ideas</h1>
        <p className="mt-2 text-tinta-suave">Tu bandeja, tu tablero y las palabras de tu audiencia.</p>
      </div>

      <nav aria-label="Vistas de ideas" className="flex flex-wrap gap-2">
        {VISTAS.map((v) => (
          <Link
            key={v.valor}
            href={`/ideas?vista=${v.valor}`}
            aria-current={vista === v.valor ? "page" : undefined}
            className={`min-h-11 rounded-full px-4 py-2.5 text-sm ${
              vista === v.valor ? "bg-verde-100 font-medium text-verde-700" : "border border-borde text-tinta"
            }`}
          >
            {v.nombre}
          </Link>
        ))}
      </nav>

      {vista === "bandeja" && <Bandeja sp={sp} />}
      {vista === "brainstorming" && <Brainstorming sp={sp} />}
      {vista === "preguntas" && <Preguntas sp={sp} />}
    </div>
  );
}
