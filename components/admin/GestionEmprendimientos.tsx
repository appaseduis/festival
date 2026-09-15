"use client";

import { useState, useTransition } from "react";
import {
  listarEmprendimientosAction,
  actualizarEstadoEmprendimientoAction,
  eliminarEmprendimientoAction,
  asignarValorPagoAction,
  confirmarPagoEmprendimientoAction,
  corregirTipoEgresadoAction,
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

function formatoCOP(valor: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}

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
  const [valorEditando, setValorEditando] = useState<Record<string, string>>({});
  const [guardandoValorId, setGuardandoValorId] = useState<string | null>(null);
  const [pagoAbiertoId, setPagoAbiertoId] = useState<string | null>(null);
  const [mensajeCopiadoId, setMensajeCopiadoId] = useState<string | null>(null);

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

  async function corregirTipo(id: string, tipo: "socio" | "no_socio") {
    const resp = await corregirTipoEgresadoAction(id, tipo);
    if (resp.ok) {
      setEmprendimientos((prev) =>
        prev.map((e) => (e.id === id ? { ...e, tipo_egresado: tipo } : e))
      );
      // Prellenamos el campo de valor con la sugerencia, pero SIN guardar
      // automáticamente: el admin decide si ajustarlo (ej. + electricidad)
      const sugerido = tipo === "socio" ? 190000 : 220000;
      setValorEditando((prev) => ({ ...prev, [id]: String(sugerido) }));
    }
  }

  async function guardarValor(id: string) {
    const valor = Number(valorEditando[id]);
    if (!valor || valor <= 0) return;

    setGuardandoValorId(id);
    const resp = await asignarValorPagoAction(id, valor);
    setGuardandoValorId(null);

    if (resp.ok) {
      setEmprendimientos((prev) =>
        prev.map((e) => (e.id === id ? { ...e, valor_pago: valor } : e))
      );
    }
  }

  async function confirmarPago(id: string, estado: "pago_confirmado" | "pago_rechazado") {
    const resp = await confirmarPagoEmprendimientoAction(id, estado);
    if (resp.ok) {
      setEmprendimientos((prev) =>
        prev.map((e) => (e.id === id ? { ...e, estado_pago: estado } : e))
      );
    }
  }

  function copiarMensajePago(e: Emprendimiento) {
    const link = `${window.location.origin}/emprendimientos/pago/${e.id}`;
    const mensaje = `Hola ${e.nombre_responsable}, buenos días 👋

¡Tu emprendimiento "${e.nombre_emprendimiento}" ha sido ACEPTADO para el Festival de Emprendedores UIS! 🎉

Valor a pagar para tu stand: ${formatoCOP(e.valor_pago ?? 0)}

Realiza tu pago aquí: ${link}

Cualquier duda, quedamos atentos. ¡Nos vemos en octubre! 🎓`;

    navigator.clipboard.writeText(mensaje);
    setMensajeCopiadoId(e.id);
    setTimeout(() => setMensajeCopiadoId(null), 2000);
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
                const pagoAbierto = pagoAbiertoId === e.id;

                return (
                  <>
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
                            {e.estado === "aceptado" && (
                              <button
                                onClick={() => setPagoAbiertoId(pagoAbierto ? null : e.id)}
                                className="px-3 py-1 rounded-lg border border-navy text-navy text-xs"
                              >
                                {pagoAbierto ? "Ocultar pago" : "Gestionar pago"}
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

                    {pagoAbierto && e.estado === "aceptado" && (
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <td colSpan={8} className="px-4 py-4">
                          <div className="max-w-lg space-y-3">
                            <div>
                              <p className="font-medium text-gray-700 text-sm mb-1">
                                Tipo (corrige si se inscribió mal)
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => corregirTipo(e.id, "socio")}
                                  className={`px-3 py-1 rounded-lg text-xs border ${
                                    e.tipo_egresado === "socio"
                                      ? "bg-navy text-white border-navy"
                                      : "border-gray-300"
                                  }`}
                                >
                                  Socio ($190.000)
                                </button>
                                <button
                                  onClick={() => corregirTipo(e.id, "no_socio")}
                                  className={`px-3 py-1 rounded-lg text-xs border ${
                                    e.tipo_egresado === "no_socio"
                                      ? "bg-navy text-white border-navy"
                                      : "border-gray-300"
                                  }`}
                                >
                                  No socio ($220.000)
                                </button>
                              </div>
                            </div>

                            <div>
                              <p className="font-medium text-gray-700 text-sm mb-1">
                                Valor final a pagar{" "}
                                {e.necesita_electricidad && "(recuerda sumar $30.000 de electricidad si aplica)"}
                              </p>
                              <div className="flex gap-2 items-center">
                                <input
                                  type="number"
                                  className="input max-w-[140px]"
                                  placeholder={e.valor_pago ? String(e.valor_pago) : "Ej. 220000"}
                                  value={valorEditando[e.id] ?? ""}
                                  onChange={(ev) =>
                                    setValorEditando((prev) => ({ ...prev, [e.id]: ev.target.value }))
                                  }
                                />
                                <button
                                  onClick={() => guardarValor(e.id)}
                                  disabled={guardandoValorId === e.id}
                                  className="px-3 py-1 rounded-lg bg-gray-900 text-white text-xs disabled:opacity-50"
                                >
                                  Guardar
                                </button>
                                {e.valor_pago && (
                                  <span className="text-xs text-gray-500">
                                    Guardado: {formatoCOP(e.valor_pago)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {e.valor_pago && (
                              <>
                                <p className="text-xs text-gray-500">
                                  Estado de pago:{" "}
                                  <span className="font-medium">{e.estado_pago}</span>
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                  <button
                                    onClick={() => copiarMensajePago(e)}
                                    className="px-3 py-1 rounded-lg border border-gray-300 text-xs"
                                  >
                                    {mensajeCopiadoId === e.id ? "¡Copiado!" : "Copiar mensaje para correo"}
                                  </button>
                                  {e.estado_pago !== "pago_confirmado" && (
                                    <button
                                      onClick={() => confirmarPago(e.id, "pago_confirmado")}
                                      className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs"
                                    >
                                      Confirmar pago
                                    </button>
                                  )}
                                  {e.estado_pago !== "pago_rechazado" && (
                                    <button
                                      onClick={() => confirmarPago(e.id, "pago_rechazado")}
                                      className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs"
                                    >
                                      Rechazar pago
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
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