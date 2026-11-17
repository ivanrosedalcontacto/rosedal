import { HojaCaptura } from "@/features/captura/hoja-captura";
import { AperturaPorUrl } from "@/features/captura/apertura-url";
import { ReintentoDeCapturas } from "@/features/captura/reintento";
import { NavLateral } from "@/shared/components/nav-lateral";
import { NavMovil } from "@/shared/components/nav-movil";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <NavLateral />
      <main className="min-w-0 flex-1 pb-24 md:pb-0">{children}</main>
      <NavMovil />
      <HojaCaptura />
      <ReintentoDeCapturas />
      <AperturaPorUrl />
    </div>
  );
}
