"use client";

import { useState, useTransition } from "react";
import {
  listarEmprendimientosAction,
  actualizarEstadoEmprendimientoAction,
  eliminarEmprendimientoAction,
} from "@/app/actions/emprendimiento";
import type { Emprendimiento, EstadoEmprendimiento } from "@/types/database";

const FILTROS: { valor: EstadoEmprendimiento | "todos"; label: string }[] = [
  { valor: "todos", label: "Todos" },
  { valor: "preinscrito", label: "Preinscritos" },
  { valor: "aceptado", label: "Aceptados" },
  { valor: "rechazado", label: "Rechazados" },
];

const COLOR_ESTADO: Record<EstadoEmprendimiento, string> = {
  preinscrito: "bg-gray-100 text-gray-700",
  aceptado: "bg-green-100 text-green-700",
  rechazado: "bg-red-100 text-red-700",
};

const ETIQUETA_ESTADO: Record<EstadoEmprendimiento, string> = {
  preinscrito: "Preinscrito",
  aceptado: "Aceptado",
  rechazado: "Rechazado",
};

export default function GestionEmprendimientos({
  emprendimientosIniciales,
}: {
  emprendimientosIniciales: Emprendimiento[];
}) {
  const [filtro, setFiltro] = useState<EstadoEmprendimiento | "todos">("todos");
  const [emprendimientos, setEmprendimientos] = useState(emprendimientosIniciales);
  const [pending, startTransition] = useTransition();
  const [procesando, setProcesando] = useState<string | null>(null);
  const [confirmarEliminarId, setConfirmarEliminarId] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  function cambiarFiltro(nuevo: EstadoEmprendimiento | "todos") {
    setFiltro(nuevo);
    startTransition(async () => {
      const resultado = await listarEmprendimientosAction(nuevo);
      setEmprendimientos(resultado);
    });
  }

  async function cambiarEstado(id: string, estado: EstadoEmprendimiento) {
    setProcesando(id);
    const resp = await actualizarEstadoEmprendimientoAction(id, estado);
    setProcesando(null);

    if (resp.ok) {
      setEmprendimientos((prev) => {
        if (filtro !== "todos" && filtro !== estado) {
          return prev.filter((e) => e.id !== id);
        }
        return prev.map((e) => (e.id === id ? { ...e, estado } : e));
      });
    }
  }

  async function eliminar(id: string) {
    setEliminandoId(id);
    const resp = await eliminarEmprendimientoAction(id);
    setEliminandoId(null);
    setConfirmarEliminarId(null);

    if (resp.ok) {
      setEmprendimientos((prev) => prev.filter((e) => e.id !== id));
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTROS.map((f) => (
          <button
            key={f.valor}
            onClick={() => cambiarFiltro(f.valor)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${
              filtro === f.valor ? "bg-gray-900 text-white border-gray-900" : "border-gray-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="px-4 py-3">Emprendimiento</th>
                <th className="px-4 py-3">Responsable</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Electricidad</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {emprendimientos.map((e) => {
                const procesandoEste = procesando === e.id;

                return (
                  <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{e.nombre_emprendimiento}</p>
                      <div className="flex gap-2 text-xs text-gray-500">
                        {e.facebook && <span>FB</span>}
                        {e.instagram && <span>IG</span>}
                        {e.pagina_web && <span>Web</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">{e.nombre_responsable}</td>
                    <td className="px-4 py-3">
                      <p>{e.correo}</p>
                      <p className="text-xs text-gray-500">{e.telefono}</p>
                    </td>
                    <td className="px-4 py-3">
                      {e.categoria === "Otro" ? e.categoria_otro || "Otro" : e.categoria}
                    </td>
                    <td className="px-4 py-3">{e.tipo_egresado === "socio" ? "Socio" : "No socio"}</td>
                    <td className="px-4 py-3">{e.necesita_electricidad ? "Sí" : "No"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${COLOR_ESTADO[e.estado]}`}
                      >
                        {ETIQUETA_ESTADO[e.estado]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {confirmarEliminarId === e.id ? (
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <span className="text-xs text-red-600">¿Seguro?</span>
                          <button
                            onClick={() => eliminar(e.id)}
                            disabled={eliminandoId === e.id}
                            className="text-xs px-2 py-1 rounded bg-red-600 text-white disabled:opacity-60"
                          >
                            {eliminandoId === e.id ? "..." : "Sí"}
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
                          {e.estado !== "aceptado" && (
                            <button
                              onClick={() => cambiarEstado(e.id, "aceptado")}
                              disabled={procesandoEste}
                              className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs disabled:opacity-50"
                            >
                              Aceptar
                            </button>
                          )}
                          {e.estado !== "rechazado" && (
                            <button
                              onClick={() => cambiarEstado(e.id, "rechazado")}
                              disabled={procesandoEste}
                              className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs disabled:opacity-50"
                            >
                              Rechazar
                            </button>
                          )}
                          {e.estado !== "preinscrito" && (
                            <button
                              onClick={() => cambiarEstado(e.id, "preinscrito")}
                              disabled={procesandoEste}
                              className="px-3 py-1 rounded-lg border border-gray-300 text-xs disabled:opacity-50"
                            >
                              Volver a preinscrito
                            </button>
                          )}
                          <button
                            onClick={() => setConfirmarEliminarId(e.id)}
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

          {emprendimientos.length === 0 && !pending && (
            <p className="text-center text-gray-500 py-8 text-sm">
              No hay emprendimientos {filtro !== "todos" ? `en estado "${filtro}"` : "registrados"}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}