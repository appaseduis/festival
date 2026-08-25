import { obtenerDatosFormularioAction } from "@/app/actions/inscripcion";
import WizardInscripcion from "@/components/inscripcion/WizardInscripcion";

export default async function PaginaInscripcion() {
  const { config, tallas, actividades } = await obtenerDatosFormularioAction();

  if (!config) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <p className="text-center text-red-600">
          No se pudo cargar la información del evento. Intenta más tarde.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 pb-12 -mt-2">
        <header className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {config.nombre_evento}
          </h1>
          <p className="text-gray-600 mt-2">
            {config.lugar} · {new Date(config.fecha_inicio + "T00:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "long" })} al{" "}
            {new Date(config.fecha_fin + "T00:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </header>

        <WizardInscripcion
          config={config}
          tallas={tallas}
          actividades={actividades}
        />
      </div>
    </main>
  );
}