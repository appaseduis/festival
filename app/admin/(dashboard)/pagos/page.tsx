import { listarInscripcionesPagoAction } from "@/app/actions/pagos-admin";
import GestionPagos from "@/components/admin/GestionPagos";

export default async function PaginaPagos() {
  const inscripciones = await listarInscripcionesPagoAction("pendientes");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pagos</h1>
      <GestionPagos inscripcionesIniciales={inscripciones} />
    </div>
  );
}