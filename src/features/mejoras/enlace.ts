/** Enlace con etiquetas de campaña (B9): añade utm_source, utm_medium y utm_campaign. */
export function enlaceConCampana(url: string, origen: string, medio: string, campana: string): string {
  if (!url || !url.startsWith("http")) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", origen || "rosedal");
    u.searchParams.set("utm_medium", medio || "social");
    u.searchParams.set("utm_campaign", campana || "contenido");
    return u.toString();
  } catch {
    return url;
  }
}
