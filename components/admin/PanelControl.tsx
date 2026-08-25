"use client";

import { useState } from "react";
import { buscarInscripcionAction, type InscripcionControl } from "@/app/actions/control";
import EscanerQR from "@/components/admin/EscanerQR";
import PantallaControlEntrega from "@/components/admin/PantallaControlEntrega";

export default function PanelControl() {
  const [modo, setModo] = useState<"cedula" | "qr">("cedula");
  const [documento, setDocumento] = useState("");
  const [inscripcion, setInscripcion] = useState<InscripcionControl | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);

  async function buscar(valor: string) {
    setBuscando(true);
    setError(null);
    setInscripcion(null);

    const resp = await buscarInscripcionAction(valor);

    setBuscando(false);

    if (!resp.ok) {
      setError(resp.error);
      return;
    }

    setInscripcion(resp.inscripcion);
  }

  return (
    <div className="max-w-md mx-auto space-y-5">
      <div className="flex gap-2">
        <button
          onClick={() => setModo("cedula")}
          className={`flex-1 py-2 rounded-lg border text-sm font-medium ${
            modo === "cedula" ? "bg-gray-900 text-white border-gray-900" : "border-gray-300"
          }`}
        >
          Buscar por cédula
        </button>
        <button
          onClick={() => setModo("qr")}
          className={`flex-1 py-2 rounded-lg border text-sm font-medium ${
            modo === "qr" ? "bg-gray-900 text-white border-gray-900" : "border-gray-300"
          }`}
        >
          Escanear QR
        </button>
      </div>

      {modo === "cedula" && (
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Número de documento"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscar(documento)}
          />
          <button
            onClick={() => buscar(documento)}
            disabled={buscando}
            className="px-5 py-2 rounded-lg bg-gray-900 text-white font-medium disabled:opacity-60"
          >
            Buscar
          </button>
        </div>
      )}

      {modo === "qr" && !inscripcion && (
        <EscanerQR key={documento} onDetectado={(texto) => buscar(texto)} />
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm p-3">
          {error}
        </div>
      )}

      {inscripcion && <PantallaControlEntrega inscripcionInicial={inscripcion} />}
    </div>
  );
}