"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { CATEGORIAS_EXT } from "@/lib/validations/emprendimientosExternos";

const schema = z
  .object({
    nombre_responsable: z.string().trim().min(3, "Nombre del responsable requerido"),
    documento: z.string().trim().regex(/^[0-9A-Za-z-]{5,20}$/, "Cédula o NIT inválido"),
    correo: z.string().trim().toLowerCase().pipe(z.email("Correo inválido")),
    telefono: z.string().trim().regex(/^[0-9+ ]{7,15}$/, "Teléfono inválido"),
    ciudad: z.string().trim().min(2, "Ciudad requerida"),
    nombre_emprendimiento: z.string().trim().min(2, "Nombre del emprendimiento requerido"),
    descripcion: z.string().trim().min(10, "Describe tu emprendimiento (mín. 10 caracteres)").max(500),
    facebook: z.string().trim().optional(),
    instagram: z.string().trim().optional(),
    pagina_web: z.string().trim().optional(),
    categoria: z.enum(CATEGORIAS_EXT, { message: "Selecciona una categoría" }),
    categoria_otro: z.string().trim().optional(),
    necesita_electricidad: z.boolean(),
    acepta: z.literal(true, { message: "Debes aceptar las condiciones de preinscripción" }),
  })
  .refine((d) => d.categoria !== "Otro" || (d.categoria_otro?.length ?? 0) > 1, {
    message: "Especifica la categoría",
    path: ["categoria_otro"],
  });

export async function obtenerConfigExternosAction() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("configuracion_evento")
    .select("emprendimientos_externos_abierto, precio_emprendimiento_externo, link_eventos")
    .limit(1)
    .single();

  return {
    abierto: data?.emprendimientos_externos_abierto ?? false,
    precio: (data?.precio_emprendimiento_externo as number | null) ?? null,
    linkEventos: (data?.link_eventos as string | null) ?? null,
  };
}

export async function crearEmprendimientoExternoAction(
  raw: Record<string, FormDataEntryValue>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = schema.safeParse({
    ...raw,
    necesita_electricidad: raw.necesita_electricidad === "on",
    acepta: raw.acepta === "on",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { acepta, ...payload } = parsed.data;
  const supabase = createAdminClient();
  const { error } = await supabase.rpc("crear_emprendimiento_externo", { p: payload });

  if (error) {
    if (error.message.includes("FORMULARIO_CERRADO"))
      return { ok: false, error: "La preinscripción de emprendimientos externos está cerrada." };
    if (error.message.includes("DUPLICADO"))
      return { ok: false, error: "Ya existe una preinscripción con este documento." };
    return { ok: false, error: "No se pudo enviar la preinscripción. Intenta de nuevo." };
  }
  revalidatePath("/admin/emprendimientos-externos");
  return { ok: true };
}

export async function listarEmprendimientosExternosAction() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("emprendimientos_externos")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function actualizarEmprendimientoExternoAction(fd: FormData) {
  await requireAdmin();
  const valor = Number(fd.get("valor_pago"));
  const supabase = createAdminClient();
  await supabase.rpc("actualizar_emprendimiento_externo", {
    p_id: String(fd.get("id")),
    p_estado: String(fd.get("estado")),
    p_estado_pago: String(fd.get("estado_pago")),
    p_valor: valor > 0 ? valor : null,
    p_notas: String(fd.get("notas_admin") ?? ""),
  });
  revalidatePath("/admin/emprendimientos-externos");
}

export async function cambiarEstadoExternoAction(fd: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.rpc("cambiar_estado_emprendimiento_externo", {
    p_id: String(fd.get("id")),
    p_estado: String(fd.get("estado")),
  });
  revalidatePath("/admin/emprendimientos-externos");
  revalidatePath("/admin");
}