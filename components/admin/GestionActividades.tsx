"use client";

import { useState } from "react";
import {
  crearActividadAction,
  actualizarActividadAction,
  eliminarActividadAction,
  listarActividadesAction,
} from "@/app/actions/actividades";
import type { Actividad } from "@/types/database";

export default function GestionActividades({
  actividadesIniciales,
}: {
  actividadesIniciales: Actividad[];
}) {
  const [actividades, setActividades] = useState(actividadesIniciales);
  const [nuevaActividad, setNuevaActividad] = useState("");
  const [agregando, setAgregando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function agregar() {
    setAgregando(true);
    setError(null);

    const resp = await crearActividadAction(nuevaActividad);

    setAgregando(false);

    if (!resp.ok) {
      setError(resp.error ?? "No se pudo agregar.");
      return;
    }

    setNuevaActividad("");
    setActividades(await listarActividadesAction());
  }

  async function alternarActivo(id: string, activoActual: boolean) {
    setActividades((prev) =>
      prev.map((a) => (a.id === id ? { ...a, activo: !activoActual } : a))
    );
    await actualizarActividadAction(id, { activo: !activoActual });
  }

  async function eliminar(id: string) {
    setError(null);
    setEliminandoId(id);

    const resp = await eliminarActividadAction(id);

    setEliminandoId(null);

    if (!resp.ok) {
      setError("No se pudo eliminar la actividad. Intenta de nuevo.");
      return;
    }

    setActividades((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg space-y-5">
      <div className="flex gap-2">
        <input
          className="input"
          placeholder="Nombre de la actividad (ej. Fútbol, Ajedrez...)"
          value={nuevaActividad}
          onChange={(e) => setNuevaActividad(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && agregar()}
        />
        <button
          onClick={agregar}
          disabled={agregando || !nuevaActividad.trim()}
          className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium disabled:opacity-60 whitespace-nowrap"
        >
          {agregando ? "Agregando..." : "Agregar"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-2">
        {actividades.length === 0 && (
          <p className="text-sm text-gray-400">Aún no hay actividades registradas.</p>
        )}

        {actividades.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={a.activo}
                  onChange={() => alternarActivo(a.id, a.activo)}
                />
                <span className={a.activo ? "text-gray-900" : "text-gray-400 line-through"}>
                  {a.nombre}
                </span>
              </label>
            </div>
            <button
              onClick={() => eliminar(a.id)}
              disabled={eliminandoId === a.id}
              className="text-xs text-red-600 underline disabled:opacity-50"
            >
              {eliminandoId === a.id ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500">
        Desmarca una actividad para ocultarla del formulario público sin borrarla.
        Al eliminar una actividad que ya fue elegida por algún inscrito, se quita
        de sus selecciones pero la inscripción no se ve afectada.
      </p>
    </div>
  );
}