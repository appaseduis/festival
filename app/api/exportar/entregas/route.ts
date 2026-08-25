import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { aplicarEstiloEncabezado, autoajustarColumnas } from "@/lib/excel/estilos";

export async function GET() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("entregas")
    .select("tipo, cantidad, fecha_hora, responsable, inscritos(nombres_completos, documento)")
    .order("fecha_hora", { ascending: true });

  if (error || !data) {
    return NextResponse.json({ error: "No se pudieron obtener las entregas" }, { status: 500 });
  }

  const workbook = new ExcelJS.Workbook();
  const hoja = workbook.addWorksheet("Control de entregas");

  hoja.columns = [
    { header: "Egresado", key: "egresado" },
    { header: "Documento", key: "documento" },
    { header: "Tipo de entrega", key: "tipo" },
    { header: "Cantidad", key: "cantidad" },
    { header: "Fecha y hora", key: "fecha" },
    { header: "Responsable", key: "responsable" },
  ];

  for (const e of data) {
    const inscrito = e.inscritos as unknown as { nombres_completos: string; documento: string } | null;
    hoja.addRow({
      egresado: inscrito?.nombres_completos ?? "",
      documento: inscrito?.documento ?? "",
      tipo: e.tipo === "KIT" ? "Kit Festivalero" : "Fichos de almuerzo",
      cantidad: e.cantidad,
      fecha: new Date(e.fecha_hora).toLocaleString("es-CO"),
      responsable: e.responsable,
    });
  }

  aplicarEstiloEncabezado(hoja.getRow(1));
  autoajustarColumnas(hoja);

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="control_entregas.xlsx"`,
    },
  });
}