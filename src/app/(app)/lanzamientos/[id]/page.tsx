import FichaLanzamiento from "@/features/lanzamientos/ficha";

export default function Lanzamiento({ params }: { params: Promise<{ id: string }> }) {
  return <FichaLanzamiento params={params} />;
}
