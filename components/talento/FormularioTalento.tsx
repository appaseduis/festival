"use client";

import { useState } from "react";
import { crearTalentoAction } from "@/app/actions/talento";
import {
  EXPRESIONES_ARTISTICAS,
  DURACIONES_PRESENTACION,
  DIAS_DISPONIBLES,
} from "@/types/database";
import type { ExpresionArtistica, DuracionPresentacion } from "@/types/database";
import Footer from "@/components/shared/Footer";

type FormState = {
  nombre_completo: string;
  correo: string;
  celular: string;
  programa_academico: string;
  expresion_artistica: ExpresionArtistica | "";
  expresion_otra: string;
  nombre_artistico: string;
  descripcion_propuesta: string;
  cantidad_participantes: string;
  duracion_presentacion: DuracionPresentacion | "";
  enlace_portafolio: string;
  dias_disponibles: string[];
  requerimientos_especiales: string;
  acepta_terminos: boolean;
  autoriza_imagen: boolean;
};

const ESTADO_INICIAL: FormState = {
  nombre_completo: "",
  correo: "",
  celular: "",
  programa_academico: "",
  expresion_artistica: "",
  expresion_otra: "",
  nombre_artistico: "",
  descripcion_propuesta: "",
  cantidad_participantes: "",
  duracion_presentacion: "",
  enlace_portafolio: "",
  dias_disponibles: [],
  requerimientos_especiales: "",
  acepta_terminos: false,
  autoriza_imagen: false,
};

export default function FormularioTalento({
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

  function alternarDia(dia: string) {
    setForm((prev) => ({
      ...prev,
      dias_disponibles: prev.dias_disponibles.includes(dia)
        ? prev.dias_disponibles.filter((d) => d !== dia)
        : [...prev.dias_disponibles, dia],
    }));
  }

  function validar(): string | null {
    if (!form.nombre_completo.trim()) return "Ingresa tu nombre completo";
    if (!/^\S+@\S+\.\S+$/.test(form.correo)) return "Correo electrónico inválido";
    if (!/^[0-9]{7,15}$/.test(form.celular)) return "Número de celular inválido";
    if (!form.programa_academico.trim()) return "Ingresa tu programa académico";
    if (!form.expresion_artistica) return "Selecciona tu expresión artística";
    if (form.expresion_artistica === "Otra" && !form.expresion_otra.trim())
      return "Especifica tu expresión artística";
    if (!form.descripcion_propuesta.trim() || form.descripcion_propuesta.trim().length < 10)
      return "Cuéntanos un poco más sobre tu propuesta";
    const cantidad = Number(form.cantidad_participantes);
    if (!cantidad || cantidad < 1) return "Indica cuántas personas participarían";
    if (!form.duracion_presentacion) return "Selecciona la duración aproximada";
    if (form.dias_disponibles.length === 0) return "Selecciona al menos una jornada disponible";
    if (!form.acepta_terminos) return "Debes aceptar los términos para enviar tu propuesta";
    if (!form.autoriza_imagen) return "Debes autorizar el uso de imagen para enviar tu propuesta";
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

    const resp = await crearTalentoAction({
      nombre_completo: form.nombre_completo.trim(),
      correo: form.correo.trim(),
      celular: form.celular.trim(),
      programa_academico: form.programa_academico.trim(),
      expresion_artistica: form.expresion_artistica as ExpresionArtistica,
      expresion_otra: form.expresion_otra.trim() || null,
      nombre_artistico: form.nombre_artistico.trim() || null,
      descripcion_propuesta: form.descripcion_propuesta.trim(),
      cantidad_participantes: Number(form.cantidad_participantes),
      duracion_presentacion: form.duracion_presentacion as DuracionPresentacion,
      enlace_portafolio: form.enlace_portafolio.trim() || null,
      dias_disponibles: form.dias_disponibles,
      requerimientos_especiales: form.requerimientos_especiales.trim() || null,
      acepta_terminos: form.acepta_terminos,
      autoriza_imagen: form.autoriza_imagen,
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
          <p className="text-lg font-semibold text-navy">¡Gracias por compartir tu talento! 💚</p>
          <p className="text-sm text-gray-600">
            Hemos recibido tu propuesta. Queremos que el talento de nuestros egresados también
            sea protagonista del 2.º Festival del Egresado UIS. ASEDUIS se pondrá en contacto
            con las propuestas seleccionadas.
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

      <Campo label="Nombre completo">
        <input
          className="input"
          value={form.nombre_completo}
          onChange={(e) => actualizarCampo("nombre_completo", e.target.value)}
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

      <Campo label="Celular / WhatsApp">
        <input
          className="input"
          inputMode="numeric"
          value={form.celular}
          onChange={(e) => actualizarCampo("celular", e.target.value)}
        />
      </Campo>

      <Campo label="¿Qué vínculo tienes con la UIS?">
        <textarea
          className="input"
          rows={2}
          value={form.programa_academico}
          onChange={(e) => actualizarCampo("programa_academico", e.target.value)}
        />
      </Campo>

      <Campo label="¿Cuál es tu expresión artística o cultural?">
        <select
          className="input"
          value={form.expresion_artistica}
          onChange={(e) => actualizarCampo("expresion_artistica", e.target.value as ExpresionArtistica)}
        >
          <option value="">Selecciona una opción</option>
          {EXPRESIONES_ARTISTICAS.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>
      </Campo>

      {form.expresion_artistica === "Otra" && (
        <Campo label="Especifica tu expresión artística">
          <input
            className="input"
            value={form.expresion_otra}
            onChange={(e) => actualizarCampo("expresion_otra", e.target.value)}
          />
        </Campo>
      )}

      <Campo label="Nombre artístico, de la agrupación o de la propuesta (opcional)">
        <input
          className="input"
          value={form.nombre_artistico}
          onChange={(e) => actualizarCampo("nombre_artistico", e.target.value)}
        />
      </Campo>

      <Campo label="Cuéntanos brevemente sobre tu propuesta">
        <textarea
          className="input"
          rows={4}
          placeholder="¿Qué te gustaría presentar o compartir durante el Festival?"
          value={form.descripcion_propuesta}
          onChange={(e) => actualizarCampo("descripcion_propuesta", e.target.value)}
        />
      </Campo>

      <Campo label="¿Cuántas personas participarían?">
        <input
          className="input"
          type="number"
          min={1}
          value={form.cantidad_participantes}
          onChange={(e) => actualizarCampo("cantidad_participantes", e.target.value)}
        />
      </Campo>

      <Campo label="¿Cuánto tiempo requiere aproximadamente tu presentación?">
        <select
          className="input"
          value={form.duracion_presentacion}
          onChange={(e) =>
            actualizarCampo("duracion_presentacion", e.target.value as DuracionPresentacion)
          }
        >
          <option value="">Selecciona una opción</option>
          {DURACIONES_PRESENTACION.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </Campo>

      <Campo label="Déjanos conocer tu talento (opcional)">
        <input
          className="input"
          placeholder="Enlace a Instagram, YouTube, TikTok, Drive, portafolio, etc."
          value={form.enlace_portafolio}
          onChange={(e) => actualizarCampo("enlace_portafolio", e.target.value)}
        />
      </Campo>

      <Campo label="¿Qué días podrías participar? (puedes elegir varios)">
        <div className="flex flex-wrap gap-2">
          {DIAS_DISPONIBLES.map((dia) => {
            const seleccionado = form.dias_disponibles.includes(dia);
            return (
              <button
                key={dia}
                type="button"
                onClick={() => alternarDia(dia)}
                className={`px-3 py-1.5 rounded-full border text-sm ${
                  seleccionado ? "bg-navy text-white border-navy" : "border-gray-300 text-gray-700"
                }`}
              >
                {dia}
              </button>
            );
          })}
        </div>
      </Campo>

      <Campo label="¿Tienes algún requerimiento especial para tu presentación?">
        <textarea
          className="input"
          rows={3}
          placeholder="Sonido, micrófonos, espacio, reproducción de pistas, iluminación u otro."
          value={form.requerimientos_especiales}
          onChange={(e) => actualizarCampo("requerimientos_especiales", e.target.value)}
        />
      </Campo>

      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          className="mt-1"
          checked={form.acepta_terminos}
          onChange={(e) => actualizarCampo("acepta_terminos", e.target.checked)}
        />
        <span>
          Manifiesto mi interés en participar en la programación del 2.º Festival del Egresado
          UIS y entiendo que el diligenciamiento de este formulario no garantiza la asignación de
          un espacio. ASEDUIS contactará a las propuestas seleccionadas para coordinar su
          participación.
        </span>
      </label>

      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          className="mt-1"
          checked={form.autoriza_imagen}
          onChange={(e) => actualizarCampo("autoriza_imagen", e.target.checked)}
        />
        <span>
          Autorizo el registro y uso de fotografías y videos de mi participación para la
          divulgación del Festival y de las actividades de ASEDUIS.
        </span>
      </label>

      <button
        type="button"
        onClick={enviar}
        disabled={enviando}
        className="w-full py-3 rounded-lg bg-navy hover:bg-[#00A3E0] transition-colors text-white font-medium disabled:opacity-60"
      >
        {enviando ? "Enviando..." : "Enviar mi propuesta"}
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