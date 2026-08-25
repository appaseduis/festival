import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { obtenerReporteCamisetasAction } from "@/app/actions/reportes";
import { aplicarEstiloEncabezado, autoajustarColumnas } from "@/lib/excel/estilos";

export async function GET() {
  await requireAdmin();
  const reporte = await obtenerReporteCamisetasAction();

  const workbook = new ExcelJS.Workbook();
  const hoja = workbook.addWorksheet("Camisetas");

  hoja.columns = [
    { header: "Género", key: "genero" },
    { header: "Talla", key: "talla" },
    { header: "Cantidad", key: "cantidad" },
  ];

  for (const fila of reporte.filas) {
    hoja.addRow({
      genero: fila.genero === "M" ? "Masculino" : "Femenino",
      talla: fila.talla,
      cantidad: fila.cantidad,
    });
  }

  hoja.addRow({});
  const filaTotal = hoja.addRow({ genero: "", talla: "TOTAL DE KITS", cantidad: reporte.total });
  filaTotal.font = { bold: true };

  aplicarEstiloEncabezado(hoja.getRow(1));
  autoajustarColumnas(hoja);

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="camisetas.xlsx"`,
    },
  });
}