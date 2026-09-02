import { z } from "zod";
import { EXPERIENCIAS_BARISMO } from "@/types/database";

export const barismoSchema = z
  .object({
    nombre_completo: z.string().trim().min(3, "Ingresa tu nombre completo"),
    whatsapp: z
      .string()
      .trim()
      .regex(/^[0-9]{7,15}$/, "Número de WhatsApp inválido"),
    correo: z.string().trim().email("Correo electrónico inválido"),
    documento: z
      .string()
      .trim()
      .min(5, "Número de documento inválido")
      .regex(/^[0-9]+$/, "El documento solo debe contener números"),
    representa_marca: z.boolean(),
    marca_nombre: z.string().trim().max(150).nullable(),
    experiencia: z.enum(EXPERIENCIAS_BARISMO as [string, ...string[]], {
      message: "Selecciona tu tiempo de experiencia",
    }),
    metodo_fase1: z.string().trim().min(2, "Indica el método estimado para la Fase 1"),
    acepta_reglamento: z.literal(true, {
      message: "Debes aceptar el Reglamento Oficial para inscribirte",
    }),
  })
  .refine(
    (data) => !data.representa_marca || (data.marca_nombre && data.marca_nombre.trim().length > 0),
    { message: "Especifica la cafetería, marca o tostadora", path: ["marca_nombre"] }
  );

export type BarismoFormData = z.infer<typeof barismoSchema>;0