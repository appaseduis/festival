import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

type PayloadBold = {
  type: "SALE_APPROVED" | "SALE_REJECTED" | "VOID_APPROVED" | "VOID_REJECTED";
  data?: {
    payment_id?: string;
    metadata?: { reference?: string | null };
    amount?: { total?: number };
  };
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const firmaRecibida = req.headers.get("x-bold-signature");

  if (!firmaRecibida) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  // En modo pruebas, Bold firma con una llave secreta VACÍA.
  const secretKey = process.env.BOLD_MODO_PRUEBAS === "true" ? "" : process.env.BOLD_SECRET_KEY!;

  const bodyBase64 = Buffer.from(rawBody, "utf-8").toString("base64");
  const firmaCalculada = crypto
    .createHmac("sha256", secretKey)
    .update(bodyBase64)
    .digest("hex");

  const firmasCoinciden = crypto.timingSafeEqual(
    Buffer.from(firmaCalculada),
    Buffer.from(firmaRecibida)
  );

  if (!firmasCoinciden) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  let payload: PayloadBold;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  // El order-id que enviamos al crear el botón queda en metadata.reference
  const inscripcionId = payload.data?.metadata?.reference;

  if (!inscripcionId) {
    // Confirmamos 200 igual, para que Bold no reintente por algo que no podemos procesar
    return NextResponse.json({ ok: true, ignorado: true });
  }

  if (payload.type !== "SALE_APPROVED" && payload.type !== "SALE_REJECTED") {
    // Anulaciones u otros eventos: por ahora no cambian estado_pago automáticamente
    return NextResponse.json({ ok: true, ignorado: true });
  }

  const nuevoEstado = payload.type === "SALE_APPROVED" ? "pago_confirmado" : "pago_rechazado";

  const supabase = createAdminClient();

  // Idempotencia: si ya está en el estado final, no lo reprocesamos (evita duplicados de reintentos de Bold)
  const { data: actual } = await supabase
    .from("inscritos")
    .select("estado_pago")
    .eq("id", inscripcionId)
    .maybeSingle();

  if (actual?.estado_pago === "pago_confirmado" || actual?.estado_pago === "pago_rechazado") {
    return NextResponse.json({ ok: true, yaProcesado: true });
  }

  const { error } = await supabase.rpc("confirmar_pago", {
    p_inscrito_id: inscripcionId,
    p_nuevo_estado: nuevoEstado,
    p_confirmado_por: "bold_webhook",
  });

  if (error) {
    console.error("Error confirmando pago desde webhook de Bold:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}