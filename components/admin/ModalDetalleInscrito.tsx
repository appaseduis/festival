"use client";

import { useEffect, useState } from "react";
import { obtenerDetallePagoAction, type DetallePagoInscrito } from "@/app/actions/pagos-admin";

export default function ModalDetalleInscrito({
  inscritoId,
  onCerrar,
}: {
  inscritoId: string;
  onCerrar: () => void;
}) {
  const [detalle, setDetalle] = useState<DetallePagoInscrito | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;

    obtenerDetallePagoAction(inscritoId).then((data) => {
      if (!cancelado) {
        setDetalle(data);
        setCargando(false);
      }
    });

    return () => {
      cancelado = true;
    };
  }, [inscritoId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onCerrar}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {cargando && <p className="text-center text-sm text-gray-500 py-8">Cargando...</p>}

        {!cargando && !detalle && (
          <p className="text-center text-sm text-red-600 py-8">No se pudo cargar la información.</p>
        )}

        {detalle && (
          <>
            <div>
              <p className="text-lg font-semibold text-navy">{detalle.nombres_completos}</p>
              <p className="text-sm text-gray-500">CC {detalle.documento}</p>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium text-gray-700">Correo:</span> {detalle.correo}
              </p>
              <p>
                <span className="font-medium text-gray-700">Celular:</span> {detalle.celular}
              </p>
              <p>
                <span className="font-medium text-gray-700">Género:</span>{" "}
                {detalle.genero === "M" ? "Masculino" : "Femenino"}
              </p>
              <p>
                <span className="font-medium text-gray-700">Programa/Vínculo UIS:</span>{" "}
                {detalle.programa_academico}
              </p>
              <p>
                <span className="font-medium text-gray-700">Tipo:</span>{" "}
                {detalle.tipo_egresado === "socio" ? "Socio" : "No socio"}
              </p>
              {detalle.comentarios && (
                <p>
                  <span className="font-medium text-gray-700">Comentarios:</span>{" "}
                  {detalle.comentarios}
                </p>
              )}
            </div>

            {detalle.cantidad_acompanantes > 0 && (
              <div>
                <p className="font-medium text-gray-700 text-sm mb-2">
                  Acompañantes ({detalle.cantidad_acompanantes})
                </p>
                <div className="space-y-2">
                  {detalle.acompanantes.map((a, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-2 text-sm">
                      <p className="font-medium">{a.nombre}</p>
                      <p className="text-xs text-gray-500">
                        CC {a.documento} · {a.edad} años
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <a
              href={`/admin/inscritos/${detalle.id}`}
              className="block text-center text-sm text-navy underline"
            >
              Editar esta inscripción →
            </a>
          </>
        )}

        <button
          type="button"
          onClick={onCerrar}
          className="w-full px-5 py-2 rounded-lg bg-navy text-white text-sm font-medium"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}