"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export type FilaCamisetas = {
  genero: "M" | "F";
  talla: string;
  cantidad: number;
};

export type ReporteCamisetas = {
  filas: FilaCamisetas[];
  total: number;
};

/**
 * Reporte de camisetas: solo egresados confirmados/pagados
 * (regla de negocio: los acompañantes NO reciben camiseta).
 */
export async function obtenerReporteCamisetasAction(): Promise<ReporteCamisetas> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("inscritos")
    .select("genero, tallas(nombre)")
    .eq("estado_inscripcion", "confirmada");

  if (error || !data) {
    console.error("Error obteniendo reporte de camisetas:", error);
    return { filas: [], total: 0 };
  }

  const conteo = new Map<string, number>();

  for (const fila of data) {
    const talla = (fila.tallas as unknown as { nombre: string } | null)?.nombre ?? "Sin talla";
    const clave = `${fila.genero}__${talla}`;
    conteo.set(clave, (conteo.get(clave) ?? 0) + 1);
  }

  const ordenTallas = ["XS", "S", "M", "L", "XL", "XXL"];

  const filas: FilaCamisetas[] = Array.from(conteo.entries())
    .map(([clave, cantidad]) => {
      const [genero, talla] = clave.split("__");
      return { genero: genero as "M" | "F", talla, cantidad };
    })
    .sort((a, b) => {
      if (a.genero !== b.genero) return a.genero === "M" ? -1 : 1;
      return ordenTallas.indexOf(a.talla) - ordenTallas.indexOf(b.talla);
    });

  return { filas, total: data.length };
}