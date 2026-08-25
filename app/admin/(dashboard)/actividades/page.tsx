import { listarActividadesAction } from "@/app/actions/actividades";
import GestionActividades from "@/components/admin/GestionActividades";

export default async function PaginaActividades() {
  const actividades = await listarActividadesAction();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Deportes y actividades</h1>
      <GestionActividades actividadesIniciales={actividades} />
    </div>
  );
}