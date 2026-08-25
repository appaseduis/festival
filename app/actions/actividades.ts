"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import type { Actividad } from "@/types/database";

export async function listarActividadesAction(): Promise<Actividad[]> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("actividades")
    .select("id, nombre, activo, orden")
    .order("orden", { ascending: true });

  if (error) {
    console.error("Error listando actividades:", error);
    return [];
  }

  return data ?? [];
}

export async function crearActividadAction(
  nombre: string
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const supabase = createAdminClient();

  const nombreLimpio = nombre.trim();
  if (!nombreLimpio) {
    return { ok: false, error: "El nombre no puede estar vacío." };
  }

  const { data: existentes } = await supabase
    .from("actividades")
    .select("orden")
    .order("orden", { ascending: false })
    .limit(1);

  const siguienteOrden = (existentes?.[0]?.orden ?? 0) + 1;

  const { error } = await supabase
    .from("actividades")
    .insert({ nombre: nombreLimpio, orden: siguienteOrden });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Ya existe una actividad con ese nombre." };
    }
    console.error("Error creando actividad:", error);
    return { ok: false, error: "No se pudo crear la actividad." };
  }

  return { ok: true };
}

export async function actualizarActividadAction(
  id: string,
  cambios: { nombre?: string; activo?: boolean }
): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.from("actividades").update(cambios).eq("id", id);

  return { ok: !error };
}

export async function eliminarActividadAction(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.from("actividades").delete().eq("id", id);

  return { ok: !error };
}