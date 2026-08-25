"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  actualizarInscritoAction,
  eliminarInscritoAction,
  type InscritoDetalle,
} from "@/app/actions/inscritos-admin";
import type { Talla, Actividad } from "@/types/database";

type Acompanante = { id?: string; nombre: string; documento: string; edad: number };

export default function FormularioEditarInscrito({
  inscrito,
  tallas,
  actividades,
}: {
  inscrito: InscritoDetalle;
  tallas: Talla[];
  actividades: Actividad[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    nombres_completos: inscrito.nombres_completos,
    documento: inscrito.documento,
    correo: inscrito.correo,
    celular: inscrito.celular,
    genero: inscrito.genero,
    programa_academico: inscrito.programa_academico,
    talla_id: inscrito.talla_id,
    actividades_ids: inscrito.actividades_ids,
    comentarios: inscrito.comentarios ?? "",
    tipo_egresado: inscrito.tipo_egresado,
  });
  const [acompanantes, setAcompanantes] = useState<Acompanante[]>(inscrito.acompanantes);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  function actualizarCampo<K extends keyof typeof form>(campo: K, valor: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function actualizarAcompanante(index: number, campo: keyof Acompanante, valor: string) {
    setAcompanantes((prev) => {
      const copia = [...prev];
      copia[index] = { ...copia[index], [campo]: campo === "edad" ? Number(valor) : valor };
      return copia;
    });
  }

  function agregarAcompanante() {
    setAcompanantes((prev) => [...prev, { nombre: "", documento: "", edad: 0 }]);
  }

  function quitarAcompanante(index: number) {
    setAcompanantes((prev) => prev.filter((_, i) => i !== index));
  }

  async function guardar() {
    setGuardando(true);
    setMensaje(null);

    const resp = await actualizarInscritoAction(inscrito.id, {
      ...form,
      actividad_id: form.actividad_id || null,
      comentarios: form.comentarios || null,
      acompanantes,
    });

    setGuardando(false);

    if (!resp.ok) {
      setMensaje({ tipo: "error", texto: resp.error });
      return;
    }

    setMensaje({ tipo: "ok", texto: "Cambios guardados correctamente." });
    router.refresh();
  }

  async function eliminar() {
    setEliminando(true);
    const resp = await eliminarInscritoAction(inscrito.id);
    setEliminando(false);

    if (resp.ok) {
      router.push("/admin/inscritos");
      router.refresh();
    } else {
      setMensaje({ tipo: "error", texto: "No se pudo eliminar la inscripción." });
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {mensaje && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            mensaje.tipo === "ok"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Nombres completos</span>
            <input
              className="input"
              value={form.nombres_completos}
              onChange={(e) => actualizarCampo("nombres_completos", e.target.value)}
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Documento</span>
            <input
              className="input"
              value={form.documento}
              onChange={(e) => actualizarCampo("documento", e.target.value)}
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Correo</span>
            <input
              className="input"
              type="email"
              value={form.correo}
              onChange={(e) => actualizarCampo("correo", e.target.value)}
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Celular</span>
            <input
              className="input"
              value={form.celular}
              onChange={(e) => actualizarCampo("celular", e.target.value)}
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Género</span>
            <select
              className="input"
              value={form.genero}
              onChange={(e) => actualizarCampo("genero", e.target.value as "M" | "F")}
            >
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Programa académico</span>
            <input
              className="input"
              value={form.programa_academico}
              onChange={(e) => actualizarCampo("programa_academico", e.target.value)}
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Talla</span>
            <select
              className="input"
              value={form.talla_id}
              onChange={(e) => actualizarCampo("talla_id", e.target.value)}
            >
              {tallas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </label>
                    <label className="block md:col-span-2">
            <span className="block text-sm font-medium text-gray-700 mb-1">Actividades</span>
            <div className="flex flex-wrap gap-2">
              {actividades.map((a) => {
                const seleccionada = form.actividades_ids.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        actividades_ids: seleccionada
                          ? prev.actividades_ids.filter((id) => id !== a.id)
                          : [...prev.actividades_ids, a.id],
                      }))
                    }
                    className={`px-3 py-1.5 rounded-full border text-sm ${
                      seleccionada
                        ? "bg-gray-900 text-white border-gray-900"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    {a.nombre}
                  </button>
                );
              })}
            </div>
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Tipo</span>
            <select
              className="input"
              value={form.tipo_egresado}
              onChange={(e) => actualizarCampo("tipo_egresado", e.target.value as "socio" | "no_socio")}
            >
              <option value="socio">Socio</option>
              <option value="no_socio">No socio</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="block text-sm font-medium text-gray-700 mb-1">Comentarios</span>
          <textarea
            className="input"
            rows={3}
            value={form.comentarios}
            onChange={(e) => actualizarCampo("comentarios", e.target.value)}
          />
        </label>

        <p className="text-xs text-gray-500">
          Estado de pago: <span className="font-medium">{inscrito.estado_pago}</span> · Estado de
          inscripción: <span className="font-medium">{inscrito.estado_inscripcion}</span>. Estos se
          gestionan desde el módulo Pagos, no aquí.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Acompañantes</h3>
          <button
            onClick={agregarAcompanante}
            className="text-sm px-3 py-1 rounded-lg border border-gray-300"
          >
            + Agregar
          </button>
        </div>

        {acompanantes.length === 0 && <p className="text-sm text-gray-400">Sin acompañantes</p>}

        {acompanantes.map((a, i) => (
          <div key={a.id ?? i} className="border border-gray-200 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Acompañante {i + 1}</span>
              <button onClick={() => quitarAcompanante(i)} className="text-xs text-red-600">
                Quitar
              </button>
            </div>
            <input
              className="input"
              placeholder="Nombre"
              value={a.nombre}
              onChange={(e) => actualizarAcompanante(i, "nombre", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="input"
                placeholder="Documento"
                value={a.documento}
                onChange={(e) => actualizarAcompanante(i, "documento", e.target.value)}
              />
              <input
                className="input"
                type="number"
                placeholder="Edad"
                value={a.edad || ""}
                onChange={(e) => actualizarAcompanante(i, "edad", e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={guardar}
          disabled={guardando}
          className="px-5 py-2 rounded-lg bg-gray-900 text-white disabled:opacity-60"
        >
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>

        {!confirmarEliminar ? (
          <button
            onClick={() => setConfirmarEliminar(true)}
            className="px-4 py-2 rounded-lg border border-red-300 text-red-600 text-sm"
          >
            Eliminar inscripción
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-red-600">¿Seguro? No se puede deshacer.</span>
            <button
              onClick={eliminar}
              disabled={eliminando}
              className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm disabled:opacity-60"
            >
              {eliminando ? "Eliminando..." : "Sí, eliminar"}
            </button>
            <button
              onClick={() => setConfirmarEliminar(false)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}