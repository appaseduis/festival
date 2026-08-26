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
    .select("*, tallas(nombre)")
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("Error obteniendo inscritos para exportar:", error);
    return NextResponse.json({ error: "No se pudieron obtener los inscritos" }, { status: 500 });
  }

  // Traemos las actividades de cada inscrito desde la tabla intermedia
  // (selección múltiple), en una sola consulta adicional.
  const { data: actividadesRelacion } = await supabase
    .from("inscritos_actividades")
    .select("inscrito_id, actividades(nombre)");

  const actividadesPorInscrito = new Map<string, string[]>();
  for (const rel of actividadesRelacion ?? []) {
    const nombre = (rel.actividades as unknown as { nombre: string } | null)?.nombre;
    if (!nombre) continue;
    const lista = actividadesPorInscrito.get(rel.inscrito_id) ?? [];
    lista.push(nombre);
    actividadesPorInscrito.set(rel.inscrito_id, lista);
  }

  const workbook = new ExcelJS.Workbook();
  const hoja = workbook.addWorksheet("Inscritos");

  hoja.columns = [
    { header: "Nombres completos", key: "nombres_completos" },
    { header: "Documento", key: "documento" },
    { header: "Correo", key: "correo" },
    { header: "Celular", key: "celular" },
    { header: "Género", key: "genero" },
    { header: "Programa académico", key: "programa_academico" },
    { header: "Tipo egresado", key: "tipo_egresado" },
    { header: "Talla", key: "talla" },
    { header: "Actividades", key: "actividades" },
    { header: "Acompañantes", key: "cantidad_acompanantes" },
    { header: "Total", key: "total" },
    { header: "Estado pago", key: "estado_pago" },
    { header: "Estado inscripción", key: "estado_inscripcion" },
    { header: "Fecha inscripción", key: "created_at" },
  ];

  for (const inscrito of data) {
    hoja.addRow({
      nombres_completos: inscrito.nombres_completos,
      documento: inscrito.documento,
      correo: inscrito.correo,
      celular: inscrito.celular,
      genero: inscrito.genero === "M" ? "Masculino" : "Femenino",
      programa_academico: inscrito.programa_academico,
      tipo_egresado: inscrito.tipo_egresado === "socio" ? "Socio" : "No socio",
      talla: (inscrito.tallas as { nombre: string } | null)?.nombre ?? "",
      actividades: (actividadesPorInscrito.get(inscrito.id) ?? []).join(", "),
      cantidad_acompanantes: inscrito.cantidad_acompanantes,
      total: Number(inscrito.total),
      estado_pago: inscrito.estado_pago,
      estado_inscripcion: inscrito.estado_inscripcion,
      created_at: new Date(inscrito.created_at).toLocaleString("es-CO"),
    });
  }

  aplicarEstiloEncabezado(hoja.getRow(1));
  autoajustarColumnas(hoja);

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="inscritos.xlsx"`,
    },
  });
}