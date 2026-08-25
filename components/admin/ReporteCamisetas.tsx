"use client";

import type { ReporteCamisetas } from "@/app/actions/reportes";

export default function ReporteCamisetasCard({ reporte }: { reporte: ReporteCamisetas }) {
  const masculino = reporte.filas.filter((f) => f.genero === "M");
  const femenino = reporte.filas.filter((f) => f.genero === "F");

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Reporte de camisetas</h3>
        <span className="text-sm text-gray-500">Total de kits: {reporte.total}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Masculino</p>
          <div className="space-y-1">
            {masculino.length === 0 && <p className="text-sm text-gray-400">Sin datos</p>}
            {masculino.map((f) => (
              <div key={f.talla} className="flex justify-between text-sm border-b border-gray-100 py-1">
                <span>{f.talla}</span>
                <span className="font-medium">{f.cantidad}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Femenino</p>
          <div className="space-y-1">
            {femenino.length === 0 && <p className="text-sm text-gray-400">Sin datos</p>}
            {femenino.map((f) => (
              <div key={f.talla} className="flex justify-between text-sm border-b border-gray-100 py-1">
                <span>{f.talla}</span>
                <span className="font-medium">{f.cantidad}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}