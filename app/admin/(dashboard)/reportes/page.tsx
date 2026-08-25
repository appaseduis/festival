import { obtenerReporteCamisetasAction } from "@/app/actions/reportes";
import ReporteCamisetasCard from "@/components/admin/ReporteCamisetas";
import PanelExportaciones from "@/components/admin/PanelExportaciones";

export default async function PaginaReportes() {
  const reporte = await obtenerReporteCamisetasAction();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
      <ReporteCamisetasCard reporte={reporte} />
      <PanelExportaciones />
    </div>
  );
}