"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { inscripcionSchema } from "@/lib/validations/inscripcion";
import type { CrearInscripcionInput } from "@/types/database";

export type ResultadoCrearInscripcion =
  | { ok: true; inscripcionId: string; total: number }
  | { ok: false; error: string };

export async function crearInscripcionAction(
  data: CrearInscripcionInput
): Promise<ResultadoCrearInscripcion> {
  const parsed = inscripcionSchema.safeParse({
    ...data,
    tiene_acompanantes: data.acompanantes.length > 0,
  });

  if (!parsed.success) {
    const primerError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { ok: false, error: primerError };
  }

  const supabase = createAdminClient();

    const { data: inscrito, error } = await supabase.rpc("crear_inscripcion", {
    p_nombres_completos: data.nombres_completos,
    p_documento: data.documento,
    p_correo: data.correo,
    p_celular: data.celular,
    p_genero: data.genero,
    p_programa_academico: data.programa_academico,
    p_talla_id: data.talla_id,
    p_actividades_ids: data.actividades_ids,
    p_actividad_otro: data.actividad_otro,
    p_comentarios: data.comentarios,
    p_tipo_egresado: data.tipo_egresado,
    p_acompanantes: data.acompanantes,
  });

  if (error) {
    if (error.message.includes("DOCUMENTO_YA_INSCRITO")) {
      return {
        ok: false,
        error: "Este número de documento ya tiene una inscripción activa.",
      };
    }
    console.error("Error creando inscripción:", error);
    return {
      ok: false,
      error: "Ocurrió un error al guardar tu inscripción. Intenta de nuevo.",
    };
  }

  return { ok: true, inscripcionId: inscrito.id, total: inscrito.total };
}

export async function obtenerDatosFormularioAction() {
  const supabase = createAdminClient();

  const [config, tallas, actividades] = await Promise.all([
    supabase.from("configuracion_publica").select("*").single(),
    supabase
      .from("tallas")
      .select("id, nombre, activo, orden")
      .eq("activo", true)
      .order("orden"),
    supabase
      .from("actividades")
      .select("id, nombre, activo, orden")
      .eq("activo", true)
      .order("orden"),
  ]);

  return {
    config: config.data,
    tallas: tallas.data ?? [],
    actividades: actividades.data ?? [],
  };
}