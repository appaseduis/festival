import { z } from "zod";

export const acompananteSchema = z.object({
  nombre: z.string().trim().min(3, "El nombre del acompañante es muy corto"),
  documento: z
    .string()
    .trim()
    .min(5, "Número de documento inválido")
    .regex(/^[0-9]+$/, "El documento solo debe contener números"),
  edad: z
    .number({ invalid_type_error: "Ingresa una edad válida" })
    .int()
    .min(0, "Edad inválida")
    .max(120, "Edad inválida"),
});

export const inscripcionSchema = z.object({
  nombres_completos: z.string().trim().min(3, "Ingresa tu nombre completo"),
  documento: z
    .string()
    .trim()
    .min(5, "Número de documento inválido")
    .regex(/^[0-9]+$/, "El documento solo debe contener números"),
  correo: z.string().trim().email("Correo electrónico inválido"),
  celular: z
    .string()
    .trim()
    .regex(/^[0-9]{7,15}$/, "Número de celular inválido"),
  genero: z.enum(["M", "F"], { required_error: "Selecciona un género" }),
  programa_academico: z.string().trim().min(2, "Ingresa tu programa académico"),
  talla_id: z.string().uuid("Selecciona una talla"),
  actividades_ids: z.array(z.string().uuid()),
  comentarios: z.string().trim().max(500).nullable(),
  tipo_egresado: z.enum(["socio", "no_socio"], {
    required_error: "Selecciona si eres socio o no socio",
  }),
  tiene_acompanantes: z.boolean(),
  acompanantes: z.array(acompananteSchema),
});

export type InscripcionFormData = z.infer<typeof inscripcionSchema>;