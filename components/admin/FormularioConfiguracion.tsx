"use client";

import { useState } from "react";
import {
  actualizarConfiguracionAction,
  type ConfiguracionCompleta,
} from "@/app/actions/configuracion";

export default function FormularioConfiguracion({
  configInicial,
}: {
  configInicial: ConfiguracionCompleta;
}) {
  const [config, setConfig] = useState(configInicial);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  function actualizarCampo<K extends keyof ConfiguracionCompleta>(
    campo: K,
    valor: ConfiguracionCompleta[K]
  ) {
    setConfig((prev) => ({ ...prev, [campo]: valor }));
  }

  async function guardar() {
    setGuardando(true);
    setMensaje(null);

    const resp = await actualizarConfiguracionAction(config);

    setGuardando(false);
    setMensaje(resp.ok ? "Configuración guardada correctamente." : "Ocurrió un error al guardar.");
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl space-y-5">
      {mensaje && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm p-3">
          {mensaje}
        </div>
      )}

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Precios</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Egresado socio</span>
            <input
              type="number"
              className="input"
              value={config.precio_egresado_socio}
              onChange={(e) =>
                actualizarCampo("precio_egresado_socio", Number(e.target.value))
              }
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Egresado no socio</span>
            <input
              type="number"
              className="input"
              value={config.precio_egresado_no_socio}
              onChange={(e) =>
                actualizarCampo("precio_egresado_no_socio", Number(e.target.value))
              }
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Acompañante</span>
            <input
              type="number"
              className="input"
              value={config.precio_acompanante}
              onChange={(e) => actualizarCampo("precio_acompanante", Number(e.target.value))}
            />
          </label>
                    <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Barismo</span>
            <input
              type="number"
              className="input"
              value={config.precio_barismo}
              onChange={(e) => actualizarCampo("precio_barismo", Number(e.target.value))}
            />
          </label>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">WhatsApp</h3>
        <label className="block">
          <span className="block text-sm font-medium text-gray-700 mb-1">
            Número (formato 57XXXXXXXXXX)
          </span>
          <input
            className="input"
            value={config.whatsapp_numero}
            onChange={(e) => actualizarCampo("whatsapp_numero", e.target.value)}
          />
        </label>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Bancolombia</h3>
        <div className="space-y-3">
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">
              URL de la imagen del QR
            </span>
            <input
              className="input"
              placeholder="https://..."
              value={config.bancolombia_qr_url ?? ""}
              onChange={(e) => actualizarCampo("bancolombia_qr_url", e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Sube la imagen a Supabase Storage y pega aquí la URL pública. La
              carga directa de archivos se puede agregar más adelante si se
              necesita.
            </p>
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">
              Datos de la cuenta (texto libre)
            </span>
            <textarea
              className="input"
              rows={3}
              value={config.bancolombia_datos ?? ""}
              onChange={(e) => actualizarCampo("bancolombia_datos", e.target.value)}
            />
          </label>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Bold</h3>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.bold_activo}
            onChange={(e) => actualizarCampo("bold_activo", e.target.checked)}
          />
          <span className="text-sm text-gray-700">
            Activar botón de pago con Bold (requiere credenciales configuradas)
          </span>
        </label>
      </div>

      <button
        onClick={guardar}
        disabled={guardando}
        className="px-5 py-2 rounded-lg bg-gray-900 text-white disabled:opacity-60"
      >
        {guardando ? "Guardando..." : "Guardar cambios"}
      </button>
    </div>
  );
}