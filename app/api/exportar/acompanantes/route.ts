import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { aplicarEstiloEncabezado, autoajustarColumnas } from "@/lib/excel/estilos";

export async function GET() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("acompanantes")
    .select("nombre, documento, edad, inscritos(nombres_completos, documento)")
    .order("created_at", { ascending: true });

  if (error || !data) {
    return NextResponse.json({ error: "No se pudieron obtener los acompañantes" }, { status: 500 });
  }

  const workbook = new ExcelJS.Workbook();
  const hoja = workbook.addWorksheet("Acompañantes");

  hoja.columns = [
    { header: "Nombre acompañante", key: "nombre" },
    { header: "Documento acompañante", key: "documento" },
    { header: "Edad", key: "edad" },
    { header: "Egresado asociado", key: "egresado_nombre" },
    { header: "Documento egresado", key: "egresado_documento" },
  ];

  for (const a of data) {
    const inscrito = a.inscritos as unknown as { nombres_completos: string; documento: string } | null;
    hoja.addRow({
      nombre: a.nombre,
      documento: a.documento,
      edad: a.edad,
      egresado_nombre: inscrito?.nombres_completos ?? "",
      egresado_documento: inscrito?.documento ?? "",
    });
  }

  aplicarEstiloEncabezado(hoja.getRow(1));
  autoajustarColumnas(hoja);

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="acompanantes.xlsx"`,
    },
  });
}