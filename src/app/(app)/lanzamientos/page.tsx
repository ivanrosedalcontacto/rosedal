import { ListaLanzamientos } from "@/features/lanzamientos/lista";

export default function Lanzamientos() {
  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6 px-4 py-8 md:px-10 md:py-12">
      <div>
        <h1 className="font-serif text-2xl md:text-[28px]">Lanzamientos</h1>
        <p className="mt-2 text-tinta-suave">Prepara una oferta con sus fases, sus hitos y las piezas que la cuentan.</p>
      </div>
      <ListaLanzamientos />
    </div>
  );
}
