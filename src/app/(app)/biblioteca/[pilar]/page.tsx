import { CarpetaPilar } from "@/features/piezas/carpeta-pilar";

export default async function Page({ params }: { params: Promise<{ pilar: string }> }) {
  const { pilar } = await params;
  return (
    <div className="mx-auto max-w-[900px] px-4 py-8 md:px-10 md:py-12">
      <CarpetaPilar pilarId={pilar} />
    </div>
  );
}
