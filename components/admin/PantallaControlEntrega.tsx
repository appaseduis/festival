"use client";

import { useState } from "react";
import {entregarKitAction, entregarFichosAction, confirmarPagoTemporalAction, type InscripcionControl,} from "@/app/actions/control";

const ETIQUETA_ESTADO: Record<string, { texto: string; color: string }> = {
  pendiente_pago: { texto: "Pendiente de pago", color: "bg-gray-100 text-gray-700" },
  comprobante_en_revision: { texto: "En revisión", color: "bg-amber-100 text-amber-700" },
  pago_confirmado: { texto: "Confirmado", color: "bg-green-100 text-green-700" },
  pago_rechazado: { texto: "Rechazado", color: "bg-red-100 text-red-700" },
};

export default function PantallaControlEntrega({
  inscripcionInicial,
}: {
  inscripcionInicial: InscripcionControl;
}) {
  const [inscripcion, setInscripcion] = useState(inscripcionInicial);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [cargando, setCargando] = useState<"kit" | "fichos" | "confirmar" | null>(null);

  const estaConfirmada = inscripcion.estado_inscripcion === "confirmada";

  async function manejarEntregarKit() {
    setCargando("kit");
    setMensaje(null);
    const resp = await entregarKitAction(inscripcion.id);
    setCargando(null);

    if (resp.ok) {
      setInscripcion((prev) => ({ ...prev, kit_entregado: true, fecha_kit: new Date().toISOString() }));
    } else {
      setMensaje(
        resp.mensaje === "KIT_YA_ENTREGADO"
          ? "El kit ya había sido entregado."
          : "No se pudo registrar la entrega."
      );
    }
  }

  async function manejarEntregarFichos() {
    setCargando("fichos");
    setMensaje(null);
    const resp = await entregarFichosAction(inscripcion.id);
    setCargando(null);

    if (resp.ok) {
      setInscripcion((prev) => ({
        ...prev,
        fichos_entregados: true,
        fecha_fichos: new Date().toISOString(),
      }));
    } else {
      setMensaje(
        resp.mensaje === "FICHOS_YA_ENTREGADOS"
          ? "Los fichos ya habían sido entregados."
          : "No se pudo registrar la entrega."
      );
    }
  }

  async function manejarConfirmarTemporal() {
    setCargando("confirmar");
    setMensaje(null);
    const resp = await confirmarPagoTemporalAction(inscripcion.id);
    setCargando(null);

    if (resp.ok) {
      setInscripcion((prev) => ({
        ...prev,
        estado_pago: "pago_confirmado",
        estado_inscripcion: "confirmada",
      }));
      setMensaje("Inscripción confirmada. Recarga la búsqueda para ver el QR generado.");
    } else {
      setMensaje("No se pudo confirmar el pago.");
    }
  }

  const estado = ETIQUETA_ESTADO[inscripcion.estado_pago];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
      <div>
        <p className="text-lg font-bold text-gray-900">{inscripcion.nombres_completos}</p>
        <p className="text-sm text-gray-500">CC {inscripcion.documento} · {inscripcion.programa_academico}</p>
      </div>

      <div className="flex items-center gap-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${estado.color}`}>
          {estado.texto}
        </span>
        <span className="text-sm text-gray-600">
          {inscripcion.tipo_egresado === "socio" ? "Socio" : "No socio"} · {inscripcion.cantidad_acompanantes} acompañante(s)
        </span>
      </div>

      {mensaje && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm p-3">
          {mensaje}
        </div>
      )}

      {!estaConfirmada && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Esta inscripción aún no está confirmada. Ve al módulo{" "}
          <a href="/admin/pagos" className="underline font-medium">Pagos</a> para validar y
          confirmar el pago; una vez confirmado, el kit y los fichos se podrán entregar
          desde aquí.
        </div>
      )}

      {estaConfirmada && (
        <>
          <hr className="border-gray-100" />

          {/* KIT */}
          <div>
            <p className="font-semibold text-gray-900 mb-2">Kit Festivalero</p>
            {inscripcion.kit_entregado ? (
              <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                ✅ Kit ya entregado
                {inscripcion.fecha_kit && (
                  <span className="block text-xs text-green-600 mt-1">
                    {new Date(inscripcion.fecha_kit).toLocaleString("es-CO")}
                  </span>
                )}
              </div>
            ) : (
              <button
                onClick={manejarEntregarKit}
                disabled={cargando === "kit"}
                className="w-full py-3 rounded-lg bg-gray-900 text-white font-medium disabled:opacity-60"
              >
                {cargando === "kit" ? "Registrando..." : "⏳ Entregar Kit"}
              </button>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* ALMUERZO */}
          <div>
            <p className="font-semibold text-gray-900 mb-2">
              Almuerzo — Total fichos: {inscripcion.cantidad_fichos}
            </p>
            <p className="text-xs text-gray-500 mb-2">
              Egresado: 1 · Acompañantes: {inscripcion.cantidad_acompanantes}
            </p>
            {inscripcion.fichos_entregados ? (
              <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                ✅ Fichos ya entregados
                {inscripcion.fecha_fichos && (
                  <span className="block text-xs text-green-600 mt-1">
                    {new Date(inscripcion.fecha_fichos).toLocaleString("es-CO")}
                  </span>
                )}
              </div>
            ) : (
              <button
                onClick={manejarEntregarFichos}
                disabled={cargando === "fichos"}
                className="w-full py-3 rounded-lg bg-gray-900 text-white font-medium disabled:opacity-60"
              >
                {cargando === "fichos"
                  ? "Registrando..."
                  : `⏳ Entregar ${inscripcion.cantidad_fichos} Fichos`}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}