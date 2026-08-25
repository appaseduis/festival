"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { emprendimientoSchema } from "@/lib/validations/emprendimiento";
import type { CrearEmprendimientoInput, Emprendimiento, EstadoEmprendimiento } from "@/types/database";

export type ResultadoCrearEmprendimiento = { ok: true } | { ok: false; error: string };

export async function crearEmprendimientoAction(
  data: CrearEmprendimientoInput
): Promise<ResultadoCrearEmprendimiento> {
  const parsed = emprendimientoSchema.safeParse(data);

  if (!parsed.success) {
    const primerError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { ok: false, error: primerError };
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from("emprendimientos").insert({
    nombre_responsable: data.nombre_responsable.trim(),
    correo: data.correo.trim(),
    telefono: data.telefono.trim(),
    nombre_emprendimiento: data.nombre_emprendimiento.trim(),
    facebook: data.facebook?.trim() || null,
    instagram: data.instagram?.trim() || null,
    pagina_web: data.pagina_web?.trim() || null,
    categoria: data.categoria,
    categoria_otro: data.categoria === "Otro" ? data.categoria_otro?.trim() || null : null,
    tipo_egresado: data.tipo_egresado,
    necesita_electricidad: data.necesita_electricidad,
  });

  if (error) {
    console.error("Error creando preinscripción de emprendimiento:", error);
    return { ok: false, error: "Ocurrió un error al enviar tu preinscripción. Intenta de nuevo." };
  }

  return { ok: true };
}

export async function listarEmprendimientosAction(
  filtro: EstadoEmprendimiento | "todos"
): Promise<Emprendimiento[]> {
  await requireAdmin();
  const supabase = createAdminClient();

  let query = supabase
    .from("emprendimientos")
    .select("*")
    .order("created_at", { ascending: false });

  if (filtro !== "todos") {
    query = query.eq("estado", filtro);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error listando emprendimientos:", error);
    return [];
  }

  return data ?? [];
}

export async function actualizarEstadoEmprendimientoAction(
  id: string,
  estado: EstadoEmprendimiento
): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.from("emprendimientos").update({ estado }).eq("id", id);

  return { ok: !error };
}

export async function eliminarEmprendimientoAction(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.from("emprendimientos").delete().eq("id", id);

  if (error) {
    console.error("Error eliminando emprendimiento:", error);
    return { ok: false };
  }

  return { ok: true };
}