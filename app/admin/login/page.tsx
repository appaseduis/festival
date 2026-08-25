"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { iniciarSesionAction } from "@/app/actions/auth";

export default function PaginaLoginAdmin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError(null);

    const resp = await iniciarSesionAction(email, password);

    setCargando(false);

    if (!resp.ok) {
      setError(resp.error);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-navy px-4 relative overflow-hidden">
      {/* Acentos decorativos, en el lenguaje visual del banner del festival */}
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #7AB800, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #00A3E0, transparent 70%)" }}
      />

      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-2xl shadow-xl border-t-4 border-t-uis-green p-8 w-full max-w-sm space-y-5"
      >
        <div className="text-center mb-2">
          <img
            src="/logo_black.png"
            alt="ASEDUIS Bucaramanga"
            className="h-60 w-auto mx-auto -mt-1 -mb-3 object-contain"
          />
          <h1 className="font-display text-xl font-bold text-navy">Panel Administrativo</h1>
          <p className="text-sm text-gray-500 mt-1">Festival del Egresado UIS V2</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm p-3">
            {error}
          </div>
        )}

        <label className="block">
          <span className="block text-sm font-medium text-gray-700 mb-1">Correo</span>
          <input
            type="email"
            required
            autoFocus
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-gray-700 mb-1">Contraseña</span>
          <input
            type="password"
            required
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button
          type="submit"
          disabled={cargando}
          className="w-full py-2.5 rounded-lg bg-navy hover:bg-[#00A3E0] transition-colors text-white font-medium disabled:opacity-60"
        >
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>

        <p className="text-center text-xs text-gray-400">
          Acceso exclusivo para el equipo organizador de ASEDUIS
        </p>
      </form>
    </main>
  );
}