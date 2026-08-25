import { z } from "zod";
import { CATEGORIAS_EMPRENDIMIENTO } from "@/types/database";

export const emprendimientoSchema = z
  .object({
    nombre_responsable: z.string().trim().min(3, "Ingresa el nombre del responsable"),
    correo: z.string().trim().email("Correo electrónico inválido"),
    telefono: z
      .string()
      .trim()
      .regex(/^[0-9]{7,15}$/, "Número de teléfono inválido"),
    nombre_emprendimiento: z.string().trim().min(2, "Ingresa el nombre del emprendimiento"),
    facebook: z.string().trim().max(200).nullable(),
    instagram: z.string().trim().max(200).nullable(),
    pagina_web: z.string().trim().max(200).nullable(),
    categoria: z.enum(CATEGORIAS_EMPRENDIMIENTO as [string, ...string[]], {
      required_error: "Selecciona una categoría",
    }),
    categoria_otro: z.string().trim().max(100).nullable(),
    tipo_egresado: z.enum(["socio", "no_socio"], {
      required_error: "Indica si eres socio o no socio",
    }),
    necesita_electricidad: z.boolean(),
  })
  .refine(
    (data) => data.categoria !== "Otro" || (data.categoria_otro && data.categoria_otro.trim().length > 0),
    { message: "Especifica tu categoría", path: ["categoria_otro"] }
  );

export type EmprendimientoFormData = z.infer<typeof emprendimientoSchema>;