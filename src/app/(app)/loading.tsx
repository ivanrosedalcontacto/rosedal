/** Se muestra al instante al cambiar de pantalla, mientras el servidor prepara la siguiente. */
export default function Cargando() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4 animate-pulse">
      <span className="sr-only">Cargando…</span>
      <div className="h-8 w-48 rounded-boton bg-fondo-suave" />
      <div className="h-24 rounded-tarjeta bg-fondo-suave" />
      <div className="h-24 rounded-tarjeta bg-fondo-suave" />
      <div className="h-24 rounded-tarjeta bg-fondo-suave" />
    </div>
  );
}
