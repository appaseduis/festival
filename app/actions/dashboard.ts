"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export type EstadisticasDashboard = {
  totalEgresados: number;
  totalAcompanantes: number;
  confirmadas: number;
  pendientes: number;
  totalRecaudado: number;
  kitsNecesarios: number;
  kitsEntregados: number;
  fichosNecesarios: number;
  fichosEntregados: number;
  totalPropuestasTalento: number;
};

export async function obtenerEstadisticasAction(): Promise<EstadisticasDashboard> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: inscritos, error } = await supabase
    .from("inscritos")
    .select(
      "cantidad_acompanantes, estado_inscripcion, estado_pago, total, kit_entregado, cantidad_fichos, fichos_entregados"
    );

  const { count: totalPropuestasTalento } = await supabase
    .from("talentos_culturales")
    .select("*", { count: "exact", head: true });

  if (error || !inscritos) {
    console.error("Error obteniendo estadísticas:", error);
    return {
      totalEgresados: 0,
      totalAcompanantes: 0,
      confirmadas: 0,
      pendientes: 0,
      totalRecaudado: 0,
      kitsNecesarios: 0,
      kitsEntregados: 0,
      fichosNecesarios: 0,
      fichosEntregados: 0,
      totalPropuestasTalento: totalPropuestasTalento ?? 0,
    };
  }

  const activos = inscritos.filter((i) => i.estado_inscripcion !== "cancelada");
  const confirmados = activos.filter((i) => i.estado_inscripcion === "confirmada");

  return {
    totalEgresados: activos.length,
    totalAcompanantes: activos.reduce((sum, i) => sum + i.cantidad_acompanantes, 0),
    confirmadas: confirmados.length,
    pendientes: activos.length - confirmados.length,
    totalRecaudado: confirmados.reduce((sum, i) => sum + Number(i.total), 0),
    kitsNecesarios: confirmados.length,
    kitsEntregados: confirmados.filter((i) => i.kit_entregado).length,
    fichosNecesarios: confirmados.reduce((sum, i) => sum + i.cantidad_fichos, 0),
    fichosEntregados: confirmados
      .filter((i) => i.fichos_entregados)
      .reduce((sum, i) => sum + i.cantidad_fichos, 0),
    totalPropuestasTalento: totalPropuestasTalento ?? 0,
  };
}