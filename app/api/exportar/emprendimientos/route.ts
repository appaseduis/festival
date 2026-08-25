import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { aplicarEstiloEncabezado, autoajustarColumnas } from "@/lib/excel/estilos";

const ETIQUETA_ESTADO: Record<string, string> = {
  preinscrito: "Preinscrito",
  aceptado: "Aceptado",
  rechazado: "Rechazado",
};

export async function GET() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("emprendimientos")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !data) {
    return NextResponse.json({ error: "No se pudieron obtener los emprendimientos" }, { status: 500 });
  }

  const workbook = new ExcelJS.Workbook();
  const hoja = workbook.addWorksheet("Emprendimientos");

  hoja.columns = [
    { header: "Emprendimiento / Marca", key: "nombre_emprendimiento" },
    { header: "Responsable", key: "nombre_responsable" },
    { header: "Correo", key: "correo" },
    { header: "Teléfono", key: "telefono" },
    { header: "Facebook", key: "facebook" },
    { header: "Instagram", key: "instagram" },
    { header: "Página web", key: "pagina_web" },
    { header: "Categoría", key: "categoria" },
    { header: "Tipo egresado", key: "tipo_egresado" },
    { header: "Necesita electricidad", key: "necesita_electricidad" },
    { header: "Estado", key: "estado" },
    { header: "Notas admin", key: "notas_admin" },
    { header: "Fecha preinscripción", key: "created_at" },
  ];

  for (const e of data) {
    hoja.addRow({
      nombre_emprendimiento: e.nombre_emprendimiento,
      nombre_responsable: e.nombre_responsable,
      correo: e.correo,
      telefono: e.telefono,
      facebook: e.facebook ?? "",
      instagram: e.instagram ?? "",
      pagina_web: e.pagina_web ?? "",
      categoria: e.categoria === "Otro" ? `Otro: ${e.categoria_otro ?? ""}` : e.categoria,
      tipo_egresado: e.tipo_egresado === "socio" ? "Socio" : "No socio",
      necesita_electricidad: e.necesita_electricidad ? "Sí" : "No",
      estado: ETIQUETA_ESTADO[e.estado] ?? e.estado,
      notas_admin: e.notas_admin ?? "",
      created_at: new Date(e.created_at).toLocaleString("es-CO"),
    });
  }

  aplicarEstiloEncabezado(hoja.getRow(1));
  autoajustarColumnas(hoja);

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="emprendimientos.xlsx"`,
    },
  });
}