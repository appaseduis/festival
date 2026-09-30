import { obtenerConfigExternosAction } from "@/app/actions/emprendimientoExterno";
import { formatoPrecioExterno } from "@/lib/validations/emprendimientosExternos";
import FormularioEmprendimientoExterno from "@/components/emprendimientos-externos/FormularioEmprendimientoExterno";

export const dynamic = "force-dynamic";

const HORARIO = [
  { dia: "Viernes", horas: "2:00 p. m. – 7:00 p. m." },
  { dia: "Sábado", horas: "9:00 a. m. – 7:00 p. m." },
  { dia: "Domingo", horas: "9:00 a. m. – 1:00 p. m." },
];

export default async function EmprendimientosExternosPage() {
  const cfg = await obtenerConfigExternosAction();

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

      <div className="max-w-2xl mx-auto space-y-6 px-3 sm:px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-cyan p-6 md:p-8 space-y-4">
          <span className="inline-block text-xs font-bold uppercase tracking-wide bg-cyan/10 text-cyan px-3 py-1 rounded-full">
            Emprendimientos externos
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-navy">
            Preinscripción de Emprendimientos Externos
          </h1>
          <p className="text-sm text-gray-600">
            Convocatoria dirigida a emprendimientos <strong>externos</strong> (no egresados UIS)
            que deseen participar en la feria del Festival del Egresado UIS.
          </p>

          <div className="rounded-lg bg-navy/5 p-3 text-sm text-navy">
            <strong>Valor de participación:</strong> {formatoPrecioExterno(cfg.precio)}
            <span className="block text-xs text-gray-500">
              Tarifa única para todos los emprendimientos externos.
            </span>
          </div>

          <div className="rounded-lg bg-navy/5 p-3 text-sm text-navy">
            <p className="font-semibold mb-2">🕒 Horario de la feria</p>
            <ul className="space-y-1">
              {HORARIO.map((h) => (
                <li key={h.dia} className="flex justify-between gap-3">
                  <span className="font-medium">{h.dia}</span>
                  <span className="text-gray-600">{h.horas}</span>
                </li>
              ))}
            </ul>
          </div>

          {cfg.linkEventos && (
            <a
              href={cfg.linkEventos}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-uis-green px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              📅 Ver eventos del festival
            </a>
          )}
          <p className="text-xs bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3">
            Este formulario es una <strong>preinscripción</strong>. No se realiza ningún pago en este momento. El equipo de ASEDUIS llevará a cabo la revisión y selección de los emprendimientos, bajo criterios  establecidos por la misma Asociación.
          </p>
        </div>

        {cfg.abierto ? (
          <FormularioEmprendimientoExterno linkEventos={cfg.linkEventos} />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center text-sm text-gray-600">
            La preinscripción de emprendimientos externos está cerrada.
          </div>
        )}
      </div>
    </main>
  );
}