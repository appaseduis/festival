"use client";

import { useState } from "react";
import {
  seleccionarMetodoPagoExternoAction,
  type DatosPagoExterno,
} from "@/app/actions/emprendimientoExterno";
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
const WHATSAPP = "573242606004";

function linkWhatsApp(mensaje: string) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
}

function BloqueAyuda({ nombre }: { nombre: string }) {
  return (
    <div className="rounded-xl bg-[#F4F6F9] border border-gray-100 p-4 text-center space-y-2">
      <p className="text-sm font-medium text-navy">¿Necesitas ayuda?</p>
      <p className="text-xs text-gray-500">
        Escríbenos por WhatsApp al 324 260 6004 y te ayudamos con tu pago.
      </p>
      <a
        href={linkWhatsApp(
          `Hola, necesito ayuda con el pago del stand de mi emprendimiento externo "${nombre}" para el Festival del Egresado UIS.`
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block rounded-lg border border-green-600 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
      >
        💬 Necesito ayuda
      </a>
    </div>
  );
}

export default function PaginaPagoExternoCliente({
  datosIniciales,
}: {
  datosIniciales: DatosPagoExterno;
}) {
  const [metodoElegido, setMetodoElegido] = useState<"bold" | "bancolombia" | null>(
    datosIniciales.metodo_pago
  );
  const [infoBancolombia, setInfoBancolombia] = useState<{
    qr_url: string | null;
    datos: string | null;
  } | null>(null);
  const [mostrarQRGrande, setMostrarQRGrande] = useState(false);
  const [llaveCopiada, setLlaveCopiada] = useState(false);

  async function copiarLlave() {
    try {
      await navigator.clipboard.writeText(LLAVE_BANCOLOMBIA);
      setLlaveCopiada(true);
      setTimeout(() => setLlaveCopiada(false), 2000);
    } catch {
      // Portapapeles bloqueado
    }
  }

  async function elegirMetodoPago(metodo: "bold" | "bancolombia") {
    setMetodoElegido(metodo);
    await seleccionarMetodoPagoExternoAction(datosIniciales.id, metodo);

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
          Tu participación como emprendimiento externo en el Festival del Egresado UIS ya está
          confirmada. ¡Nos vemos en octubre!
        </p>
        <Footer />
      </div>
    );
  }

  if (!datosIniciales.valor_pago) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 text-center space-y-4">
        <p className="text-sm text-gray-600">
          Aún no se ha asignado el valor a pagar para tu stand. Comunícate con ASEDUIS para más
          información.
        </p>
        <BloqueAyuda nombre={datosIniciales.nombre_emprendimiento} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-cyan p-6 md:p-8 space-y-5">
      <div className="text-center space-y-1">
        <span className="inline-block text-[10px] font-bold uppercase tracking-wide bg-cyan/10 text-cyan px-3 py-1 rounded-full">
          Emprendimiento externo
        </span>
        <p className="font-display text-xl font-bold text-navy">
          {datosIniciales.nombre_emprendimiento}
        </p>
        <p className="text-sm text-gray-500">{datosIniciales.nombre_responsable}</p>
      </div>

      <div className="rounded-xl bg-[#F4F6F9] p-4 text-center border border-gray-100">
        <p className="text-xs text-gray-500">Valor a pagar · Tarifa única externos</p>
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
          <div className="flex items-center justify-between">
            <p className="font-medium">Pago con Bold</p>
            <button
              type="button"
              onClick={() => setMetodoElegido(null)}
              className="text-xs text-navy underline"
            >
              Cambiar método
            </button>
          </div>
          <BotonPagoBold
            inscripcionId={datosIniciales.id}
            amount={datosIniciales.valor_pago}
            prefix="ext"
          />
          <p className="text-gray-600 text-xs">
            Una vez completes el pago con Bold, puedes avisarnos por WhatsApp si lo prefieres.
          </p>
          <a
            href={linkWhatsApp(
              `Hola, realicé el pago con Bold del stand para mi emprendimiento externo "${datosIniciales.nombre_emprendimiento}".`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg"
          >
            Avisar por WhatsApp
          </a>
        </div>
      )}

      {metodoElegido === "bancolombia" && (
        <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-medium">Pago mediante Bancolombia</p>
            <button
              type="button"
              onClick={() => setMetodoElegido(null)}
              className="text-xs text-navy underline"
            >
              Cambiar método
            </button>
          </div>

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

          <a
            href={linkWhatsApp(
              `Hola, adjunto el comprobante de pago de mi stand para el emprendimiento externo "${datosIniciales.nombre_emprendimiento}".`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg"
          >
            Enviar comprobante por WhatsApp
          </a>
        </div>
      )}

      <BloqueAyuda nombre={datosIniciales.nombre_emprendimiento} />

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