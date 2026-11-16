import { BotonesCaptura } from "@/features/captura/botones-captura";

function fechaDeHoy(): string {
  const texto = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Madrid",
  }).format(new Date());
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function Hoy() {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-8 md:px-10 md:py-12">
      <div>
        <h1 className="font-serif text-2xl md:text-[28px]">Hoy</h1>
        <p className="mt-1 text-tinta-suave">{fechaDeHoy()}</p>
      </div>
      <BotonesCaptura />
      <p className="rounded-tarjeta bg-verde-50 px-4 py-6 text-tinta-suave">
        Aquí verás lo que preparar, lo que sale hoy y tu próximo hito. Llegará con el calendario.
      </p>
    </div>
  );
}
