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

type Modulo = {
  prefijo: string;
  tabla: string;
  rpc: string;
  paramId: string;
  paramEstado: string;
  conConfirmadoPor: boolean;
};

// El prefijo del order-id define el módulo. Sin prefijo = inscritos.
const MODULOS: Modulo[] = [
  { prefijo: "bar_", tabla: "competencia_barismo", rpc: "confirmar_pago_barismo", paramId: "p_id", paramEstado: "p_nuevo_estado", conConfirmadoPor: true },
  { prefijo: "emp_", tabla: "emprendimientos", rpc: "confirmar_pago_emprendimiento", paramId: "p_id", paramEstado: "p_nuevo_estado", conConfirmadoPor: false },
  { prefijo: "ext_", tabla: "emprendimientos_externos", rpc: "confirmar_pago_emprendimiento_externo", paramId: "p_id", paramEstado: "p_estado_pago", conConfirmadoPor: false },
];

const MODULO_INSCRITOS: Modulo = {
  prefijo: "",
  tabla: "inscritos",
  rpc: "confirmar_pago",
  paramId: "p_inscrito_id",
  paramEstado: "p_nuevo_estado",
  conConfirmadoPor: true,
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
  const firmaCalculada = crypto.createHmac("sha256", secretKey).update(bodyBase64).digest("hex");

  const a = Buffer.from(firmaCalculada);
  const b = Buffer.from(firmaRecibida);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  let payload: PayloadBold;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const reference = payload.data?.metadata?.reference;
  if (!reference) return NextResponse.json({ ok: true, ignorado: true });

  if (payload.type !== "SALE_APPROVED" && payload.type !== "SALE_REJECTED") {
    return NextResponse.json({ ok: true, ignorado: true });
  }

  const nuevoEstado = payload.type === "SALE_APPROVED" ? "pago_confirmado" : "pago_rechazado";
  const modulo = MODULOS.find((m) => reference.startsWith(m.prefijo)) ?? MODULO_INSCRITOS;
  const id = modulo.prefijo ? reference.slice(modulo.prefijo.length) : reference;

  const supabase = createAdminClient();

  // Idempotencia
  const { data: actual } = await supabase
    .from(modulo.tabla)
    .select("estado_pago")
    .eq("id", id)
    .maybeSingle();

  if (actual?.estado_pago === "pago_confirmado" || actual?.estado_pago === "pago_rechazado") {
    return NextResponse.json({ ok: true, yaProcesado: true });
  }

  const parametrosRpc: Record<string, string> = {
    [modulo.paramId]: id,
    [modulo.paramEstado]: nuevoEstado,
  };
  if (modulo.conConfirmadoPor) parametrosRpc.p_confirmado_por = "bold_webhook";

  const { error } = await supabase.rpc(modulo.rpc, parametrosRpc);

  if (error) {
    console.error("Error confirmando pago desde webhook de Bold:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}