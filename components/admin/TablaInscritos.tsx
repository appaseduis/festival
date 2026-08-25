"use client";

import { useState, useTransition } from "react";
import { listarInscritosAction, type InscritoListado } from "@/app/actions/inscritos-admin";
import { eliminarInscritoAction } from "@/app/actions/inscritos-admin";
import ModalQR from "@/components/admin/ModalQR";

function formatoCOP(valor: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}

const ETIQUETA_ESTADO_PAGO: Record<string, string> = {
  pendiente_pago: "Pendiente",
  comprobante_en_revision: "En revisión",
  pago_confirmado: "Confirmado",
  pago_rechazado: "Rechazado",
};

const COLOR_ESTADO_PAGO: Record<string, string> = {
  pendiente_pago: "bg-gray-100 text-gray-700",
  comprobante_en_revision: "bg-amber-100 text-amber-700",
  pago_confirmado: "bg-green-100 text-green-700",
  pago_rechazado: "bg-red-100 text-red-700",
};



export default function TablaInscritos({
  inscritosIniciales,
}: {
  inscritosIniciales: InscritoListado[];
}) {
  const [inscritos, setInscritos] = useState(inscritosIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [pending, startTransition] = useTransition();
  const [confirmarEliminarId, setConfirmarEliminarId] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [verQRDe, setVerQRDe] = useState<{ nombre: string; qrToken: string } | null>(null);

  function buscar(valor: string) {
    setBusqueda(valor);
    startTransition(async () => {
      const resultado = await listarInscritosAction(valor);
      setInscritos(resultado);
    });
  }

  async function eliminar(id: string) {
    setEliminandoId(id);
    setMensaje(null);

    const resp = await eliminarInscritoAction(id);

    setEliminandoId(null);
    setConfirmarEliminarId(null);

    if (resp.ok) {
      setInscritos((prev) => prev.filter((i) => i.id !== id));
    } else {
      setMensaje("No se pudo eliminar la inscripción.");
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4 flex-wrap">
        <input
          className="input max-w-sm"
          placeholder="Buscar por nombre o documento..."
          value={busqueda}
          onChange={(e) => buscar(e.target.value)}
        />
        {mensaje && <span className="text-sm text-red-600">{mensaje}</span>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Documento</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Acompañantes</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Pago</th>
              <th className="px-4 py-3">Inscripción</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {inscritos.map((i) => (
              <tr key={i.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{i.nombres_completos}</p>
                  <p className="text-xs text-gray-500">{i.correo}</p>
                </td>
                <td className="px-4 py-3">{i.documento}</td>
                <td className="px-4 py-3">
                  {i.tipo_egresado === "socio" ? "Socio" : "No socio"}
                </td>
                <td className="px-4 py-3">{i.cantidad_acompanantes}</td>
                <td className="px-4 py-3">{formatoCOP(i.total)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${COLOR_ESTADO_PAGO[i.estado_pago]}`}
                  >
                    {ETIQUETA_ESTADO_PAGO[i.estado_pago]}
                  </span>
                </td>
                <td className="px-4 py-3 capitalize">{i.estado_inscripcion}</td>
                <td className="px-4 py-3">
                  {confirmarEliminarId === i.id ? (
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <span className="text-xs text-red-600">¿Seguro?</span>
                      <button
                        onClick={() => eliminar(i.id)}
                        disabled={eliminandoId === i.id}
                        className="text-xs px-2 py-1 rounded bg-red-600 text-white disabled:opacity-60"
                      >
                        {eliminandoId === i.id ? "..." : "Sí"}
                      </button>
                      <button
                        onClick={() => setConfirmarEliminarId(null)}
                        className="text-xs px-2 py-1 rounded border border-gray-300"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 whitespace-nowrap">
                      {i.qr_token ? (
                        <button
                          onClick={() =>
                            setVerQRDe({ nombre: i.nombres_completos, qrToken: i.qr_token! })
                          }
                          className="text-sm text-gray-900 underline"
                        >
                          Ver QR
                        </button>
                      ) : (
                        <span className="text-sm text-gray-300" title="Aún no confirmada, sin QR">
                          Ver QR
                        </span>
                      )}

                      <a
                        href={`/admin/inscritos/${i.id}`}
                        className="text-sm text-gray-900 underline"
                      >
                        Editar
                      </a>
                      <button
                        onClick={() => setConfirmarEliminarId(i.id)}
                        className="text-sm text-red-600 underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {inscritos.length === 0 && !pending && (
          <p className="text-center text-gray-500 py-8 text-sm">
            No se encontraron inscritos.
          </p>
        )}
      </div>

      {verQRDe && (
        <ModalQR
          nombre={verQRDe.nombre}
          qrToken={verQRDe.qrToken}
          onCerrar={() => setVerQRDe(null)}
        />
      )}
    </div>
  );
}