"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { barismoSchema } from "@/lib/validations/barismo";
import type { CrearBarismoInput, CompetenciaBarismo, EstadoPago } from "@/types/database";

export type ResultadoCrearBarismo =
  | { ok: true; inscripcionId: string; total: number }
  | { ok: false; error: string };

export async function crearInscripcionBarismoAction(
  data: CrearBarismoInput
): Promise<ResultadoCrearBarismo> {
  const parsed = barismoSchema.safeParse(data);

  if (!parsed.success) {
    const primerError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { ok: false, error: primerError };
  }

  const supabase = createAdminClient();

  const { data: inscripcion, error } = await supabase.rpc("crear_inscripcion_barismo", {
    p_nombre_completo: data.nombre_completo,
    p_whatsapp: data.whatsapp,
    p_correo: data.correo,
    p_documento: data.documento,
    p_representa_marca: data.representa_marca,
    p_marca_nombre: data.marca_nombre,
    p_experiencia: data.experiencia,
    p_metodo_fase1: data.metodo_fase1,
    p_acepta_reglamento: data.acepta_reglamento,
  });

  if (error) {
    if (error.message.includes("CUPO_LLENO")) {
      return { ok: false, error: "Lo sentimos, los 18 cupos ya están completos." };
    }
    if (error.message.includes("DOCUMENTO_YA_INSCRITO")) {
      return { ok: false, error: "Este número de documento ya está inscrito en la competencia." };
    }
    console.error("Error creando inscripción de barismo:", error);
    return { ok: false, error: "Ocurrió un error al procesar tu inscripción. Intenta de nuevo." };
  }

  return { ok: true, inscripcionId: inscripcion.id, total: inscripcion.total };
}

export async function obtenerCuposBarismoAction(): Promise<{ ocupados: number; total: number }> {
  const supabase = createAdminClient();

  const { count } = await supabase
    .from("competencia_barismo")
    .select("*", { count: "exact", head: true })
    .neq("estado_pago", "pago_rechazado");

  return { ocupados: count ?? 0, total: 30 };
}

export async function listarBarismoAction(
  filtro: "pendientes" | "todas"
): Promise<CompetenciaBarismo[]> {
  await requireAdmin();
  const supabase = createAdminClient();

  let query = supabase
    .from("competencia_barismo")
    .select("*")
    .order("created_at", { ascending: true });

  if (filtro === "pendientes") {
    query = query.in("estado_pago", ["pendiente_pago", "comprobante_en_revision"]);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error listando barismo:", error);
    return [];
  }

  return data ?? [];
}

export async function confirmarPagoBarismoAction(
  id: string,
  nuevoEstado: "pago_confirmado" | "pago_rechazado"
): Promise<{ ok: boolean }> {
  const { email } = await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.rpc("confirmar_pago_barismo", {
    p_id: id,
    p_nuevo_estado: nuevoEstado,
    p_confirmado_por: email,
  });

  return { ok: !error };
}

export async function eliminarBarismoAction(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.from("competencia_barismo").delete().eq("id", id);

  return { ok: !error };
}