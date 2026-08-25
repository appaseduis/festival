import { notFound } from "next/navigation";
import { obtenerInscritoDetalleAction } from "@/app/actions/inscritos-admin";
import { obtenerDatosFormularioAction } from "@/app/actions/inscripcion";
import FormularioEditarInscrito from "@/components/admin/FormularioEditarInscrito";

export default async function PaginaDetalleInscrito({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [inscrito, { tallas, actividades }] = await Promise.all([
    obtenerInscritoDetalleAction(id),
    obtenerDatosFormularioAction(),
  ]);

  if (!inscrito) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar inscripción</h1>
      <FormularioEditarInscrito inscrito={inscrito} tallas={tallas} actividades={actividades} />
    </div>
  );
}