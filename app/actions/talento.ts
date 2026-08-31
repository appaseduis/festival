"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { talentoSchema } from "@/lib/validations/talento";
import type { CrearTalentoInput, TalentoCultural, EstadoTalento } from "@/types/database";

export type ResultadoCrearTalento = { ok: true } | { ok: false; error: string };

export async function crearTalentoAction(
  data: CrearTalentoInput
): Promise<ResultadoCrearTalento> {
  const parsed = talentoSchema.safeParse(data);

  if (!parsed.success) {
    const primerError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { ok: false, error: primerError };
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from("talentos_culturales").insert({
    nombre_completo: data.nombre_completo.trim(),
    correo: data.correo.trim(),
    celular: data.celular.trim(),
    programa_academico: data.programa_academico.trim(),
    expresion_artistica: data.expresion_artistica,
    expresion_otra:
      data.expresion_artistica === "Otra" ? data.expresion_otra?.trim() || null : null,
    nombre_artistico: data.nombre_artistico?.trim() || null,
    descripcion_propuesta: data.descripcion_propuesta.trim(),
    cantidad_participantes: data.cantidad_participantes,
    duracion_presentacion: data.duracion_presentacion,
    enlace_portafolio: data.enlace_portafolio?.trim() || null,
    dias_disponibles: data.dias_disponibles,
    requerimientos_especiales: data.requerimientos_especiales?.trim() || null,
    acepta_terminos: data.acepta_terminos,
    autoriza_imagen: data.autoriza_imagen,
  });

  if (error) {
    console.error("Error creando preinscripción de talento:", error);
    return { ok: false, error: "Ocurrió un error al enviar tu propuesta. Intenta de nuevo." };
  }

  return { ok: true };
}

export async function listarTalentosAction(
  filtro: EstadoTalento | "todos"
): Promise<TalentoCultural[]> {
  await requireAdmin();
  const supabase = createAdminClient();

  let query = supabase
    .from("talentos_culturales")
    .select("*")
    .order("created_at", { ascending: false });

  if (filtro !== "todos") {
    query = query.eq("estado", filtro);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error listando talentos:", error);
    return [];
  }

  return data ?? [];
}

export async function actualizarEstadoTalentoAction(
  id: string,
  estado: EstadoTalento
): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.from("talentos_culturales").update({ estado }).eq("id", id);

  return { ok: !error };
}

export async function eliminarTalentoAction(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.from("talentos_culturales").delete().eq("id", id);

  return { ok: !error };
}