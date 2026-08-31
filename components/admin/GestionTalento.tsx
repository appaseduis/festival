"use client";

import { useState, useTransition } from "react";
import {
  listarTalentosAction,
  actualizarEstadoTalentoAction,
  eliminarTalentoAction,
} from "@/app/actions/talento";
import type { TalentoCultural, EstadoTalento } from "@/types/database";

const FILTROS: { valor: EstadoTalento | "todos"; label: string }[] = [
  { valor: "todos", label: "Todos" },
  { valor: "preinscrito", label: "Preinscritos" },
  { valor: "aceptado", label: "Aceptados" },
  { valor: "rechazado", label: "Rechazados" },
];

const COLOR_ESTADO: Record<EstadoTalento, string> = {
  preinscrito: "bg-gray-100 text-gray-700",
  aceptado: "bg-green-100 text-green-700",
  rechazado: "bg-red-100 text-red-700",
};

const ETIQUETA_ESTADO: Record<EstadoTalento, string> = {
  preinscrito: "Preinscrito",
  aceptado: "Aceptado",
  rechazado: "Rechazado",
};

export default function GestionTalento({
  talentosIniciales,
}: {
  talentosIniciales: TalentoCultural[];
}) {
  const [filtro, setFiltro] = useState<EstadoTalento | "todos">("todos");
  const [talentos, setTalentos] = useState(talentosIniciales);
  const [pending, startTransition] = useTransition();
  const [procesando, setProcesando] = useState<string | null>(null);
  const [confirmarEliminarId, setConfirmarEliminarId] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);

  function cambiarFiltro(nuevo: EstadoTalento | "todos") {
    setFiltro(nuevo);
    startTransition(async () => {
      const resultado = await listarTalentosAction(nuevo);
      setTalentos(resultado);
    });
  }

  async function cambiarEstado(id: string, estado: EstadoTalento) {
    setProcesando(id);
    const resp = await actualizarEstadoTalentoAction(id, estado);
    setProcesando(null);

    if (resp.ok) {
      setTalentos((prev) => {
        if (filtro !== "todos" && filtro !== estado) {
          return prev.filter((t) => t.id !== id);
        }
        return prev.map((t) => (t.id === id ? { ...t, estado } : t));
      });
    }
  }

  async function eliminar(id: string) {
    setEliminandoId(id);
    const resp = await eliminarTalentoAction(id);
    setEliminandoId(null);
    setConfirmarEliminarId(null);

    if (resp.ok) {
      setTalentos((prev) => prev.filter((t) => t.id !== id));
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

      <div className="space-y-3">
        {talentos.map((t) => {
          const procesandoEste = procesando === t.id;
          const expandido = expandidoId === t.id;

          return (
            <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-medium text-gray-900">
                    {t.nombre_artistico || t.nombre_completo}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t.nombre_completo} · {t.programa_academico}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t.expresion_artistica === "Otra" ? t.expresion_otra : t.expresion_artistica}{" "}
                    · {t.cantidad_participantes} persona(s) · {t.duracion_presentacion}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${COLOR_ESTADO[t.estado]}`}
                >
                  {ETIQUETA_ESTADO[t.estado]}
                </span>
              </div>

              <button
                onClick={() => setExpandidoId(expandido ? null : t.id)}
                className="text-xs text-navy underline mt-2"
              >
                {expandido ? "Ocultar detalles" : "Ver detalles"}
              </button>

              {expandido && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Correo:</span> {t.correo}
                  </p>
                  <p>
                    <span className="font-medium">Celular:</span> {t.celular}
                  </p>
                  <p>
                    <span className="font-medium">Propuesta:</span> {t.descripcion_propuesta}
                  </p>
                  {t.enlace_portafolio && (
                    <p>
                      <span className="font-medium">Portafolio:</span>{" "}
                      <a
                        href={t.enlace_portafolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-navy underline"
                      >
                        {t.enlace_portafolio}
                      </a>
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Días disponibles:</span>{" "}
                    {t.dias_disponibles.join(", ")}
                  </p>
                  {t.requerimientos_especiales && (
                    <p>
                      <span className="font-medium">Requerimientos:</span>{" "}
                      {t.requerimientos_especiales}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-gray-100">
                {confirmarEliminarId === t.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-600">¿Eliminar esta propuesta?</span>
                    <button
                      onClick={() => eliminar(t.id)}
                      disabled={eliminandoId === t.id}
                      className="text-xs px-2 py-1 rounded bg-red-600 text-white disabled:opacity-60"
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
                    {t.estado !== "aceptado" && (
                      <button
                        onClick={() => cambiarEstado(t.id, "aceptado")}
                        disabled={procesandoEste}
                        className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs disabled:opacity-50"
                      >
                        Aceptar
                      </button>
                    )}
                    {t.estado !== "rechazado" && (
                      <button
                        onClick={() => cambiarEstado(t.id, "rechazado")}
                        disabled={procesandoEste}
                        className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs disabled:opacity-50"
                      >
                        Rechazar
                      </button>
                    )}
                    {t.estado !== "preinscrito" && (
                      <button
                        onClick={() => cambiarEstado(t.id, "preinscrito")}
                        disabled={procesandoEste}
                        className="px-3 py-1 rounded-lg border border-gray-300 text-xs disabled:opacity-50"
                      >
                        Volver a preinscrito
                      </button>
                    )}
                    <button
                      onClick={() => setConfirmarEliminarId(t.id)}
                      className="px-3 py-1 rounded-lg border border-red-300 text-red-600 text-xs"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {talentos.length === 0 && !pending && (
          <p className="text-center text-gray-500 py-8 text-sm">
            No hay propuestas {filtro !== "todos" ? `en estado "${filtro}"` : "registradas"}.
          </p>
        )}
      </div>
    </div>
  );
}