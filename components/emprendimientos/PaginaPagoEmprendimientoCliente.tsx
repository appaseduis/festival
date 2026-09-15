"use client";

import { useState } from "react";
import {
  seleccionarMetodoPagoEmprendimientoAction,
  type DatosPagoEmprendimiento,
} from "@/app/actions/emprendimiento";
import { obtenerInfoBancolombiaAction } from "@/app/actions/pago";
import BotonPagoBold from "@/components/inscripcion/BotonPagoBold";
import Footer from "@/components/shared/Footer";

function formatoCOP(valor: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}

const LLAVE_BANCOLOMBIA = "0090310223";

export default function PaginaPagoEmprendimientoCliente({
  datosIniciales,
}: {
  datosIniciales: DatosPagoEmprendimiento;
}) {
  const [metodoElegido, setMetodoElegido] = useState<"bold" | "bancolombia" | null>(
    datosIniciales.metodo_pago
  );
  const [infoBancolombia, setInfoBancolombia] = useState<{ qr_url: string | null; datos: string | null } | null>(null);
  const [mostrarQRGrande, setMostrarQRGrande] = useState(false);
  const [llaveCopiada, setLlaveCopiada] = useState(false);

  async function copiarLlave() {
    try {
      await navigator.clipboard.writeText(LLAVE_BANCOLOMBIA);
      setLlaveCopiada(true);
      setTimeout(() => setLlaveCopiada(false), 2000);
    } catch {
      // Si el navegador bloquea el portapapeles, no hacemos nada más
    }
  }

  async function elegirMetodoPago(metodo: "bold" | "bancolombia") {
    setMetodoElegido(metodo);
    await seleccionarMetodoPagoEmprendimientoAction(datosIniciales.id, metodo);

    if (metodo === "bancolombia") {
      const info = await obtenerInfoBancolombiaAction();
      setInfoBancolombia(info);
    }
  }

  if (datosIniciales.estado_pago === "pago_confirmado") {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-uis-green p-6 md:p-8 text-center space-y-2">
        <p className="text-lg font-semibold text-navy">✅ Pago confirmado</p>
        <p className="text-sm text-gray-600">
          Tu participación como emprendedor en el Festival del Egresado UIS ya está confirmada.
          ¡Nos vemos en octubre!
        </p>
        <Footer />
      </div>
    );
  }

  if (!datosIniciales.valor_pago) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 text-center">
        <p className="text-sm text-gray-600">
          Aún no se ha asignado el valor a pagar para tu stand. Comunícate con ASEDUIS para
          más información.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-uis-green p-6 md:p-8 space-y-5">
      <div className="text-center">
        <p className="font-display text-xl font-bold text-navy">
          {datosIniciales.nombre_emprendimiento}
        </p>
        <p className="text-sm text-gray-500">{datosIniciales.nombre_responsable}</p>
      </div>

      <div className="rounded-xl bg-[#F4F6F9] p-4 text-center border border-gray-100">
        <p className="text-xs text-gray-500">Valor a pagar</p>
        <p className="text-2xl font-bold text-navy">{formatoCOP(datosIniciales.valor_pago)}</p>
      </div>

      {!metodoElegido && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => elegirMetodoPago("bold")}
            className="py-3 rounded-lg border-2 border-navy text-navy font-medium hover:bg-navy hover:text-white transition-colors"
          >
            Pagar con Bold
          </button>
          <button
            type="button"
            onClick={() => elegirMetodoPago("bancolombia")}
            className="py-3 rounded-lg border-2 border-navy text-navy font-medium hover:bg-navy hover:text-white transition-colors"
          >
            Pagar mediante Bancolombia
          </button>
        </div>
      )}

      {metodoElegido === "bold" && (
        <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-700 space-y-3">
          <p className="font-medium">Pago con Bold</p>
          <BotonPagoBold
            inscripcionId={datosIniciales.id}
            amount={datosIniciales.valor_pago}
            prefix="emp"
          />
        </div>
      )}

      {metodoElegido === "bancolombia" && (
        <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-700 space-y-3">
          <p className="font-medium">Pago mediante Bancolombia</p>

          {infoBancolombia?.qr_url ? (
            <div className="flex flex-col items-center gap-3">
              <img
                src={infoBancolombia.qr_url}
                alt="QR de pago Bancolombia"
                className="w-32 h-32 object-contain"
              />
              <button
                type="button"
                onClick={() => setMostrarQRGrande(true)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium"
              >
                Mirar QR
              </button>
            </div>
          ) : (
            <p className="text-gray-500">El QR de pago aún no ha sido configurado.</p>
          )}

          <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
            <div>
              <p className="text-xs text-gray-500">Llave Bancolombia</p>
              <p className="font-mono font-medium">{LLAVE_BANCOLOMBIA}</p>
            </div>
            <button
              type="button"
              onClick={copiarLlave}
              className="px-3 py-1.5 rounded-lg bg-navy text-white text-xs font-medium whitespace-nowrap"
            >
              {llaveCopiada ? "¡Copiada!" : "Copiar llave"}
            </button>
          </div>

          <p className="text-amber-700">
            Después de transferir, envía el comprobante por WhatsApp al número de ASEDUIS.
          </p>
        </div>
      )}

      {mostrarQRGrande && infoBancolombia?.qr_url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setMostrarQRGrande(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-semibold text-navy">QR de pago Bancolombia</p>
            <img
              src={infoBancolombia.qr_url}
              alt="QR de pago Bancolombia ampliado"
              className="w-full h-auto"
            />
            <button
              type="button"
              onClick={() => setMostrarQRGrande(false)}
              className="px-5 py-2 rounded-lg bg-navy text-white text-sm font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}