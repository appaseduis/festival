"use client";

const EXPORTACIONES = [
  { href: "/api/exportar/inscritos", label: "Inscritos" },
  { href: "/api/exportar/acompanantes", label: "Acompañantes" },
  { href: "/api/exportar/camisetas", label: "Camisetas" },
  { href: "/api/exportar/pagos", label: "Pagos" },
  { href: "/api/exportar/fichos", label: "Fichos" },
  { href: "/api/exportar/entregas", label: "Control de entregas" },
  { href: "/api/exportar/emprendimientos", label: "Emprendimientos" },
  { href: "/api/exportar/talento", label: "Talento Cultural" },
  { href: "/api/exportar/barismo", label: "Barismo" },
];

export default function PanelExportaciones() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Exportar a Excel</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {EXPORTACIONES.map((exp) => {
          return (
            <a
              key={exp.href}
              href={exp.href}
              className="text-center py-3 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50"
            >
              {exp.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}