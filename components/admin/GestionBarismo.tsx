"use client";

import { useState } from "react";
import {
  confirmarPagoBarismoAction,
  eliminarBarismoAction,
} from "@/app/actions/barismo";
import type { CompetenciaBarismo } from "@/types/database";

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

export default function GestionBarismo({
  inscripcionesIniciales,
}: {
  inscripcionesIniciales: CompetenciaBarismo[];
}) {
  const [inscripciones, setInscripciones] = useState(inscripcionesIniciales);
  const [procesando, setProcesando] = useState<string | null>(null);
  const [confirmarEliminarId, setConfirmarEliminarId] = useState<string | null>(null);

  const activos = inscripciones.filter((i) => i.estado_pago !== "pago_rechazado").length;

  async function confirmar(id: string, nuevoEstado: "pago_confirmado" | "pago_rechazado") {
    setProcesando(id);
    const resp = await confirmarPagoBarismoAction(id, nuevoEstado);
    setProcesando(null);

    if (resp.ok) {
      setInscripciones((prev) =>
        prev.map((i) => (i.id === id ? { ...i, estado_pago: nuevoEstado } : i))
      );
    }
  }

  async function eliminar(id: string) {
    setProcesando(id);
    const resp = await eliminarBarismoAction(id);
    setProcesando(null);
    setConfirmarEliminarId(null);

    if (resp.ok) {
      setInscripciones((prev) => prev.filter((i) => i.id !== id));
    }
  }

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <p className="text-sm text-gray-500">
          Cupos ocupados: <span className="font-semibold text-navy">{activos} / 30</span>
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Documento</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3">Marca</th>
                <th className="px-4 py-3">Experiencia</th>
                <th className="px-4 py-3">Método F1</th>
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
                    <td className="px-4 py-3 font-medium text-gray-900">{i.nombre_completo}</td>
                    <td className="px-4 py-3">{i.documento}</td>
                    <td className="px-4 py-3">{i.whatsapp}</td>
                    <td className="px-4 py-3">
                      {i.representa_marca ? i.marca_nombre : "Independiente"}
                    </td>
                    <td className="px-4 py-3">{i.experiencia}</td>
                    <td className="px-4 py-3">{i.metodo_fase1}</td>
                    <td className="px-4 py-3">{formatoCOP(i.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${estado.color}`}>
                        {estado.texto}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {confirmarEliminarId === i.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => eliminar(i.id)}
                            disabled={procesandoEsta}
                            className="text-xs px-2 py-1 rounded bg-red-600 text-white"
                          >
                            Sí
                          </button>
                          <button
                            onClick={() => setConfirmarEliminarId(null)}
                            className="text-xs px-2 py-1 rounded border border-gray-300"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 flex-wrap">
                          {i.estado_pago !== "pago_confirmado" && (
                            <button
                              onClick={() => confirmar(i.id, "pago_confirmado")}
                              disabled={procesandoEsta}
                              className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs"
                            >
                              Confirmar
                            </button>
                          )}
                          {i.estado_pago !== "pago_rechazado" && (
                            <button
                              onClick={() => confirmar(i.id, "pago_rechazado")}
                              disabled={procesandoEsta}
                              className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs"
                            >
                              Rechazar
                            </button>
                          )}
                          <button
                            onClick={() => setConfirmarEliminarId(i.id)}
                            className="px-3 py-1 rounded-lg border border-red-300 text-red-600 text-xs"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {inscripciones.length === 0 && (
            <p className="text-center text-gray-500 py-8 text-sm">No hay inscripciones aún.</p>
          )}
        </div>
      </div>
    </div>
  );
}