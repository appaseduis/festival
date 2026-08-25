import { listarInscritosAction } from "@/app/actions/inscritos-admin";
import TablaInscritos from "@/components/admin/TablaInscritos";

export default async function PaginaInscritos() {
  const inscritos = await listarInscritosAction("");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Inscritos</h1>
      <TablaInscritos inscritosIniciales={inscritos} />
    </div>
  );
}