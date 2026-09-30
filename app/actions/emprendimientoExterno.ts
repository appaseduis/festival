"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  CATEGORIAS_EXT,
  type EmprendimientoExterno,
  type EstadoExterno,
  type FiltroExterno,
} from "@/lib/validations/emprendimientosExternos";

type Resp = { ok: true } | { ok: false; error: string };

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

// ---------- Público ----------

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
): Promise<Resp> {
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

// ---------- Admin ----------

async function ejecutarRpc(fn: string, args: Record<string, unknown>): Promise<Resp> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.rpc(fn, args);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/emprendimientos-externos");
  revalidatePath("/admin");
  return { ok: true };
}

export async function listarEmprendimientosExternosAction(
  filtro: FiltroExterno = "todos",
  busqueda = ""
): Promise<EmprendimientoExterno[]> {
  await requireAdmin();
  const supabase = createAdminClient();
  let q = supabase
    .from("emprendimientos_externos")
    .select("*")
    .order("created_at", { ascending: false });

  if (filtro === "pago_confirmado") q = q.eq("estado_pago", "pago_confirmado");
  else if (filtro !== "todos") q = q.eq("estado", filtro);

  const texto = busqueda.trim().replace(/[,()%]/g, "");
  if (texto) {
    q = q.or(`nombre_emprendimiento.ilike.%${texto}%,nombre_responsable.ilike.%${texto}%`);
  }

  const { data } = await q;
  return (data ?? []) as EmprendimientoExterno[];
}

export async function actualizarEstadoExternoAction(id: string, estado: EstadoExterno) {
  return ejecutarRpc("cambiar_estado_emprendimiento_externo", { p_id: id, p_estado: estado });
}

export async function asignarValorExternoAction(id: string, valor: number) {
  return ejecutarRpc("asignar_valor_emprendimiento_externo", { p_id: id, p_valor: valor });
}

export async function confirmarPagoExternoAction(
  id: string,
  estado: "pago_confirmado" | "pago_rechazado"
) {
  return ejecutarRpc("confirmar_pago_emprendimiento_externo", { p_id: id, p_estado_pago: estado });
}

export async function eliminarExternoAction(id: string) {
  return ejecutarRpc("eliminar_emprendimiento_externo", { p_id: id });
}