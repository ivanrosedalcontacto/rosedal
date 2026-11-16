import { create } from "zustand";
import type { TipoCaptura } from "./tipos";

type Almacen = {
  abierta: TipoCaptura | null;
  abrir: (tipo: TipoCaptura) => void;
  cerrar: () => void;
};

/** Qué hoja de captura está abierta. Solo estado de interfaz. */
export const useCaptura = create<Almacen>((set) => ({
  abierta: null,
  abrir: (tipo) => set({ abierta: tipo }),
  cerrar: () => set({ abierta: null }),
}));
