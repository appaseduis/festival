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
    <main className="min-h-screen bg-[#F4F6F9]">
      {/* Banner institucional */}
      <div className="w-full bg-white">
        <img
          src="/banner-festival.png"
          alt="2do Festival del Egresado UIS — Nos vemos en octubre"
          className="w-full h-auto"
        />
      </div>

      {/* Onda de transición, en el lenguaje visual del banner */}
      <svg
        viewBox="0 0 1440 40"
        className="w-full h-6 md:h-10 -mt-1"
        preserveAspectRatio="none"
      >
        <path
          d="M0,20 C360,45 1080,-5 1440,20 L1440,0 L0,0 Z"
          fill="#F4F6F9"
        />
        <path
          d="M0,25 C360,45 1080,5 1440,25"
          fill="none"
          stroke="#52B4D8"
          strokeWidth="2"
          opacity="0.5"
        />
      </svg>

      <div className="max-w-2xl mx-auto px-4 pb-12 -mt-2">
        <header className="text-center mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-navy">
            {config.nombre_evento}
          </h1>
          <p className="text-[#002855]/70 mt-2">
            {config.lugar} ·{" "}
            {new Date(config.fecha_inicio + "T00:00:00").toLocaleDateString("es-CO", {
              day: "numeric",
              month: "long",
            })}{" "}
            al{" "}
            {new Date(config.fecha_fin + "T00:00:00").toLocaleDateString("es-CO", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </header>

        <WizardInscripcion config={config} tallas={tallas} actividades={actividades} />
      </div>
    </main>
  );
}