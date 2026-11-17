"use client";

import { Bold, Italic, Link2, List, ListOrdered, Minus, Quote, Redo2, Type, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { botonSecundario } from "@/shared/components/estilos";
import { htmlATexto, sanearHtml } from "@/shared/lib/html";
import { guardarCuerpoEmail, guardarVistaPreviaEmail } from "./acciones";

type EstadoGuardado = "reposo" | "guardando" | "guardado" | "error";
type Copiado = "asunto" | "vista" | "cuerpo" | "error" | null;

const RETARDO = 900;

function EtiquetaEstado({ estado }: { estado: EstadoGuardado }) {
  const texto =
    estado === "guardando" ? "Guardando…" : estado === "guardado" ? "Guardado ✓" : estado === "error" ? "No se pudo guardar" : "";
  if (!texto) return null;
  return (
    <span role="status" className={`text-xs ${estado === "error" ? "text-error" : "text-tinta-suave"}`}>
      {texto}
    </span>
  );
}

export function EditorCuerpoEmail({
  piezaId,
  htmlInicial,
  vistaInicial,
  asuntoElegido,
  bloqueado,
}: {
  piezaId: string;
  htmlInicial: string;
  vistaInicial: string;
  asuntoElegido: string;
  bloqueado: boolean;
}) {
  const cuerpoRef = useRef<HTMLDivElement>(null);
  const temporizadorCuerpo = useRef<number | null>(null);
  const temporizadorVista = useRef<number | null>(null);
  const [vista, setVista] = useState(vistaInicial);
  const [estadoCuerpo, setEstadoCuerpo] = useState<EstadoGuardado>("reposo");
  const [estadoVista, setEstadoVista] = useState<EstadoGuardado>("reposo");
  const [copiado, setCopiado] = useState<Copiado>(null);

  useEffect(() => {
    return () => {
      if (temporizadorCuerpo.current) window.clearTimeout(temporizadorCuerpo.current);
      if (temporizadorVista.current) window.clearTimeout(temporizadorVista.current);
    };
  }, []);

  async function guardarCuerpo() {
    if (bloqueado || !cuerpoRef.current) return;
    setEstadoCuerpo("guardando");
    const resultado = await guardarCuerpoEmail(piezaId, sanearHtml(cuerpoRef.current.innerHTML));
    setEstadoCuerpo(resultado.error ? "error" : "guardado");
  }

  async function guardarVista() {
    if (bloqueado) return;
    setEstadoVista("guardando");
    const resultado = await guardarVistaPreviaEmail(piezaId, vista);
    setEstadoVista(resultado.error ? "error" : "guardado");
  }

  function alEscribirCuerpo() {
    setEstadoCuerpo("reposo");
    if (temporizadorCuerpo.current) window.clearTimeout(temporizadorCuerpo.current);
    temporizadorCuerpo.current = window.setTimeout(() => {
      void guardarCuerpo();
    }, RETARDO);
  }

  function alEscribirVista(valor: string) {
    setVista(valor);
    setEstadoVista("reposo");
    if (temporizadorVista.current) window.clearTimeout(temporizadorVista.current);
    temporizadorVista.current = window.setTimeout(() => {
      void guardarVista();
    }, RETARDO);
  }

  function aplicar(comando: string, valor?: string) {
    if (bloqueado) return;
    cuerpoRef.current?.focus();
    document.execCommand(comando, false, valor);
    alEscribirCuerpo();
  }

  function insertarEnlace() {
    if (bloqueado) return;
    const url = window.prompt("Dirección del enlace (https://…)");
    if (!url) return;
    if (!/^(https?:\/\/|mailto:)/i.test(url.trim())) {
      window.alert("Usa un enlace que empiece por https:// o mailto:.");
      return;
    }
    aplicar("createLink", url.trim());
  }

  function alPegar(evento: React.ClipboardEvent<HTMLDivElement>) {
    if (bloqueado) return;
    const html = evento.clipboardData.getData("text/html");
    const plano = evento.clipboardData.getData("text/plain");
    if (!html && !plano) return;
    evento.preventDefault();
    const limpio = html ? sanearHtml(html) : "";
    document.execCommand(limpio ? "insertHTML" : "insertText", false, limpio || plano);
    alEscribirCuerpo();
  }

  async function copiar(texto: string, destino: Copiado) {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(destino);
    } catch {
      setCopiado("error");
    }
    window.setTimeout(() => setCopiado(null), 2200);
  }

  async function copiarCuerpo() {
    const html = sanearHtml(cuerpoRef.current?.innerHTML ?? "");
    const plano = htmlATexto(html);
    try {
      if (navigator.clipboard && typeof ClipboardItem !== "undefined") {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
            "text/plain": new Blob([plano], { type: "text/plain" }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(plano);
      }
      setCopiado("cuerpo");
    } catch {
      setCopiado("error");
    }
    window.setTimeout(() => setCopiado(null), 2200);
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Cuerpo del correo</h2>
        <EtiquetaEstado estado={estadoCuerpo} />
      </div>

      <label className="text-sm font-medium">
        Texto de vista previa
        <input
          value={vista}
          onChange={(e) => alEscribirVista(e.target.value)}
          onBlur={() => {
            if (temporizadorVista.current) window.clearTimeout(temporizadorVista.current);
            void guardarVista();
          }}
          maxLength={300}
          disabled={bloqueado}
          className="mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2.5"
        />
      </label>
      <div className="-mt-2 flex items-center justify-between text-xs text-tinta-suave">
        <span>{vista.length}/90 caracteres</span>
        <EtiquetaEstado estado={estadoVista} />
      </div>

      <div className="overflow-hidden rounded-tarjeta border border-borde">
        <div className="flex flex-wrap gap-1 border-b border-borde bg-fondo-suave p-2" role="toolbar" aria-label="Formato del cuerpo">
          <BotonFormato etiqueta="Negrita" onClick={() => aplicar("bold")}><Bold className="h-4 w-4" /></BotonFormato>
          <BotonFormato etiqueta="Cursiva" onClick={() => aplicar("italic")}><Italic className="h-4 w-4" /></BotonFormato>
          <BotonFormato etiqueta="Título" onClick={() => aplicar("formatBlock", "<h2>")}><Type className="h-4 w-4" /><span className="text-xs">H2</span></BotonFormato>
          <BotonFormato etiqueta="Subtítulo" onClick={() => aplicar("formatBlock", "<h3>")}><Type className="h-3.5 w-3.5" /><span className="text-xs">H3</span></BotonFormato>
          <BotonFormato etiqueta="Lista con viñetas" onClick={() => aplicar("insertUnorderedList")}><List className="h-4 w-4" /></BotonFormato>
          <BotonFormato etiqueta="Lista numerada" onClick={() => aplicar("insertOrderedList")}><ListOrdered className="h-4 w-4" /></BotonFormato>
          <BotonFormato etiqueta="Cita" onClick={() => aplicar("formatBlock", "<blockquote>")}><Quote className="h-4 w-4" /></BotonFormato>
          <BotonFormato etiqueta="Enlace" onClick={insertarEnlace}><Link2 className="h-4 w-4" /></BotonFormato>
          <BotonFormato etiqueta="Separador" onClick={() => aplicar("insertHorizontalRule")}><Minus className="h-4 w-4" /></BotonFormato>
          <BotonFormato etiqueta="Deshacer" onClick={() => aplicar("undo")}><Undo2 className="h-4 w-4" /></BotonFormato>
          <BotonFormato etiqueta="Rehacer" onClick={() => aplicar("redo")}><Redo2 className="h-4 w-4" /></BotonFormato>
        </div>
        <div
          ref={cuerpoRef}
          contentEditable={!bloqueado}
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Cuerpo del correo"
          onInput={alEscribirCuerpo}
          onBlur={() => {
            if (temporizadorCuerpo.current) window.clearTimeout(temporizadorCuerpo.current);
            void guardarCuerpo();
          }}
          onPaste={alPegar}
          dangerouslySetInnerHTML={{ __html: sanearHtml(htmlInicial) }}
          className="cuerpo-correo min-h-[280px] bg-fondo px-4 py-4 outline-none [&_a]:text-verde-700 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-borde [&_blockquote]:pl-4 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_hr]:my-4 [&_hr]:border-borde [&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-2 [&_ul]:list-disc"
        />
      </div>
      {!htmlATexto(htmlInicial) && !bloqueado && <p className="text-sm text-tinta-suave">Escribe el correo encima. Se guarda solo mientras escribes.</p>}

      <div className="sticky bottom-20 z-10 flex flex-wrap gap-2 rounded-tarjeta border border-borde bg-fondo p-3 shadow-sm md:bottom-4">
        <button type="button" onClick={() => void copiar(asuntoElegido, "asunto")} className={botonSecundario}>Copiar asunto</button>
        <button type="button" onClick={() => void copiar(vista, "vista")} className={botonSecundario}>Copiar texto de vista previa</button>
        <button type="button" onClick={() => void copiarCuerpo()} className={botonSecundario}>Copiar cuerpo con formato</button>
        <span role="status" className="self-center text-sm text-verde-700">
          {copiado === "error" ? "No se pudo copiar" : copiado ? "Copiado ✓" : ""}
        </span>
      </div>
    </section>
  );
}

function BotonFormato({ etiqueta, onClick, children }: { etiqueta: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={etiqueta}
      aria-label={etiqueta}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="inline-flex min-h-9 items-center gap-1 rounded-boton border border-borde bg-fondo px-2 text-tinta hover:bg-verde-50"
    >
      {children}
    </button>
  );
}
