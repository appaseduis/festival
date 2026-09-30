"use client";

import { useState, useTransition } from "react";
import { crearEmprendimientoExternoAction } from "@/app/actions/emprendimientoExterno";
import { CATEGORIAS_EXT } from "@/lib/validations/emprendimientosExternos";
import Footer from "@/components/shared/Footer";

const input =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-cyan focus:outline-none";
const label = "block text-sm font-medium text-navy mb-1";

export default function FormularioEmprendimientoExterno({
  linkEventos,
}: {
  linkEventos: string | null;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [categoria, setCategoria] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.currentTarget));
    setError(null);
    start(async () => {
      const r = await crearEmprendimientoExternoAction(raw);
      if (r.ok) setEnviado(true);
      else setError(r.error);
    });
  }

  if (enviado) {
    return (
      <div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-uis-green p-6 md:p-8 text-center space-y-3">
          <p className="text-lg font-semibold text-navy">
            ¡Preinscripción de emprendimiento externo enviada! 🎉
          </p>
          <p className="text-sm text-gray-600">
            Revisaremos tu emprendimiento y te contactaremos por correo o teléfono para
            confirmar tu participación.
          </p>
          {linkEventos && (
            <a
              href={linkEventos}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg bg-cyan px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              📅 Conoce los eventos del festival
            </a>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-4"
    >
      <h2 className="font-display text-lg font-bold text-navy">Datos del responsable</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Nombre completo *</label>
          <input name="nombre_responsable" required className={input} />
        </div>
        <div>
          <label className={label}>Cédula o NIT *</label>
          <input name="documento" required className={input} />
        </div>
        <div>
          <label className={label}>Correo *</label>
          <input name="correo" type="email" required className={input} />
        </div>
        <div>
          <label className={label}>Teléfono / WhatsApp *</label>
          <input name="telefono" type="tel" required className={input} />
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Ciudad *</label>
          <input name="ciudad" required className={input} />
        </div>
      </div>

      <h2 className="font-display text-lg font-bold text-navy pt-2">Emprendimiento externo</h2>
      <div>
        <label className={label}>Nombre del emprendimiento *</label>
        <input name="nombre_emprendimiento" required className={input} />
      </div>
      <div>
        <label className={label}>¿Qué ofreces? *</label>
        <textarea name="descripcion" required rows={3} maxLength={500} className={input} />
      </div>
      <div>
        <label className={label}>Categoría *</label>
        <select
          name="categoria"
          required
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className={input}
        >
          <option value="">Selecciona…</option>
          {CATEGORIAS_EXT.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      {categoria === "Otro" && (
        <div>
          <label className={label}>¿Cuál? *</label>
          <input name="categoria_otro" required className={input} />
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={label}>Facebook</label>
          <input name="facebook" className={input} />
        </div>
        <div>
          <label className={label}>Instagram</label>
          <input name="instagram" className={input} />
        </div>
        <div>
          <label className={label}>Página web</label>
          <input name="pagina_web" className={input} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" name="necesita_electricidad" /> Necesito punto eléctrico
      </label>
      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input type="checkbox" name="acepta" className="mt-1" />
        Entiendo que esta es una preinscripción de emprendimiento externo, sujeta a
        aprobación, y que el valor de participación (tarifa única) será informado por la
        organización.
      </label>

      {error && (
        <p className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-navy py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Enviando…" : "Enviar preinscripción"}
      </button>
    </form>
  );
}