"use client";

import { useActionState } from "react";
import { iniciarSesion, type EstadoLogin } from "./acciones";

const inicial: EstadoLogin = { error: null };

export function FormularioLogin() {
  const [estado, accion, pendiente] = useActionState(iniciarSesion, inicial);
  const campo =
    "mt-1 w-full rounded-boton border border-borde bg-fondo px-3 py-2.5 focus:border-verde-300";
  return (
    <form action={accion} className="mt-8 flex flex-col gap-4">
      <label className="text-sm font-medium">
        Correo
        <input name="email" type="email" autoComplete="email" required className={campo} />
      </label>
      <label className="text-sm font-medium">
        Contraseña
        <input name="password" type="password" autoComplete="current-password" required className={campo} />
      </label>
      {estado.error && (
        <p role="alert" className="rounded-boton bg-error-fondo px-3 py-2 text-sm text-error">
          {estado.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pendiente}
        className="min-h-11 rounded-boton bg-verde-700 px-4 py-2.5 font-medium text-white disabled:opacity-60"
      >
        {pendiente ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
