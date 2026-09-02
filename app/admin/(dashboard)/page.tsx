import { obtenerEstadisticasAction } from "@/app/actions/dashboard";

function formatoCOP(valor: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}

function BarraProgreso({
  actual,
  meta,
  color,
}: {
  actual: number;
  meta: number;
  color: string;
}) {
  const porcentaje = meta > 0 ? Math.min(100, Math.round((actual / meta) * 100)) : 0;

  return (
    <div className="mt-2">
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${porcentaje}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-[11px] text-gray-400 mt-1">{porcentaje}%</p>
    </div>
  );
}

function TarjetaKPI({
  icono,
  label,
  valor,
  color,
}: {
  icono: string;
  label: string;
  valor: string | number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{ backgroundColor: `${color}1A` }}
      >
        {icono}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className="text-xl font-bold text-navy leading-tight">{valor}</p>
      </div>
    </div>
  );
}

export default async function PaginaDashboard() {
  const stats = await obtenerEstadisticasAction();

  const recaudoTotal = stats.totalRecaudado + stats.recaudadoBarismo;

  const secciones = [
    {
      titulo: "Inscripciones · Egresados",
      icono: "🎓",
      color: "#002855",
      tarjetas: [
        { label: "Total egresados", valor: stats.totalEgresados },
        { label: "Acompañantes", valor: stats.totalAcompanantes },
        { label: "Confirmadas", valor: stats.confirmadas },
        { label: "Pendientes", valor: stats.pendientes },
      ],
    },
    {
      titulo: "Kit Festivalero",
      icono: "🎁",
      color: "#7AB800",
      progreso: { actual: stats.kitsEntregados, meta: stats.kitsNecesarios },
      tarjetas: [
        { label: "Necesarios", valor: stats.kitsNecesarios },
        { label: "Entregados", valor: stats.kitsEntregados },
      ],
    },
    {
      titulo: "Fichos de almuerzo",
      icono: "🍽️",
      color: "#52B4D8",
      progreso: { actual: stats.fichosEntregados, meta: stats.fichosNecesarios },
      tarjetas: [
        { label: "Necesarios", valor: stats.fichosNecesarios },
        { label: "Entregados", valor: stats.fichosEntregados },
      ],
    },
    {
      titulo: "Talento Cultural",
      icono: "🎭",
      color: "#00A3E0",
      tarjetas: [{ label: "Propuestas recibidas", valor: stats.totalPropuestasTalento }],
    },
    {
      titulo: "Competencia de Barismo",
      icono: "☕",
      color: "#2BB673",
      progreso: { actual: stats.cuposBarismoOcupados, meta: 18 },
      tarjetas: [
        { label: "Cupos ocupados (de 18)", valor: stats.cuposBarismoOcupados },
        { label: "Recaudado", valor: formatoCOP(stats.recaudadoBarismo) },
      ],
    },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Resumen general del Festival del Egresado UIS</p>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <TarjetaKPI icono="💰" label="Recaudo total" valor={formatoCOP(recaudoTotal)} color="#00A3E0" />
        <TarjetaKPI icono="🎓" label="Egresados confirmados" valor={stats.confirmadas} color="#002855" />
        <TarjetaKPI icono="🎁" label="Kits entregados" valor={`${stats.kitsEntregados} / ${stats.kitsNecesarios}`} color="#7AB800" />
        <TarjetaKPI icono="☕" label="Cupos barismo" valor={`${stats.cuposBarismoOcupados} / 18`} color="#2BB673" />
      </div>

      {/* Secciones detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {secciones.map((seccion) => (
          <div key={seccion.titulo} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">{seccion.icono}</span>
              <h2 className="text-sm font-semibold text-navy">{seccion.titulo}</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {seccion.tarjetas.map((t) => (
                <div
                  key={t.label}
                  className="rounded-xl p-3 border-l-4"
                  style={{ borderLeftColor: seccion.color, backgroundColor: `${seccion.color}0D` }}
                >
                  <p className="text-xs text-gray-500">{t.label}</p>
                  <p className="text-lg font-bold text-navy mt-0.5">{t.valor}</p>
                </div>
              ))}
            </div>

            {seccion.progreso && (
              <BarraProgreso
                actual={seccion.progreso.actual}
                meta={seccion.progreso.meta}
                color={seccion.color}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}