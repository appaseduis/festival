import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { aplicarEstiloEncabezado, autoajustarColumnas } from "@/lib/excel/estilos";

export async function GET() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("competencia_barismo")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !data) {
    return NextResponse.json({ error: "No se pudieron obtener las inscripciones" }, { status: 500 });
  }

  const workbook = new ExcelJS.Workbook();
  const hoja = workbook.addWorksheet("Barismo");

  hoja.columns = [
    { header: "Nombre completo", key: "nombre_completo" },
    { header: "WhatsApp", key: "whatsapp" },
    { header: "Correo", key: "correo" },
    { header: "Documento", key: "documento" },
    { header: "Marca/Cafetería", key: "marca" },
    { header: "Experiencia", key: "experiencia" },
    { header: "Método Fase 1", key: "metodo_fase1" },
    { header: "Total", key: "total" },
    { header: "Método de pago", key: "metodo_pago" },
    { header: "Estado", key: "estado_pago" },
    { header: "Fecha", key: "created_at" },
  ];

  for (const i of data) {
    hoja.addRow({
      nombre_completo: i.nombre_completo,
      whatsapp: i.whatsapp,
      correo: i.correo,
      documento: i.documento,
      marca: i.representa_marca ? i.marca_nombre : "Independiente",
      experiencia: i.experiencia,
      metodo_fase1: i.metodo_fase1,
      total: Number(i.total),
      metodo_pago: i.metodo_pago ?? "",
      estado_pago: i.estado_pago,
      created_at: new Date(i.created_at).toLocaleString("es-CO"),
    });
  }

  aplicarEstiloEncabezado(hoja.getRow(1));
  autoajustarColumnas(hoja);

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="barismo.xlsx"`,
    },
  });
}