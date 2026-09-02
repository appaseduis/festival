"use client";

import { useState } from "react";
import { crearInscripcionBarismoAction } from "@/app/actions/barismo";
import { obtenerInfoBancolombiaAction } from "@/app/actions/pago";
import { EXPERIENCIAS_BARISMO } from "@/types/database";
import type { ExperienciaBarismo } from "@/types/database";
import BotonPagoBold from "@/components/inscripcion/BotonPagoBold";
import Footer from "@/components/shared/Footer";

type FormState = {
  nombre_completo: string;
  whatsapp: string;
  correo: string;
  documento: string;
  representa_marca: boolean | null;
  marca_nombre: string;
  experiencia: ExperienciaBarismo | "";
  metodo_fase1: string;
  acepta_reglamento: boolean;
};

const ESTADO_INICIAL: FormState = {
  nombre_completo: "",
  whatsapp: "",
  correo: "",
  documento: "",
  representa_marca: null,
  marca_nombre: "",
  experiencia: "",
  metodo_fase1: "",
  acepta_reglamento: false,
};

function formatoCOP(valor: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}

const LLAVE_BANCOLOMBIA = "0090310223";

export default function FormularioBarismo({ cuposDisponibles }: { cuposDisponibles: number }) {
  const [form, setForm] = useState<FormState>(ESTADO_INICIAL);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ id: string; total: number } | null>(null);
  const [metodoElegido, setMetodoElegido] = useState<"bold" | "bancolombia" | null>(null);
  const [infoBancolombia, setInfoBancolombia] = useState<{ qr_url: string | null; datos: string | null } | null>(null);
  const [mostrarQRGrande, setMostrarQRGrande] = useState(false);
  const [llaveCopiada, setLlaveCopiada] = useState(false);

  function actualizarCampo<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function copiarLlave() {
    try {
      await navigator.clipboard.writeText(LLAVE_BANCOLOMBIA);
      setLlaveCopiada(true);
      setTimeout(() => setLlaveCopiada(false), 2000);
    } catch {
      // Si el navegador bloquea el portapapeles, no hacemos nada más
    }
  }

  async function elegirMetodoPago(metodo: "bold" | "bancolombia") {
    setMetodoElegido(metodo);

    if (metodo === "bancolombia") {
      const info = await obtenerInfoBancolombiaAction();
      setInfoBancolombia(info);
    }
  }

  function validar(): string | null {
    if (!form.nombre_completo.trim()) return "Ingresa tu nombre completo";
    if (!/^[0-9]{7,15}$/.test(form.whatsapp)) return "Número de WhatsApp inválido";
    if (!/^\S+@\S+\.\S+$/.test(form.correo)) return "Correo electrónico inválido";
    if (!/^[0-9]{5,}$/.test(form.documento)) return "Número de documento inválido";
    if (form.representa_marca === null) return "Indica si representas alguna marca";
    if (form.representa_marca && !form.marca_nombre.trim())
      return "Especifica la cafetería, marca o tostadora";
    if (!form.experiencia) return "Selecciona tu tiempo de experiencia";
    if (!form.metodo_fase1.trim()) return "Indica el método estimado para la Fase 1";
    if (!form.acepta_reglamento) return "Debes aceptar el Reglamento Oficial para inscribirte";
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

    const resp = await crearInscripcionBarismoAction({
      nombre_completo: form.nombre_completo.trim(),
      whatsapp: form.whatsapp.trim(),
      correo: form.correo.trim(),
      documento: form.documento.trim(),
      representa_marca: form.representa_marca ?? false,
      marca_nombre: form.representa_marca ? form.marca_nombre.trim() || null : null,
      experiencia: form.experiencia as ExperienciaBarismo,
      metodo_fase1: form.metodo_fase1.trim(),
      acepta_reglamento: form.acepta_reglamento,
    });

    setEnviando(false);

    if (!resp.ok) {
      setError(resp.error);
      return;
    }

    setResultado({ id: resp.inscripcionId, total: resp.total });
  }

  if (cuposDisponibles <= 0 && !resultado) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 text-center">
        <p className="text-lg font-semibold text-navy mb-2">Cupos agotados</p>
        <p className="text-sm text-gray-600">
          Lo sentimos, los cupos de la competencia ya están completos.
        </p>
      </div>
    );
  }

  if (resultado) {
    const mensajeWhatsApp = encodeURIComponent(
      `*Inscripción Competencia de Barismo*\nNombre: ${form.nombre_completo}\nDocumento: ${form.documento}\nCorreo: ${form.correo}\nWhatsApp: ${form.whatsapp}\nTotal a pagar: ${formatoCOP(resultado.total)}`
    );

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-uis-green p-6 md:p-8 space-y-5">
        <div className="rounded-xl bg-[#7AB800]/10 border border-[#7AB800]/30 p-4 text-[#2BB673] text-sm font-medium">
          ¡Tu cupo quedó reservado! Total a pagar: {formatoCOP(resultado.total)}
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Para confirmar tu estación, completa el pago y envía tu inscripción por WhatsApp.
        </div>

        <a
          href={`https://wa.me/573242606004?text=${mensajeWhatsApp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg"
        >
          Enviar información por WhatsApp
        </a>

        {!metodoElegido && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => elegirMetodoPago("bold")}
              className="py-3 rounded-lg border-2 border-navy text-navy font-medium hover:bg-navy hover:text-white transition-colors"
            >
              Pagar con Bold
            </button>
            <button
              type="button"
              onClick={() => elegirMetodoPago("bancolombia")}
              className="py-3 rounded-lg border-2 border-navy text-navy font-medium hover:bg-navy hover:text-white transition-colors"
            >
              Pagar mediante Bancolombia
            </button>
          </div>
        )}

        {metodoElegido === "bold" && (
          <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-700 space-y-3">
            <p className="font-medium">Pago con Bold</p>
            <BotonPagoBold inscripcionId={resultado.id} amount={resultado.total} prefix="bar" />
          </div>
        )}

        {metodoElegido === "bancolombia" && (
          <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-700 space-y-3">
            <p className="font-medium">Pago mediante Bancolombia</p>

            {infoBancolombia?.qr_url ? (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={infoBancolombia.qr_url}
                  alt="QR de pago Bancolombia"
                  className="w-32 h-32 object-contain"
                />
                <button
                  type="button"
                  onClick={() => setMostrarQRGrande(true)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium"
                >
                  Mirar QR
                </button>
              </div>
            ) : (
              <p className="text-gray-500">
                El QR de pago aún no ha sido configurado por el administrador.
              </p>
            )}

            <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
              <div>
                <p className="text-xs text-gray-500">Llave Bancolombia</p>
                <p className="font-mono font-medium">{LLAVE_BANCOLOMBIA}</p>
              </div>
              <button
                type="button"
                onClick={copiarLlave}
                className="px-3 py-1.5 rounded-lg bg-navy text-white text-xs font-medium whitespace-nowrap"
              >
                {llaveCopiada ? "¡Copiada!" : "Copiar llave"}
              </button>
            </div>

            {infoBancolombia?.datos && (
              <p className="whitespace-pre-line text-gray-600">{infoBancolombia.datos}</p>
            )}

            <p className="text-amber-700">
              Después de transferir, envía el comprobante por WhatsApp al número de ASEDUIS
              usando el botón de arriba.
            </p>
          </div>
        )}

        {mostrarQRGrande && infoBancolombia?.qr_url && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setMostrarQRGrande(false)}
          >
            <div
              className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-semibold text-navy">QR de pago Bancolombia</p>
              <img
                src={infoBancolombia.qr_url}
                alt="QR de pago Bancolombia ampliado"
                className="w-full h-auto"
              />
              <button
                type="button"
                onClick={() => setMostrarQRGrande(false)}
                className="px-5 py-2 rounded-lg bg-navy text-white text-sm font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

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

      <Campo label="WhatsApp">
        <input
          className="input"
          inputMode="numeric"
          value={form.whatsapp}
          onChange={(e) => actualizarCampo("whatsapp", e.target.value)}
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

      <Campo label="Cédula de Ciudadanía">
        <input
          className="input"
          inputMode="numeric"
          value={form.documento}
          onChange={(e) => actualizarCampo("documento", e.target.value)}
        />
      </Campo>

      <Campo label="¿Representas a alguna cafetería, marca o tostadora?">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => actualizarCampo("representa_marca", true)}
            className={`flex-1 py-2 rounded-lg border ${
              form.representa_marca === true ? "bg-navy text-white border-navy" : "border-gray-300"
            }`}
          >
            Sí
          </button>
          <button
            type="button"
            onClick={() => actualizarCampo("representa_marca", false)}
            className={`flex-1 py-2 rounded-lg border ${
              form.representa_marca === false ? "bg-navy text-white border-navy" : "border-gray-300"
            }`}
          >
            No, independiente
          </button>
        </div>
      </Campo>

      {form.representa_marca && (
        <Campo label="Especifica la cafetería, marca o tostadora">
          <input
            className="input"
            value={form.marca_nombre}
            onChange={(e) => actualizarCampo("marca_nombre", e.target.value)}
          />
        </Campo>
      )}

      <Campo label="Tiempo de experiencia">
        <select
          className="input"
          value={form.experiencia}
          onChange={(e) => actualizarCampo("experiencia", e.target.value as ExperienciaBarismo)}
        >
          <option value="">Selecciona una opción</option>
          {EXPERIENCIAS_BARISMO.map((exp) => (
            <option key={exp} value={exp}>
              {exp}
            </option>
          ))}
        </select>
      </Campo>

      <Campo label="Método estimado para la Fase 1">
        <input
          className="input"
          placeholder="Ej. V60, Chemex, Aeropress..."
          value={form.metodo_fase1}
          onChange={(e) => actualizarCampo("metodo_fase1", e.target.value)}
        />
      </Campo>

      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          className="mt-1"
          checked={form.acepta_reglamento}
          onChange={(e) => actualizarCampo("acepta_reglamento", e.target.checked)}
        />
        <span>
          Autorizo el tratamiento de mis datos personales y acepto el Reglamento Oficial de la
          competencia.
        </span>
      </label>

      <button
        type="button"
        onClick={enviar}
        disabled={enviando}
        className="w-full py-3 rounded-lg bg-navy hover:bg-[#00A3E0] transition-colors text-white font-medium disabled:opacity-60"
      >
        {enviando ? "Enviando..." : "Asegura tu estación"}
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