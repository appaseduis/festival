"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

type InfoBancolombia = {
  qr_url: string | null;
  datos: string | null;
};

/**
 * Devuelve los datos de pago de Bancolombia (QR + cuenta) desde
 * configuracion_evento. Se sirve desde un Server Action (no expuesto
 * con la anon key) para poder controlar/auditar su exposición.
 */
export async function obtenerInfoBancolombiaAction(): Promise<InfoBancolombia> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("configuracion_evento")
    .select("bancolombia_qr_url, bancolombia_datos")
    .single();

  if (error || !data) {
    return { qr_url: null, datos: null };
  }

  return { qr_url: data.bancolombia_qr_url, datos: data.bancolombia_datos };
}

/**
 * Registra el método de pago que el usuario eligió. Esto NO cambia
 * estado_pago ni estado_inscripcion — solo deja constancia de la
 * intención, para que el admin sepa qué esperar (comprobante por
 * WhatsApp vs. confirmación por webhook de Bold). Regla de negocio #23:
 * el sistema nunca marca automáticamente una inscripción como pagada.
 */
export async function seleccionarMetodoPagoAction(
  inscripcionId: string,
  metodo: "bold" | "bancolombia"
): Promise<{ ok: boolean }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("inscritos")
    .update({ metodo_pago: metodo })
    .eq("id", inscripcionId);

  if (error) {
    console.error("Error registrando método de pago:", error);
    return { ok: false };
  }

  return { ok: true };
}


export type DatosBotonBold = {
  orderId: string;
  amount: number;
  currency: "COP";
  apiKey: string;
  integritySignature: string;
  description: string;
};

/**
 * Genera la firma de integridad de Bold en el SERVIDOR (nunca en el
 * cliente, para no exponer la llave secreta). Algoritmo oficial de Bold:
 * SHA256({orderId}{amount}{currency}{llaveSecreta})
 */
export async function generarDatosBoldAction(
  entidadId: string,
  amount: number,
  prefix?: string
): Promise<DatosBotonBold> {
  const secretKey = process.env.BOLD_SECRET_KEY!;
  const apiKey = process.env.NEXT_PUBLIC_BOLD_API_KEY!;
  const currency = "COP" as const;

  // El order-id identifica de qué módulo viene el pago (inscripción de
  // egresado, barismo, etc.) para que el webhook sepa a qué tabla y RPC
  // dirigir la confirmación.
  const orderId = prefix ? `${prefix}_${entidadId}` : entidadId;

  const cadena = `${orderId}${amount}${currency}${secretKey}`;
  const integritySignature = crypto.createHash("sha256").update(cadena).digest("hex");

  return {
    orderId,
    amount,
    currency,
    apiKey,
    integritySignature,
    description: `Inscripción Festival del Egresado UIS V2`,
  };
}