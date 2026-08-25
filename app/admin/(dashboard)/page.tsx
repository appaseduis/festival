import { obtenerEstadisticasAction } from "@/app/actions/dashboard";

function formatoCOP(valor: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}

export default async function PaginaDashboard() {
  const stats = await obtenerEstadisticasAction();

  const grupos = [
    {
      titulo: "Inscripciones",
      color: "#002855",
      tarjetas: [
        { label: "Total egresados", valor: stats.totalEgresados },
        { label: "Total acompañantes", valor: stats.totalAcompanantes },
        { label: "Confirmadas", valor: stats.confirmadas },
        { label: "Pendientes", valor: stats.pendientes },
      ],
    },
    {
      titulo: "Recaudo",
      color: "#00A3E0",
      tarjetas: [{ label: "Total recaudado", valor: formatoCOP(stats.totalRecaudado) }],
    },
    {
      titulo: "Kits",
      color: "#7AB800",
      tarjetas: [
        { label: "Kits necesarios", valor: stats.kitsNecesarios },
        { label: "Kits entregados", valor: stats.kitsEntregados },
      ],
    },
    {
      titulo: "Fichos de almuerzo",
      color: "#52B4D8",
      tarjetas: [
        { label: "Fichos necesarios", valor: stats.fichosNecesarios },
        { label: "Fichos entregados", valor: stats.fichosEntregados },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold text-navy">Dashboard</h1>

      {grupos.map((grupo) => (
        <div key={grupo.titulo}>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {grupo.titulo}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {grupo.tarjetas.map((t) => (
              <div
                key={t.label}
                className="bg-white rounded-xl border border-gray-200 p-4 border-l-4"
                style={{ borderLeftColor: grupo.color }}
              >
                <p className="text-xs text-gray-500">{t.label}</p>
                <p className="text-2xl font-bold text-navy mt-1">{t.valor}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}