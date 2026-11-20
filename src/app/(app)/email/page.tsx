import Link from "next/link";
import { Broadcasts } from "@/features/email/broadcasts";
import { IdeasEmail } from "@/features/email/ideas-email";
import { Secuencias } from "@/features/email/secuencias";
import { ETIQUETA_VISTA_EMAIL, VISTAS_EMAIL, type VistaEmail } from "@/features/email/esquemas";
import { valor, type Parametros } from "@/features/email/consultas";

export default async function Email({ searchParams }: { searchParams: Promise<Parametros> }) {
  const sp = await searchParams;
  const pedida = valor(sp, "vista");
  const vista: VistaEmail = (VISTAS_EMAIL as readonly string[]).includes(pedida) ? (pedida as VistaEmail) : "broadcasts";

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-8 md:px-10 md:py-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl md:text-[28px]">Email</h1>
          <p className="mt-2 text-tinta-suave">Escribe y organiza tus correos aunque el envío lo hagas fuera de la app.</p>
        </div>
        <Link href="/piezas/nueva?formato=email" className="min-h-11 rounded-boton bg-verde-700 px-4 py-2.5 font-medium text-white">+ Correo</Link>
      </div>

      <nav aria-label="Vistas de email" className="flex flex-wrap gap-2">
        {VISTAS_EMAIL.map((v) => (
          <Link
            key={v}
            href={`/email?vista=${v}`}
            aria-current={vista === v ? "page" : undefined}
            className={`min-h-11 rounded-full px-4 py-2.5 text-sm ${vista === v ? "bg-acento font-medium text-acento-texto" : "border border-borde text-tinta"}`}
          >
            {ETIQUETA_VISTA_EMAIL[v]}
          </Link>
        ))}
      </nav>

      {vista === "broadcasts" && <Broadcasts sp={sp} />}
      {vista === "ideas" && <IdeasEmail />}
      {vista === "secuencias" && <Secuencias />}
    </div>
  );
}
