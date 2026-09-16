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
  filtro: EstadoEmprendimiento | "todos" | "pago_confirmado",
  busqueda: string = ""
): Promise<Emprendimiento[]> {
  await requireAdmin();
  const supabase = createAdminClient();

  let query = supabase
    .from("emprendimientos")
    .select("*")
    .order("created_at", { ascending: false });

  if (filtro === "pago_confirmado") {
    query = query.eq("estado_pago", "pago_confirmado");
  } else if (filtro !== "todos") {
    query = query.eq("estado", filtro);
  }

  if (busqueda.trim()) {
    query = query.or(
      `nombre_emprendimiento.ilike.%${busqueda}%,nombre_responsable.ilike.%${busqueda}%`
    );
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

export async function asignarValorPagoAction(
  id: string,
  valor: number
): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("emprendimientos")
    .update({ valor_pago: valor })
    .eq("id", id);

  return { ok: !error };
}

export type DatosPagoEmprendimiento = {
  id: string;
  nombre_emprendimiento: string;
  nombre_responsable: string;
  valor_pago: number | null;
  metodo_pago: "bold" | "bancolombia" | null;
  estado_pago: "pendiente_pago" | "pago_confirmado" | "pago_rechazado";
};

export async function obtenerDatosPagoEmprendimientoAction(
  id: string
): Promise<DatosPagoEmprendimiento | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("emprendimientos")
    .select("id, nombre_emprendimiento, nombre_responsable, valor_pago, metodo_pago, estado_pago")
    .eq("id", id)
    .eq("estado", "aceptado")
    .single();

  if (error || !data) return null;
  return data;
}

export async function seleccionarMetodoPagoEmprendimientoAction(
  id: string,
  metodo: "bold" | "bancolombia"
): Promise<{ ok: boolean }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("emprendimientos")
    .update({ metodo_pago: metodo })
    .eq("id", id);

  return { ok: !error };
}

export async function confirmarPagoEmprendimientoAction(
  id: string,
  nuevoEstado: "pago_confirmado" | "pago_rechazado"
): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.rpc("confirmar_pago_emprendimiento", {
    p_id: id,
    p_nuevo_estado: nuevoEstado,
  });

  return { ok: !error };
}

export async function corregirTipoEgresadoAction(
  id: string,
  tipoEgresado: "socio" | "no_socio"
): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("emprendimientos")
    .update({ tipo_egresado: tipoEgresado })
    .eq("id", id);

  return { ok: !error };
}