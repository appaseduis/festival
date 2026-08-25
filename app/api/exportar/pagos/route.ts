import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { aplicarEstiloEncabezado, autoajustarColumnas } from "@/lib/excel/estilos";

export async function GET() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("pagos")
    .select("*, inscritos(nombres_completos, documento)")
    .order("fecha", { ascending: true });

  if (error || !data) {
    return NextResponse.json({ error: "No se pudieron obtener los pagos" }, { status: 500 });
  }

  const workbook = new ExcelJS.Workbook();
  const hoja = workbook.addWorksheet("Pagos");

  hoja.columns = [
    { header: "Egresado", key: "egresado" },
    { header: "Documento", key: "documento" },
    { header: "Monto", key: "monto" },
    { header: "Método", key: "metodo" },
    { header: "Estado", key: "estado" },
    { header: "Confirmado por", key: "confirmado_por" },
    { header: "Fecha", key: "fecha" },
  ];

  for (const p of data) {
    const inscrito = p.inscritos as unknown as { nombres_completos: string; documento: string } | null;
    hoja.addRow({
      egresado: inscrito?.nombres_completos ?? "",
      documento: inscrito?.documento ?? "",
      monto: Number(p.monto),
      metodo: p.metodo,
      estado: p.estado,
      confirmado_por: p.confirmado_por ?? "",
      fecha: new Date(p.fecha).toLocaleString("es-CO"),
    });
  }

  aplicarEstiloEncabezado(hoja.getRow(1));
  autoajustarColumnas(hoja);

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="pagos.xlsx"`,
    },
  });
}