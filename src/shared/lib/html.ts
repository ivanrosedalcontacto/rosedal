/**
 * Saneado de HTML del cuerpo de un correo.
 * Solo se permite el formato que ofrece el editor: párrafos, negrita, cursiva,
 * dos niveles de título, listas, cita, enlaces y separador.
 */

const PERMITIDAS = new Set([
  "p", "div", "br", "strong", "b", "em", "i", "h2", "h3",
  "ul", "ol", "li", "blockquote", "a", "hr",
]);

const VACIAS = new Set(["br", "hr"]);

const PELIGROSAS =
  /<\s*(script|style|iframe|object|embed|form|input|textarea|select|button|img|svg|math|link|meta|video|audio|canvas)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;

const PELIGROSAS_SUELTAS =
  /<\s*\/?\s*(script|style|iframe|object|embed|form|input|textarea|select|button|img|svg|math|link|meta|video|audio|canvas)[^>]*\/?\s*>/gi;

function enlaceSeguro(atributos: string): string | null {
  const encontrado = /href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(atributos);
  const href = (encontrado?.[1] ?? encontrado?.[2] ?? encontrado?.[3] ?? "").trim();
  if (!/^(https?:\/\/|mailto:)/i.test(href)) return null;
  return href.replace(/"/g, "&quot;").replace(/[\u0000-\u001f]/g, "");
}

/** Devuelve solo las etiquetas y atributos permitidos; el texto se conserva. */
export function sanearHtml(valor: string): string {
  let html = valor.slice(0, 200_000);
  html = html.replace(/<!--[\s\S]*?-->/g, "");
  html = html.replace(PELIGROSAS, "");
  html = html.replace(PELIGROSAS_SUELTAS, "");
  html = html.replace(/<(\/?)([a-zA-Z0-9]+)([^>]*)>/g, (_coincidencia, cierre: string, etiqueta: string, atributos: string) => {
    const tag = etiqueta.toLowerCase();
    if (cierre) {
      if (!PERMITIDAS.has(tag) || VACIAS.has(tag)) return "";
      return `</${tag}>`;
    }
    if (!PERMITIDAS.has(tag)) return "";
    if (tag === "b") return "<strong>";
    if (tag === "i") return "<em>";
    if (tag === "a") {
      const href = enlaceSeguro(atributos);
      return href ? `<a href="${href}">` : "<a>";
    }
    return `<${tag}>`;
  });
  // Cualquier `<` que no forme parte de una etiqueta permitida se muestra como texto.
  html = html.replace(/<(?!\/?(p|div|br|strong|em|h2|h3|ul|ol|li|blockquote|a|hr)(\s|>|\/))/gi, "&lt;");
  return html.trim();
}

const ENTIDADES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&hellip;": "…",
  "&mdash;": "—",
  "&ndash;": "–",
};

/** Texto plano equivalente, para el portapapeles y para comprobar si está vacío. */
export function htmlATexto(valor: string): string {
  let texto = valor
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<hr\s*\/?>/gi, "\n---\n")
    .replace(/<\/(p|div|h2|h3|blockquote|li)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, "");
  texto = texto.replace(/&(nbsp|amp|lt|gt|quot|#39|apos|hellip|mdash|ndash);/g, (m) => ENTIDADES[m] ?? m);
  texto = texto.replace(/&#(\d+);/g, (_m, codigo: string) => {
    const numero = Number(codigo);
    return Number.isInteger(numero) && numero >= 0 && numero <= 0x10ffff ? String.fromCodePoint(numero) : "";
  });
  return texto.replace(/\n{3,}/g, "\n\n").trim();
}

export function esHtmlVacio(valor: string): boolean {
  return htmlATexto(valor).trim().length === 0;
}

export function escaparHtml(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
