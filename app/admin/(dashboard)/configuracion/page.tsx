import { obtenerConfiguracionAction } from "@/app/actions/configuracion";
import FormularioConfiguracion from "@/components/admin/FormularioConfiguracion";

export default async function PaginaConfiguracion() {
  const config = await obtenerConfiguracionAction();

  if (!config) {
    return <p className="text-red-600">No se pudo cargar la configuración.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configuración</h1>
      <FormularioConfiguracion configInicial={config} />
    </div>
  );
}