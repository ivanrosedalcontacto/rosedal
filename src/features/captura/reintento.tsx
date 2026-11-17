"use client";

import { useEffect } from "react";
import { capturar } from "./acciones";
import { leerCola, quitarDeLaCola } from "./cola";

/**
 * Envía las capturas que quedaron en el dispositivo por falta de conexión.
 * Se prueba al abrir la app y cada vez que vuelve la red.
 */
export function ReintentoDeCapturas() {
  useEffect(() => {
    async function enviar() {
      const cola = leerCola();
      for (const captura of cola) {
        const r = await capturar(captura.tipo, captura.texto);
        if (!r.error) quitarDeLaCola(captura.texto);
      }
    }
    void enviar();
    window.addEventListener("online", enviar);
    return () => window.removeEventListener("online", enviar);
  }, []);

  return null;
}
