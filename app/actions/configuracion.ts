"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export type ConfiguracionCompleta = {
  nombre_evento: string;
  fecha_inicio: string;
  fecha_fin: string;
  lugar: string;
  precio_egresado_socio: number;
  precio_egresado_no_socio: number;
  precio_acompanante: number;
  whatsapp_numero: string;
  bancolombia_qr_url: string | null;
  bancolombia_datos: string | null;
  bold_activo: boolean;
};

export async function obtenerConfiguracionAction(): Promise<ConfiguracionCompleta | null> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data, error } = await supabase.from("configuracion_evento").select("*").single();

  if (error || !data) {
    console.error("Error obteniendo configuración:", error);
    return null;
  }

  return data;
}

export async function actualizarConfiguracionAction(
  cambios: Partial<ConfiguracionCompleta>
): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("configuracion_evento")
    .update(cambios)
    .eq("id", (await supabase.from("configuracion_evento").select("id").single()).data?.id);

  if (error) {
    console.error("Error actualizando configuración:", error);
    return { ok: false };
  }

  return { ok: true };
}