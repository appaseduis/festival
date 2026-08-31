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
    .from("talentos_culturales")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !data) {
    return NextResponse.json({ error: "No se pudieron obtener las propuestas" }, { status: 500 });
  }

  const workbook = new ExcelJS.Workbook();
  const hoja = workbook.addWorksheet("Talento Cultural");

  hoja.columns = [
    { header: "Nombre completo", key: "nombre_completo" },
    { header: "Correo", key: "correo" },
    { header: "Celular", key: "celular" },
    { header: "Programa", key: "programa_academico" },
    { header: "Expresión artística", key: "expresion" },
    { header: "Nombre artístico", key: "nombre_artistico" },
    { header: "Propuesta", key: "descripcion_propuesta" },
    { header: "Participantes", key: "cantidad_participantes" },
    { header: "Duración", key: "duracion_presentacion" },
    { header: "Portafolio", key: "enlace_portafolio" },
    { header: "Días disponibles", key: "dias_disponibles" },
    { header: "Requerimientos especiales", key: "requerimientos_especiales" },
    { header: "Estado", key: "estado" },
    { header: "Fecha", key: "created_at" },
  ];

  for (const t of data) {
    hoja.addRow({
      nombre_completo: t.nombre_completo,
      correo: t.correo,
      celular: t.celular,
      programa_academico: t.programa_academico,
      expresion: t.expresion_artistica === "Otra" ? `Otra: ${t.expresion_otra ?? ""}` : t.expresion_artistica,
      nombre_artistico: t.nombre_artistico ?? "",
      descripcion_propuesta: t.descripcion_propuesta,
      cantidad_participantes: t.cantidad_participantes,
      duracion_presentacion: t.duracion_presentacion,
      enlace_portafolio: t.enlace_portafolio ?? "",
      dias_disponibles: (t.dias_disponibles ?? []).join(", "),
      requerimientos_especiales: t.requerimientos_especiales ?? "",
      estado: ETIQUETA_ESTADO[t.estado] ?? t.estado,
      created_at: new Date(t.created_at).toLocaleString("es-CO"),
    });
  }

  aplicarEstiloEncabezado(hoja.getRow(1));
  autoajustarColumnas(hoja);

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="talento_cultural.xlsx"`,
    },
  });
}