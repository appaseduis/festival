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
  cuposBarismoOcupados: number;
  recaudadoBarismo: number;
  totalEmprendimientos: number;
  empPreinscritos: number;
  empAceptados: number;
  empRechazados: number;
  empPagados: number;
  empPendientesPago: number;
  empRecaudado: number;
  porRecaudar: number;
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

  const { data: emprendimientos } = await supabase
    .from("emprendimientos")
    .select("estado, estado_pago, valor_pago");

  const { data: barismo } = await supabase
    .from("competencia_barismo")
    .select("estado_pago, total");

  // Barismo
  const barismoActivos = (barismo ?? []).filter((b) => b.estado_pago !== "pago_rechazado");
  const barismoConfirmados = barismoActivos.filter((b) => b.estado_pago === "pago_confirmado");

  // Emprendimientos
  const listaEmp = emprendimientos ?? [];
  const empAceptados = listaEmp.filter((e) => e.estado === "aceptado");
  const empPagados = empAceptados.filter((e) => e.estado_pago === "pago_confirmado");

  const statsComunes = {
    totalPropuestasTalento: totalPropuestasTalento ?? 0,
    cuposBarismoOcupados: barismoActivos.length,
    recaudadoBarismo: barismoConfirmados.reduce((sum, b) => sum + Number(b.total), 0),
    totalEmprendimientos: listaEmp.length,
    empPreinscritos: listaEmp.filter((e) => e.estado === "preinscrito").length,
    empAceptados: empAceptados.length,
    empRechazados: listaEmp.filter((e) => e.estado === "rechazado").length,
    empPagados: empPagados.length,
    empPendientesPago: empAceptados.filter((e) => e.estado_pago === "pendiente_pago").length,
    empRecaudado: empPagados.reduce((sum, e) => sum + Number(e.valor_pago ?? 0), 0),
  };

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
      porRecaudar: 0,
      ...statsComunes,
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
      porRecaudar: activos
      .filter((i) => i.estado_inscripcion !== "confirmada")
      .reduce((sum, i) => sum + Number(i.total), 0),
    kitsNecesarios: confirmados.length,
    kitsEntregados: confirmados.filter((i) => i.kit_entregado).length,
    fichosNecesarios: confirmados.reduce((sum, i) => sum + i.cantidad_fichos, 0),
    fichosEntregados: confirmados
      .filter((i) => i.fichos_entregados)
      .reduce((sum, i) => sum + i.cantidad_fichos, 0),
    ...statsComunes,
  };
}