import { obtenerDatosPagoExternoAction } from "@/app/actions/emprendimientoExterno";
import PaginaPagoExternoCliente from "@/components/emprendimientos-externos/PaginaPagoExternoCliente";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PaginaPagoExterno({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const datos = await obtenerDatosPagoExternoAction(id);

  if (!datos) notFound();

  return (
    <main className="min-h-screen bg-[#F4F6F9]">
      <div className="w-full bg-white">
        <img
          src="/banner-festival.png"
          alt="2do Festival del Egresado UIS"
          className="w-full h-auto"
        />
      </div>

      <div className="max-w-md mx-auto px-3 sm:px-4 py-8">
        <PaginaPagoExternoCliente datosIniciales={datos} />
      </div>
    </main>
  );
}