"use client";

import { useState, useTransition } from "react";
import {
  listarInscripcionesPagoAction,
  confirmarPagoAdminAction,
  marcarEnRevisionAction,
  type InscripcionPago,
} from "@/app/actions/pagos-admin";

function formatoCOP(valor: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}

const ETIQUETA_ESTADO: Record<string, { texto: string; color: string }> = {
  pendiente_pago: { texto: "Pendiente", color: "bg-gray-100 text-gray-700" },
  comprobante_en_revision: { texto: "En revisión", color: "bg-amber-100 text-amber-700" },
  pago_confirmado: { texto: "Confirmado", color: "bg-green-100 text-green-700" },
  pago_rechazado: { texto: "Rechazado", color: "bg-red-100 text-red-700" },
};

export default function GestionPagos({
  inscripcionesIniciales,
}: {
  inscripcionesIniciales: InscripcionPago[];
}) {
  const [filtro, setFiltro] = useState<"pendientes" | "todas">("pendientes");
  const [inscripciones, setInscripciones] = useState(inscripcionesIniciales);
  const [pending, startTransition] = useTransition();
  const [procesando, setProcesando] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  function cambiarFiltro(nuevo: "pendientes" | "todas") {
    setFiltro(nuevo);
    startTransition(async () => {
      const resultado = await listarInscripcionesPagoAction(nuevo);
      setInscripciones(resultado);
    });
  }

  async function confirmar(id: string, nuevoEstado: "pago_confirmado" | "pago_rechazado") {
    setProcesando(id);
    setMensaje(null);

    const resp = await confirmarPagoAdminAction(id, nuevoEstado);

    setProcesando(null);

    if (!resp.ok) {
      setMensaje(resp.error);
      return;
    }

    setInscripciones((prev) =>
      prev.map((i) => (i.id === id ? { ...i, estado_pago: nuevoEstado } : i))
    );
  }

  async function marcarRevision(id: string) {
    setProcesando(id);
    const resp = await marcarEnRevisionAction(id);
    setProcesando(null);

    if (resp.ok) {
      setInscripciones((prev) =>
        prev.map((i) => (i.id === id ? { ...i, estado_pago: "comprobante_en_revision" } : i))
      );
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => cambiarFiltro("pendientes")}
          className={`px-4 py-2 rounded-lg text-sm font-medium border ${
            filtro === "pendientes" ? "bg-gray-900 text-white border-gray-900" : "border-gray-300"
          }`}
        >
          Pendientes
        </button>
        <button
          onClick={() => cambiarFiltro("todas")}
          className={`px-4 py-2 rounded-lg text-sm font-medium border ${
            filtro === "todas" ? "bg-gray-900 text-white border-gray-900" : "border-gray-300"
          }`}
        >
          Todas
        </button>
      </div>

      {mensaje && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm p-3">
          {mensaje}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Documento</th>
                <th className="px-4 py-3">Celular</th>
                <th className="px-4 py-3">Método</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inscripciones.map((i) => {
                const estado = ETIQUETA_ESTADO[i.estado_pago];
                const procesandoEsta = procesando === i.id;

                return (
                  <tr key={i.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{i.nombres_completos}</td>
                    <td className="px-4 py-3">{i.documento}</td>
                    <td className="px-4 py-3">{i.celular}</td>
                    <td className="px-4 py-3 capitalize">{i.metodo_pago ?? "—"}</td>
                    <td className="px-4 py-3">{formatoCOP(i.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${estado.color}`}>
                        {estado.texto}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {(i.estado_pago === "pendiente_pago" ||
                        i.estado_pago === "comprobante_en_revision") && (
                        <div className="flex gap-2 flex-wrap">
                          {i.estado_pago === "pendiente_pago" && (
                            <button
                              onClick={() => marcarRevision(i.id)}
                              disabled={procesandoEsta}
                              className="px-3 py-1 rounded-lg border border-gray-300 text-xs disabled:opacity-50"
                            >
                              En revisión
                            </button>
                          )}
                          <button
                            onClick={() => confirmar(i.id, "pago_confirmado")}
                            disabled={procesandoEsta}
                            className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs disabled:opacity-50"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => confirmar(i.id, "pago_rechazado")}
                            disabled={procesandoEsta}
                            className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs disabled:opacity-50"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {inscripciones.length === 0 && !pending && (
            <p className="text-center text-gray-500 py-8 text-sm">
              No hay inscripciones {filtro === "pendientes" ? "pendientes" : "registradas"}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}