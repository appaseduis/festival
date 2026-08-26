"use client";

import { useState } from "react";
import { crearEmprendimientoAction } from "@/app/actions/emprendimiento";
import { CATEGORIAS_EMPRENDIMIENTO } from "@/types/database";
import type { CategoriaEmprendimiento, TipoEgresado } from "@/types/database";
import Footer from "@/components/shared/Footer";

type FormState = {
  nombre_responsable: string;
  correo: string;
  telefono: string;
  nombre_emprendimiento: string;
  facebook: string;
  instagram: string;
  pagina_web: string;
  categoria: CategoriaEmprendimiento | "";
  categoria_otro: string;
  tipo_egresado: TipoEgresado | "";
  necesita_electricidad: boolean | null;
};

const ESTADO_INICIAL: FormState = {
  nombre_responsable: "",
  correo: "",
  telefono: "",
  nombre_emprendimiento: "",
  facebook: "",
  instagram: "",
  pagina_web: "",
  categoria: "",
  categoria_otro: "",
  tipo_egresado: "",
  necesita_electricidad: null,
};

export default function FormularioEmprendimiento({
  onEnviadoChange,
}: {
  onEnviadoChange?: (enviado: boolean) => void;
}) {
  const [form, setForm] = useState<FormState>(ESTADO_INICIAL);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  function actualizarCampo<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function validar(): string | null {
    if (!form.nombre_responsable.trim()) return "Ingresa el nombre del responsable";
    if (!/^\S+@\S+\.\S+$/.test(form.correo)) return "Correo electrónico inválido";
    if (!/^[0-9]{7,15}$/.test(form.telefono)) return "Número de teléfono inválido";
    if (!form.nombre_emprendimiento.trim()) return "Ingresa el nombre del emprendimiento";
    if (!form.categoria) return "Selecciona una categoría";
    if (form.categoria === "Otro" && !form.categoria_otro.trim())
      return "Especifica tu categoría";
    if (!form.tipo_egresado) return "Indica si eres socio o no socio";
    if (form.necesita_electricidad === null) return "Indica si necesitas conexión eléctrica";
    return null;
  }

  async function enviar() {
    const err = validar();
    if (err) {
      setError(err);
      return;
    }

    setEnviando(true);
    setError(null);

    const resp = await crearEmprendimientoAction({
      nombre_responsable: form.nombre_responsable.trim(),
      correo: form.correo.trim(),
      telefono: form.telefono.trim(),
      nombre_emprendimiento: form.nombre_emprendimiento.trim(),
      facebook: form.facebook.trim() || null,
      instagram: form.instagram.trim() || null,
      pagina_web: form.pagina_web.trim() || null,
      categoria: form.categoria as CategoriaEmprendimiento,
      categoria_otro: form.categoria_otro.trim() || null,
      tipo_egresado: form.tipo_egresado as TipoEgresado,
      necesita_electricidad: form.necesita_electricidad ?? false,
    });

    setEnviando(false);

    if (!resp.ok) {
      setError(resp.error);
      return;
    }

    setEnviado(true);
    onEnviadoChange?.(true);
  }

  if (enviado) {
    return (
      <div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-uis-green p-6 md:p-8 text-center space-y-2">
          <p className="text-lg font-semibold text-navy">
            ¡Preinscripción enviada correctamente! 🎉
          </p>
          <p className="text-sm text-gray-600">
            Nuestro equipo revisará tu emprendimiento. El equipo se contactará a
            partir del <strong>16 de septiembre de 2026</strong> para confirmar tu
            participación.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-uis-green p-6 md:p-8 space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm p-3">
          {error}
        </div>
      )}

      <Campo label="Nombre completo del responsable">
        <input
          className="input"
          value={form.nombre_responsable}
          onChange={(e) => actualizarCampo("nombre_responsable", e.target.value)}
        />
      </Campo>

      <Campo label="Correo electrónico">
        <input
          className="input"
          type="email"
          value={form.correo}
          onChange={(e) => actualizarCampo("correo", e.target.value)}
        />
      </Campo>

      <Campo label="Número de teléfono">
        <input
          className="input"
          inputMode="numeric"
          value={form.telefono}
          onChange={(e) => actualizarCampo("telefono", e.target.value)}
        />
      </Campo>

      <Campo label="Nombre del Emprendimiento / Marca">
        <input
          className="input"
          value={form.nombre_emprendimiento}
          onChange={(e) => actualizarCampo("nombre_emprendimiento", e.target.value)}
        />
      </Campo>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Campo label="Facebook (opcional)">
          <input
            className="input"
            value={form.facebook}
            onChange={(e) => actualizarCampo("facebook", e.target.value)}
          />
        </Campo>
        <Campo label="Instagram (opcional)">
          <input
            className="input"
            value={form.instagram}
            onChange={(e) => actualizarCampo("instagram", e.target.value)}
          />
        </Campo>
        <Campo label="Página web (opcional)">
          <input
            className="input"
            value={form.pagina_web}
            onChange={(e) => actualizarCampo("pagina_web", e.target.value)}
          />
        </Campo>
      </div>

      <Campo label="Categoría del emprendimiento">
        <select
          className="input"
          value={form.categoria}
          onChange={(e) => actualizarCampo("categoria", e.target.value as CategoriaEmprendimiento)}
        >
          <option value="">Selecciona una categoría</option>
          {CATEGORIAS_EMPRENDIMIENTO.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Campo>

      {form.categoria === "Otro" && (
        <Campo label='Especifica tu categoría de producto principal'>
          <input
            className="input"
            value={form.categoria_otro}
            onChange={(e) => actualizarCampo("categoria_otro", e.target.value)}
          />
        </Campo>
      )}

      <Campo label="¿Eres socio o no socio de ASEDUIS?">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => actualizarCampo("tipo_egresado", "socio")}
            className={`flex-1 py-2 rounded-lg border ${
              form.tipo_egresado === "socio" ? "bg-navy text-white border-navy" : "border-gray-300"
            }`}
          >
            Socio ASEDUIS ($190.000)
          </button>
          <button
            type="button"
            onClick={() => actualizarCampo("tipo_egresado", "no_socio")}
            className={`flex-1 py-2 rounded-lg border ${
              form.tipo_egresado === "no_socio" ? "bg-navy text-white border-navy" : "border-gray-300"
            }`}
          >
            No asociado ($220.000)
          </button>
        </div>
      </Campo>

      <Campo label="¿Necesita conexión eléctrica en su stand? (costo adicional $30.000)">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => actualizarCampo("necesita_electricidad", true)}
            className={`flex-1 py-2 rounded-lg border ${
              form.necesita_electricidad === true ? "bg-navy text-white border-navy" : "border-gray-300"
            }`}
          >
            Sí
          </button>
          <button
            type="button"
            onClick={() => actualizarCampo("necesita_electricidad", false)}
            className={`flex-1 py-2 rounded-lg border ${
              form.necesita_electricidad === false ? "bg-navy text-white border-navy" : "border-gray-300"
            }`}
          >
            No
          </button>
        </div>
      </Campo>

      <button
        type="button"
        onClick={enviar}
        disabled={enviando}
        className="w-full py-3 rounded-lg bg-navy hover:bg-[#00A3E0] transition-colors text-white font-medium disabled:opacity-60"
      >
        {enviando ? "Enviando..." : "Enviar preinscripción"}
      </button>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      {children}
    </label>
  );
}