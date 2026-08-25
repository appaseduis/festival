import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { aplicarEstiloEncabezado, autoajustarColumnas } from "@/lib/excel/estilos";

export async function GET() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("inscritos")
    .select("nombres_completos, documento, cantidad_acompanantes, cantidad_fichos, fichos_entregados, fecha_fichos, responsable_fichos")
    .eq("estado_inscripcion", "confirmada")
    .order("nombres_completos", { ascending: true });

  if (error || !data) {
    return NextResponse.json({ error: "No se pudieron obtener los fichos" }, { status: 500 });
  }

  const workbook = new ExcelJS.Workbook();
  const hoja = workbook.addWorksheet("Fichos");

  hoja.columns = [
    { header: "Egresado", key: "egresado" },
    { header: "Documento", key: "documento" },
    { header: "Acompañantes", key: "acompanantes" },
    { header: "Fichos requeridos", key: "fichos_requeridos" },
    { header: "Entregados", key: "entregados" },
    { header: "Fecha entrega", key: "fecha" },
    { header: "Responsable", key: "responsable" },
  ];

  for (const i of data) {
    hoja.addRow({
      egresado: i.nombres_completos,
      documento: i.documento,
      acompanantes: i.cantidad_acompanantes,
      fichos_requeridos: i.cantidad_fichos,
      entregados: i.fichos_entregados ? "Sí" : "No",
      fecha: i.fecha_fichos ? new Date(i.fecha_fichos).toLocaleString("es-CO") : "",
      responsable: i.responsable_fichos ?? "",
    });
  }

  aplicarEstiloEncabezado(hoja.getRow(1));
  autoajustarColumnas(hoja);

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="fichos.xlsx"`,
    },
  });
}