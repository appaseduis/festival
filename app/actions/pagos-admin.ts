"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export type InscripcionPago = {
  id: string;
  nombres_completos: string;
  documento: string;
  celular: string;
  tipo_egresado: string;
  metodo_pago: string | null;
  total: number;
  estado_pago: string;
  created_at: string;
};

export async function listarInscripcionesPagoAction(
  filtro: "pendientes" | "confirmados" | "todas"
): Promise<InscripcionPago[]> {
  await requireAdmin();
  const supabase = createAdminClient();

  let query = supabase
    .from("inscritos")
    .select(
      "id, nombres_completos, documento, celular, tipo_egresado, metodo_pago, total, estado_pago, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (filtro === "pendientes") {
    query = query.in("estado_pago", ["pendiente_pago", "comprobante_en_revision"]);
  } else if (filtro === "confirmados") {
    query = query.eq("estado_pago", "pago_confirmado");
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error listando pagos:", error);
    return [];
  }

  return data ?? [];
}

export type ResultadoConfirmarPago = { ok: true } | { ok: false; error: string };

export async function confirmarPagoAdminAction(
  inscripcionId: string,
  nuevoEstado: "pago_confirmado" | "pago_rechazado"
): Promise<ResultadoConfirmarPago> {
  const { email } = await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.rpc("confirmar_pago", {
    p_inscrito_id: inscripcionId,
    p_nuevo_estado: nuevoEstado,
    p_confirmado_por: email,
  });

  if (error) {
    console.error("Error confirmando pago:", error);
    return { ok: false, error: "No se pudo actualizar el estado del pago." };
  }

  return { ok: true };
}

/**
 * Marca una inscripción como "comprobante en revisión". Útil cuando
 * el admin recibe el comprobante por WhatsApp y quiere dejar registro
 * de que está siendo validado, antes de confirmar o rechazar.
 */
export async function marcarEnRevisionAction(
  inscripcionId: string
): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("inscritos")
    .update({ estado_pago: "comprobante_en_revision" })
    .eq("id", inscripcionId);

  return { ok: !error };
}

export type DetallePagoInscrito = {
  id: string;
  nombres_completos: string;
  documento: string;
  correo: string;
  celular: string;
  genero: string;
  programa_academico: string;
  tipo_egresado: string;
  cantidad_acompanantes: number;
  acompanantes: { nombre: string; documento: string; edad: number }[];
  comentarios: string | null;
};

export async function obtenerDetallePagoAction(
  id: string
): Promise<DetallePagoInscrito | null> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: inscrito, error } = await supabase
    .from("inscritos")
    .select(
      "id, nombres_completos, documento, correo, celular, genero, programa_academico, tipo_egresado, cantidad_acompanantes, comentarios"
    )
    .eq("id", id)
    .single();

  if (error || !inscrito) return null;

  const { data: acompanantes } = await supabase
    .from("acompanantes")
    .select("nombre, documento, edad")
    .eq("inscrito_id", id);

  return { ...inscrito, acompanantes: acompanantes ?? [] };
}