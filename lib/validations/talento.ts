import { z } from "zod";
import { EXPRESIONES_ARTISTICAS, DURACIONES_PRESENTACION } from "@/types/database";

export const talentoSchema = z
  .object({
    nombre_completo: z.string().trim().min(3, "Ingresa tu nombre completo"),
    correo: z.string().trim().email("Correo electrónico inválido"),
    celular: z
      .string()
      .trim()
      .regex(/^[0-9]{7,15}$/, "Número de celular inválido"),
    programa_academico: z.string().trim().min(2, "Ingresa tu programa académico"),
    expresion_artistica: z.enum(EXPRESIONES_ARTISTICAS as [string, ...string[]], {
      message: "Selecciona tu expresión artística",
    }),
    expresion_otra: z.string().trim().max(100).nullable(),
    nombre_artistico: z.string().trim().max(150).nullable(),
    descripcion_propuesta: z.string().trim().min(10, "Cuéntanos un poco más sobre tu propuesta"),
    cantidad_participantes: z
      .number({ error: "Ingresa un número válido" })
      .int()
      .min(1, "Debe ser al menos 1"),
    duracion_presentacion: z.enum(DURACIONES_PRESENTACION as [string, ...string[]], {
      message: "Selecciona la duración aproximada",
    }),
    enlace_portafolio: z.string().trim().max(300).nullable(),
    dias_disponibles: z.array(z.string()).min(1, "Selecciona al menos una jornada disponible"),
    requerimientos_especiales: z.string().trim().max(500).nullable(),
    acepta_terminos: z.literal(true, {
      message: "Debes aceptar los términos para enviar tu propuesta",
    }),
    autoriza_imagen: z.literal(true, {
      message: "Debes autorizar el uso de imagen para enviar tu propuesta",
    }),
  })
  .refine(
    (data) =>
      data.expresion_artistica !== "Otra" ||
      (data.expresion_otra && data.expresion_otra.trim().length > 0),
    { message: "Especifica tu expresión artística", path: ["expresion_otra"] }
  );

export type TalentoFormData = z.infer<typeof talentoSchema>;