"use client";

import { useState, useMemo } from "react";
import { crearInscripcionAction } from "@/app/actions/inscripcion";
import { obtenerInfoBancolombiaAction, seleccionarMetodoPagoAction } from "@/app/actions/pago";
import type {
  ConfiguracionPublica,
  Talla,
  Actividad,
  Genero,
  TipoEgresado,
  AcompananteInput,
} from "@/types/database";
import type { ReactNode } from "react";
import BotonPagoBold from "@/components/inscripcion/BotonPagoBold";
import Footer from "@/components/shared/Footer";

type Props = {
  config: ConfiguracionPublica;
  tallas: Talla[];
  actividades: Actividad[];
};

type FormState = {
  nombres_completos: string;
  documento: string;
  correo: string;
  celular: string;
  genero: Genero | "";
  programa_academico: string;
  talla_id: string;
  actividades_ids: string[];
  comentarios: string;
  tipo_egresado: TipoEgresado | "";
  tiene_acompanantes: boolean | null;
  cantidad_acompanantes: number;
  acompanantes: AcompananteInput[];
};

const ESTADO_INICIAL: FormState = {
  nombres_completos: "",
  documento: "",
  correo: "",
  celular: "",
  genero: "",
  programa_academico: "",
  talla_id: "",
  actividades_ids: [],
  comentarios: "",
  tipo_egresado: "",
  tiene_acompanantes: null,
  cantidad_acompanantes: 0,
  acompanantes: [],
};

const TOTAL_PASOS = 5;
const NOMBRES_PASOS = [
  "Datos personales",
  "Participación",
  "Acompañantes",
  "Resumen",
  "Pago",
];

function formatoCOP(valor: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}

export default function WizardInscripcion({ config, tallas, actividades }: Props) {
  const [paso, setPaso] = useState(1);
  const [form, setForm] = useState<FormState>(ESTADO_INICIAL);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ id: string; total: number } | null>(null);
  const [metodoElegido, setMetodoElegido] = useState<"bold" | "bancolombia" | null>(null);
  const [infoBancolombia, setInfoBancolombia] = useState<{ qr_url: string | null; datos: string | null } | null>(null);
  const [mostrarQRGrande, setMostrarQRGrande] = useState(false);
  const [llaveCopiada, setLlaveCopiada] = useState(false);

  const LLAVE_BANCOLOMBIA = "0090310223";

  async function copiarLlave() {
    try {
      await navigator.clipboard.writeText(LLAVE_BANCOLOMBIA);
      setLlaveCopiada(true);
      setTimeout(() => setLlaveCopiada(false), 2000);
    } catch {
      // Si el navegador bloquea el portapapeles (poco común), no hacemos nada más
    }
  }

  const precioEgresado = useMemo(() => {
    if (form.tipo_egresado === "socio") return config.precio_egresado_socio;
    if (form.tipo_egresado === "no_socio") return config.precio_egresado_no_socio;
    return 0;
  }, [config, form.tipo_egresado]);

  const total = useMemo(() => {
    const subtotalAcompanantes = config.precio_acompanante * form.acompanantes.length;
    return precioEgresado + subtotalAcompanantes;
  }, [config, form.acompanantes.length, precioEgresado]);

  function actualizarCampo<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

    function alternarActividad(id: string) {
    setForm((prev) => {
      const yaSeleccionada = prev.actividades_ids.includes(id);
      return {
        ...prev,
        actividades_ids: yaSeleccionada
          ? prev.actividades_ids.filter((a) => a !== id)
          : [...prev.actividades_ids, id],
      };
    });
  }

  function ajustarCantidadAcompanantes(cantidad: number) {
    const nueva = Math.max(0, Math.min(20, cantidad));
    setForm((prev) => {
      const acompanantesActuales = [...prev.acompanantes];
      while (acompanantesActuales.length < nueva) {
        acompanantesActuales.push({ nombre: "", documento: "", edad: 0 });
      }
      acompanantesActuales.length = nueva;
      return { ...prev, cantidad_acompanantes: nueva, acompanantes: acompanantesActuales };
    });
  }

  function actualizarAcompanante(index: number, campo: keyof AcompananteInput, valor: string) {
    setForm((prev) => {
      const copia = [...prev.acompanantes];
      copia[index] = {
        ...copia[index],
        [campo]: campo === "edad" ? Number(valor) : valor,
      };
      return { ...prev, acompanantes: copia };
    });
  }

  function validarPaso(): string | null {
    if (paso === 1) {
      if (!form.nombres_completos.trim()) return "Ingresa tu nombre completo";
      if (!/^[0-9]{5,}$/.test(form.documento)) return "Documento inválido";
      if (!/^\S+@\S+\.\S+$/.test(form.correo)) return "Correo inválido";
      if (!/^[0-9]{7,15}$/.test(form.celular)) return "Celular inválido";
      if (!form.genero) return "Selecciona tu género";
      if (!form.programa_academico.trim()) return "Ingresa tu programa académico";
      if (!form.talla_id) return "Selecciona tu talla";
      if (!form.tipo_egresado) return "Indica si eres socio o no socio";
    }
    if (paso === 3 && form.tiene_acompanantes === null) {
      return "Indica si vienes con acompañantes";
    }
    if (paso === 3 && form.tiene_acompanantes) {
      for (const [i, a] of form.acompanantes.entries()) {
        if (!a.nombre.trim()) return `Falta el nombre del acompañante ${i + 1}`;
        if (!/^[0-9]{5,}$/.test(a.documento))
          return `Documento inválido del acompañante ${i + 1}`;
        if (a.edad <= 0 || a.edad > 120) return `Edad inválida del acompañante ${i + 1}`;
      }
    }
    return null;
  }

  function siguiente() {
    const err = validarPaso();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setPaso((p) => Math.min(TOTAL_PASOS, p + 1));
  }

  function anterior() {
    setError(null);
    setPaso((p) => Math.max(1, p - 1));
  }

  async function enviarInscripcion() {
    setEnviando(true);
    setError(null);

    const resp = await crearInscripcionAction({
      nombres_completos: form.nombres_completos.trim(),
      documento: form.documento.trim(),
      correo: form.correo.trim(),
      celular: form.celular.trim(),
      genero: form.genero as Genero,
      programa_academico: form.programa_academico.trim(),
      talla_id: form.talla_id,
      actividades_ids: form.actividades_ids,
      comentarios: form.comentarios.trim() || null,
      tipo_egresado: form.tipo_egresado as TipoEgresado,
      acompanantes: form.tiene_acompanantes ? form.acompanantes : [],
    });

    setEnviando(false);

    if (!resp.ok) {
      setError(resp.error);
      return;
    }

    setResultado({ id: resp.inscripcionId, total: resp.total });
    setPaso(5);
  }

  async function elegirMetodoPago(metodo: "bold" | "bancolombia") {
    if (!resultado) return;

    setMetodoElegido(metodo);
    await seleccionarMetodoPagoAction(resultado.id, metodo);

    if (metodo === "bancolombia") {
      const info = await obtenerInfoBancolombiaAction();
      setInfoBancolombia(info);
    }
  }

  function mensajeWhatsApp(): string {
    const lineas = [
      `*Inscripción ${config.nombre_evento}*`,
      `Nombre: ${form.nombres_completos}`,
      `Documento: ${form.documento}`,
      `Correo: ${form.correo}`,
      `Celular: ${form.celular}`,
      `Género: ${form.genero === "M" ? "Masculino" : "Femenino"}`,
      `Programa: ${form.programa_academico}`,
      `Tipo: ${form.tipo_egresado === "socio" ? "Socio" : "No socio"}`,
      `Talla: ${tallas.find((t) => t.id === form.talla_id)?.nombre ?? ""}`,
      `Acompañantes: ${form.acompanantes.length}`,
      
    ];

    form.acompanantes.forEach((a, i) => {
      lineas.push(`  ${i + 1}. ${a.nombre} - CC ${a.documento} - ${a.edad} años`);
    });

    lineas.push(`Total a pagar: ${formatoCOP(resultado?.total ?? total)}`);

    return encodeURIComponent(lineas.join("\n"));
  }

  const linkWhatsApp = `https://wa.me/${config.whatsapp_numero}?text=${mensajeWhatsApp()}`;

  return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-uis-green p-5 sm:p-6 md:p-8">
            <div className="mb-8">
        {/* Versión móvil: solo el paso actual */}
        <div className="flex sm:hidden items-center justify-between text-xs text-gray-500 mb-2">
          <span className="font-semibold text-navy">
            Paso {paso} de {TOTAL_PASOS}: {NOMBRES_PASOS[paso - 1]}
          </span>
        </div>

        {/* Versión desktop/tablet: todos los pasos */}
        <div className="hidden sm:flex justify-between text-xs text-gray-500 mb-2 gap-1">
          {NOMBRES_PASOS.map((nombre, i) => (
            <span
              key={nombre}
              className={`${i + 1 === paso ? "font-semibold text-navy" : ""} whitespace-nowrap`}
            >
              {nombre}
            </span>
          ))}
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full transition-all"
            style={{
              width: `${(paso / TOTAL_PASOS) * 100}%`,
              background: "linear-gradient(90deg, #7AB800, #00A3E0)",
            }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm p-3">
          {error}
        </div>
      )}

      {/* PASO 1: Datos personales */}
      {paso === 1 && (
        <div className="space-y-4">
          <Campo label="Nombres y apellidos completos">
            <input
              className="input"
              value={form.nombres_completos}
              onChange={(e) => actualizarCampo("nombres_completos", e.target.value)}
            />
          </Campo>
          <Campo label="Número de documento">
            <input
              className="input"
              inputMode="numeric"
              value={form.documento}
              onChange={(e) => actualizarCampo("documento", e.target.value)}
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
          <Campo label="Número de celular">
            <input
              className="input"
              inputMode="numeric"
              value={form.celular}
              onChange={(e) => actualizarCampo("celular", e.target.value)}
            />
          </Campo>
          <Campo label="Género">
            <div className="flex gap-3">
              {(["M", "F"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => actualizarCampo("genero", g)}
                  className={`flex-1 py-2 rounded-lg border ${
                    form.genero === g ? "bg-navy text-white border-navy" : "border-gray-300"
                  }`}
                >
                  {g === "M" ? "Masculino" : "Femenino"}
                </button>
              ))}
            </div>
          </Campo>
          <Campo label="Programa académico">
            <input
              className="input"
              value={form.programa_academico}
              onChange={(e) => actualizarCampo("programa_academico", e.target.value)}
            />
          </Campo>
          <Campo label="Talla de camiseta">
            <select
              className="input"
              value={form.talla_id}
              onChange={(e) => actualizarCampo("talla_id", e.target.value)}
            >
              <option value="">Selecciona tu talla</option>
              {tallas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="¿Eres socio o no socio de ASEDUIS?">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => actualizarCampo("tipo_egresado", "socio")}
                className={`flex-1 py-2 rounded-lg border ${
                  form.tipo_egresado === "socio" ? "bg-navy text-white border-navy" : "border-gray-300"
                }`}
              >
                Socio ({formatoCOP(config.precio_egresado_socio)})
              </button>
              <button
                type="button"
                onClick={() => actualizarCampo("tipo_egresado", "no_socio")}
                className={`flex-1 py-2 rounded-lg border ${
                  form.tipo_egresado === "no_socio" ? "bg-navy text-white border-navy" : "border-gray-300"
                }`}
              >
                No socio ({formatoCOP(config.precio_egresado_no_socio)})
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              La condición de socio se valida manualmente por el equipo organizador.
              Si seleccionas "Socio" sin estar registrado como tal, se te contactará
              por WhatsApp para completar el valor adicional.
            </p>
          </Campo>
        </div>
      )}

      {/* PASO 2: Participación */}
            {/* PASO 2: Participación */}
      {paso === 2 && (
        <div className="space-y-4">
          <Campo label="¿En qué deportes y/o actividades te gustaría participar? (puedes elegir varias)">
            <div className="flex flex-wrap gap-2">
              {actividades.map((a) => {
                const seleccionada = form.actividades_ids.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => alternarActividad(a.id)}
                    className={`px-3 py-1.5 rounded-full border text-sm ${
                      seleccionada
                        ? "bg-navy text-white border-navy"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    {a.nombre}
                  </button>
                );
              })}
            </div>
            {actividades.length === 0 && (
              <p className="text-sm text-gray-400">
                Aún no hay actividades configuradas.
              </p>
            )}
          </Campo>
          <Campo label="Comentarios adicionales">
            <textarea
              className="input"
              rows={4}
              value={form.comentarios}
              onChange={(e) => actualizarCampo("comentarios", e.target.value)}
            />
          </Campo>
        </div>
      )}

      {/* PASO 3: Acompañantes */}
      {paso === 3 && (
        <div className="space-y-5">
          <Campo label="¿Vienes con acompañantes?">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  actualizarCampo("tiene_acompanantes", false);
                  ajustarCantidadAcompanantes(0);
                }}
                className={`flex-1 py-2 rounded-lg border ${
                  form.tiene_acompanantes === false ? "bg-navy text-white border-navy" : "border-gray-300"
                }`}
              >
                No
              </button>
              <button
                type="button"
                onClick={() => actualizarCampo("tiene_acompanantes", true)}
                className={`flex-1 py-2 rounded-lg border ${
                  form.tiene_acompanantes === true ? "bg-navy text-white border-navy" : "border-gray-300"
                }`}
              >
                Sí
              </button>
            </div>
          </Campo>

          {form.tiene_acompanantes && (
            <>
              <Campo label="Número de acompañantes">
                <input
                  className="input"
                  type="number"
                  min={1}
                  max={20}
                  value={form.cantidad_acompanantes || ""}
                  onChange={(e) => ajustarCantidadAcompanantes(Number(e.target.value))}
                />
              </Campo>

              {form.acompanantes.map((a, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <p className="font-medium text-sm text-gray-700">Acompañante {i + 1}</p>
                  <Campo label="Nombre completo">
                    <input
                      className="input"
                      value={a.nombre}
                      onChange={(e) => actualizarAcompanante(i, "nombre", e.target.value)}
                    />
                  </Campo>
                  <Campo label="Número de documento">
                    <input
                      className="input"
                      inputMode="numeric"
                      value={a.documento}
                      onChange={(e) => actualizarAcompanante(i, "documento", e.target.value)}
                    />
                  </Campo>
                  <Campo label="Edad">
                    <input
                      className="input"
                      type="number"
                      min={0}
                      max={120}
                      value={a.edad || ""}
                      onChange={(e) => actualizarAcompanante(i, "edad", e.target.value)}
                    />
                  </Campo>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* PASO 4: Resumen */}
      {paso === 4 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-navy">Resumen de inscripción</h3>
          <div className="rounded-xl bg-[#F4F6F9] p-4 space-y-2 text-sm border border-gray-100">
            <div className="flex justify-between">
              <span>Egresado ({form.tipo_egresado === "socio" ? "Socio" : "No socio"})</span>
              <span>{formatoCOP(precioEgresado)}</span>
            </div>
            <div className="flex justify-between">
              <span>Acompañantes ({form.acompanantes.length})</span>
              <span>{formatoCOP(config.precio_acompanante * form.acompanantes.length)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-base text-navy">
              <span>TOTAL</span>
              <span>{formatoCOP(total)}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Al confirmar, tu inscripción quedará registrada con estado "pendiente de pago".
            El valor final se recalcula y valida en nuestro servidor.
          </p>
        </div>
      )}

      {/* PASO 5: Confirmación + WhatsApp + Pago */}
      {paso === 5 && resultado && (
        <div className="space-y-5">
          <div className="rounded-xl bg-[#7AB800]/10 border border-[#7AB800]/30 p-4 text-[#2BB673] text-sm font-medium">
            ¡Inscripción registrada correctamente! Total: {formatoCOP(resultado.total)}
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold mb-1">⚠️ Importante antes de realizar tu pago</p>
            <p>
              Debes enviar la información de tu inscripción al WhatsApp de ASEDUIS.
              Usa el botón de abajo para generar el mensaje automáticamente. Si pagas
              mediante Bancolombia, envía también el comprobante por ese mismo medio.
            </p>
          </div>

          <a
            href={linkWhatsApp}
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
                disabled={!config.bold_activo}
                onClick={() => elegirMetodoPago("bold")}
                className="py-3 rounded-lg border-2 border-navy text-navy font-medium disabled:opacity-40 disabled:border-gray-300 disabled:text-gray-400 hover:bg-navy hover:text-white transition-colors"
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

          {metodoElegido === "bold" && resultado && (
            <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-700 space-y-3">
              <p className="font-medium">Pago con Bold</p>
              <BotonPagoBold inscripcionId={resultado.id} amount={resultado.total} />
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
                Después de transferir, envía el comprobante por WhatsApp al número de
                ASEDUIS usando el botón de arriba.
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
      )}

      {paso < 5 && (
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={anterior}
            disabled={paso === 1}
            className="px-5 py-2 rounded-lg border border-gray-300 disabled:opacity-40"
          >
            Atrás
          </button>

          {paso < 4 ? (
            <button
              type="button"
              onClick={siguiente}
              className="px-5 py-2 rounded-lg bg-navy hover:bg-[#00A3E0] transition-colors text-white"
            >
              Continuar
            </button>
          ) : (
            <button
              type="button"
              onClick={enviarInscripcion}
              disabled={enviando}
              className="px-5 py-2 rounded-lg bg-navy hover:bg-[#00A3E0] transition-colors text-white disabled:opacity-60"
            >
              {enviando ? "Enviando..." : "Confirmar inscripción"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      {children}
    </label>
  );
}