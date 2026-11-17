import type { Pieza } from "@/features/piezas/esquemas";
import { AsuntosEmail } from "./asuntos-email";
import { EditorCuerpoEmail } from "./editor-cuerpo";
import type { Asunto } from "./esquemas";

export function EditorEmail({
  pieza,
  asuntos,
  marca,
  bloqueado,
  enMarcha,
}: {
  pieza: Pieza;
  asuntos: Asunto[];
  marca: string;
  bloqueado: boolean;
  enMarcha: boolean;
}) {
  const elegido = asuntos.find((a) => a.elegida)?.asunto ?? asuntos[0]?.asunto ?? "";
  const vista = pieza.email_preview ?? "";
  return (
    <div className="flex flex-col gap-8">
      <AsuntosEmail piezaId={pieza.id} asuntos={asuntos} bloqueado={bloqueado} />

      <section className="rounded-tarjeta border border-borde bg-fondo-suave p-4">
        <h2 className="text-sm font-semibold text-tinta-suave">Así se verá en la bandeja</h2>
        <div className="mt-3 rounded-lg border border-borde bg-fondo p-3">
          <p className="flex items-center gap-2 text-sm font-medium"><span className="grid h-7 w-7 place-items-center rounded-full bg-verde-100 text-xs text-verde-700">{marca.slice(0, 1).toUpperCase()}</span>{marca}</p>
          <p className="mt-2 truncate font-semibold">{elegido || "Sin asunto"}</p>
          <p className="line-clamp-2 text-sm text-tinta-suave">{vista || "Sin texto de vista previa"}</p>
        </div>
        <p className="mt-2 text-xs text-tinta-suave">Se corta como en un móvil. Sirve para comparar asuntos sin salir de la app.</p>
      </section>

      <EditorCuerpoEmail
        piezaId={pieza.id}
        htmlInicial={pieza.email_cuerpo_html ?? ""}
        vistaInicial={vista}
        asuntoElegido={elegido}
        bloqueado={bloqueado}
      />

      {bloqueado && (
        <p className="rounded-tarjeta bg-verde-50 px-4 py-3 text-sm text-verde-700">
          {enMarcha
            ? "Este paso está en marcha en tu plataforma externa. Su contenido queda conservado y no se edita."
            : `Enviado el ${pieza.fecha_real ?? "sin fecha"} · el asunto, la vista previa y el cuerpo quedan conservados. Usa «Reutilizar» para partir de él.`}
        </p>
      )}
    </div>
  );
}
