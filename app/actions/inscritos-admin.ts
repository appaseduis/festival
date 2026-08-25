"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export type InscritoListado = {
  id: string;
  nombres_completos: string;
  documento: string;
  correo: string;
  celular: string;
  genero: string;
  programa_academico: string;
  tipo_egresado: string;
  cantidad_acompanantes: number;
  total: number;
  estado_pago: string;
  estado_inscripcion: string;
  created_at: string;
  qr_token: string | null;
};

export async function listarInscritosAction(
  busqueda: string
): Promise<InscritoListado[]> {
  await requireAdmin();
  const supabase = createAdminClient();

  let query = supabase
    .from("inscritos")
    .select(
      "id, nombres_completos, documento, correo, celular, genero, programa_academico, tipo_egresado, cantidad_acompanantes, total, estado_pago, estado_inscripcion, created_at, qr_token"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (busqueda.trim()) {
    query = query.or(
      `nombres_completos.ilike.%${busqueda}%,documento.ilike.%${busqueda}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error listando inscritos:", error);
    return [];
  }

  return data ?? [];
}

export type InscritoDetalle = {
  id: string;
  nombres_completos: string;
  documento: string;
  correo: string;
  celular: string;
  genero: "M" | "F";
  programa_academico: string;
  talla_id: string;
    actividades_ids: string[];
  comentarios: string | null;
  tipo_egresado: "socio" | "no_socio";
  estado_pago: string;
  estado_inscripcion: string;
  total: number;
  acompanantes: { id: string; nombre: string; documento: string; edad: number }[];
};

export async function obtenerInscritoDetalleAction(
  id: string
): Promise<InscritoDetalle | null> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: inscrito, error } = await supabase
    .from("inscritos")
    .select(
      "id, nombres_completos, documento, correo, celular, genero, programa_academico, talla_id, comentarios, tipo_egresado, estado_pago, estado_inscripcion, total"
    )
    .eq("id", id)
    .single();

  if (error || !inscrito) return null;

  const { data: acompanantes } = await supabase
    .from("acompanantes")
    .select("id, nombre, documento, edad")
    .eq("inscrito_id", id);

  const { data: actividadesRelacion } = await supabase
    .from("inscritos_actividades")
    .select("actividad_id")
    .eq("inscrito_id", id);

  return {
    ...inscrito,
    acompanantes: acompanantes ?? [],
    actividades_ids: (actividadesRelacion ?? []).map((r) => r.actividad_id),
  };
}

export type DatosEdicionInscrito = {
  nombres_completos: string;
  documento: string;
  correo: string;
  celular: string;
  genero: "M" | "F";
  programa_academico: string;
  talla_id: string;
  actividades_ids: string[];
  comentarios: string | null;
  tipo_egresado: "socio" | "no_socio";
  acompanantes: { id?: string; nombre: string; documento: string; edad: number }[];
};
export type ResultadoEdicion = { ok: true } | { ok: false; error: string };

export async function actualizarInscritoAction(
  id: string,
  datos: DatosEdicionInscrito
): Promise<ResultadoEdicion> {
  await requireAdmin();
  const supabase = createAdminClient();

  // Documento único entre inscripciones activas, excluyendo esta misma
  const { data: duplicado } = await supabase
    .from("inscritos")
    .select("id, estado_inscripcion")
    .eq("documento", datos.documento)
    .neq("id", id)
    .neq("estado_inscripcion", "cancelada")
    .maybeSingle();

  if (duplicado) {
    return { ok: false, error: "Ese número de documento ya pertenece a otra inscripción activa." };
  }

  const { data: config } = await supabase
    .from("configuracion_evento")
    .select("precio_egresado_socio, precio_egresado_no_socio, precio_acompanante")
    .single();

  if (!config) {
    return { ok: false, error: "No se pudo leer la configuración de precios." };
  }

  const precioEgresado =
    datos.tipo_egresado === "socio" ? config.precio_egresado_socio : config.precio_egresado_no_socio;
  const subtotalAcompanantes = config.precio_acompanante * datos.acompanantes.length;
  const total = precioEgresado + subtotalAcompanantes;

    const { error: errorUpdate } = await supabase
    .from("inscritos")
    .update({
      nombres_completos: datos.nombres_completos,
      documento: datos.documento,
      correo: datos.correo,
      celular: datos.celular,
      genero: datos.genero,
      programa_academico: datos.programa_academico,
      talla_id: datos.talla_id,
      comentarios: datos.comentarios,
      tipo_egresado: datos.tipo_egresado,
      cantidad_acompanantes: datos.acompanantes.length,
      subtotal_egresado: precioEgresado,
      subtotal_acompanantes: subtotalAcompanantes,
      total,
    })
    .eq("id", id);

  if (errorUpdate) {
    console.error("Error actualizando inscrito:", errorUpdate);
    return { ok: false, error: "No se pudo guardar la inscripción." };
  }

  // Reemplaza la lista de actividades completa
  await supabase.from("inscritos_actividades").delete().eq("inscrito_id", id);

  if (datos.actividades_ids.length > 0) {
    await supabase.from("inscritos_actividades").insert(
      datos.actividades_ids.map((actividad_id) => ({ inscrito_id: id, actividad_id }))
    );
  }

  // Reemplaza la lista de acompañantes completa (simple y seguro para uso admin)
  await supabase.from("acompanantes").delete().eq("inscrito_id", id);

  if (datos.acompanantes.length > 0) {
    const { error: errorAcompanantes } = await supabase.from("acompanantes").insert(
      datos.acompanantes.map((a) => ({
        inscrito_id: id,
        nombre: a.nombre,
        documento: a.documento,
        edad: a.edad,
      }))
    );

    if (errorAcompanantes) {
      console.error("Error actualizando acompañantes:", errorAcompanantes);
      return { ok: false, error: "Se guardó la inscripción pero hubo un error con los acompañantes." };
    }
  }

  return { ok: true };
}

export async function eliminarInscritoAction(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();

  // ON DELETE CASCADE en acompanantes, entregas y pagos limpia todo lo relacionado
  const { error } = await supabase.from("inscritos").delete().eq("id", id);

  if (error) {
    console.error("Error eliminando inscrito:", error);
    return { ok: false };
  }

  return { ok: true };
}