import { listarEmprendimientosAction } from "@/app/actions/emprendimiento";
import GestionEmprendimientos from "@/components/admin/GestionEmprendimientos";

export default async function PaginaEmprendimientosAdmin() {
  const emprendimientos = await listarEmprendimientosAction("todos");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Emprendimientos</h1>
      <GestionEmprendimientos emprendimientosIniciales={emprendimientos} />
    </div>
  );
}