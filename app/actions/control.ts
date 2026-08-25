"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export type InscripcionControl = {
  id: string;
  nombres_completos: string;
  documento: string;
  programa_academico: string;
  tipo_egresado: string;
  estado_pago: string;
  estado_inscripcion: string;
  cantidad_acompanantes: number;
  kit_entregado: boolean;
  fecha_kit: string | null;
  cantidad_fichos: number;
  fichos_entregados: boolean;
  fecha_fichos: string | null;
  qr_token: string | null;
};

export type ResultadoBusqueda =
  | { ok: true; inscripcion: InscripcionControl }
  | { ok: false; error: string };

export async function buscarInscripcionAction(query: string): Promise<ResultadoBusqueda> {
  await requireAdmin();
  const supabase = createAdminClient();

  const limpio = query.trim();
  if (!limpio) return { ok: false, error: "Ingresa un documento o escanea un QR" };

  const esUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(limpio);

  const base = supabase
    .from("inscritos")
    .select(
      "id, nombres_completos, documento, programa_academico, tipo_egresado, estado_pago, estado_inscripcion, cantidad_acompanantes, kit_entregado, fecha_kit, cantidad_fichos, fichos_entregados, fecha_fichos, qr_token"
    );

  const { data, error } = esUUID
    ? await base.eq("qr_token", limpio).maybeSingle()
    : await base.eq("documento", limpio).maybeSingle();

  if (error || !data) {
    return { ok: false, error: "No se encontró ninguna inscripción con ese dato." };
  }

  return { ok: true, inscripcion: data as InscripcionControl };
}

export async function entregarKitAction(
  inscritoId: string
): Promise<{ ok: boolean; mensaje: string }> {
  const { email } = await requireAdmin();
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc("entregar_kit", {
    p_inscrito_id: inscritoId,
    p_responsable: email,
  });

  if (error || !data?.[0]) {
    return { ok: false, mensaje: "Error al registrar la entrega del kit." };
  }

  return { ok: data[0].exito, mensaje: data[0].mensaje };
}

export async function entregarFichosAction(
  inscritoId: string
): Promise<{ ok: boolean; mensaje: string }> {
  const { email } = await requireAdmin();
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc("entregar_fichos", {
    p_inscrito_id: inscritoId,
    p_responsable: email,
  });

  if (error || !data?.[0]) {
    return { ok: false, mensaje: "Error al registrar la entrega de fichos." };
  }

  return { ok: data[0].exito, mensaje: data[0].mensaje };
}

/**
 * TEMPORAL — mientras no exista la Fase 5 (validación de pagos),
 * permite confirmar manualmente una inscripción desde el panel de
 * control, solo para poder probar el flujo de kit/fichos y QR.
 * Se reemplaza por el módulo completo de Pagos en la Fase 5.
 */
export async function confirmarPagoTemporalAction(
  inscritoId: string
): Promise<{ ok: boolean }> {
  const { email } = await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.rpc("confirmar_pago", {
    p_inscrito_id: inscritoId,
    p_nuevo_estado: "pago_confirmado",
    p_confirmado_por: email,
  });

  return { ok: !error };
}