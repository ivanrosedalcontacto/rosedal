export type Resultado = { error: string | null; ok?: boolean };

/** Aviso de error o de «Guardado» tras una acción de formulario. */
export function MensajeResultado({ r }: { r: Resultado }) {
  if (r.error) {
    return (
      <p role="alert" className="rounded-boton bg-error-fondo px-3 py-2 text-sm text-error">
        {r.error}
      </p>
    );
  }
  if (r.ok) {
    return (
      <p role="status" className="text-sm text-verde-700">
        Guardado ✓
      </p>
    );
  }
  return null;
}
