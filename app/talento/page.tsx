"use client";

import { useState } from "react";
import FormularioTalento from "@/components/talento/FormularioTalento";

export default function PaginaTalento() {
  const [enviado, setEnviado] = useState(false);

  return (
    <main className="min-h-screen bg-[#F4F6F9]">
      <div className="w-full bg-white">
        <img
          src="/banner-festival.png"
          alt="2do Festival del Egresado UIS — Nos vemos en octubre"
          className="w-full h-auto"
        />
      </div>

      <svg viewBox="0 0 1440 40" className="w-full h-6 md:h-10 -mt-1" preserveAspectRatio="none">
        <path d="M0,20 C360,45 1080,-5 1440,20 L1440,0 L0,0 Z" fill="#F4F6F9" />
        <path d="M0,25 C360,45 1080,5 1440,25" fill="none" stroke="#52B4D8" strokeWidth="2" opacity="0.5" />
      </svg>

      <div className="max-w-2xl mx-auto px-3 sm:px-4 pb-12 -mt-2">
        <header className="text-center mb-6">
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-navy">
            ¡Tu talento también hace parte del Festival! 🎶🎭🎨
          </h1>
          <p className="text-[#002855]/70 mt-2 text-sm">
            Convocatoria para egresados UIS · 9, 10 y 11 de octubre de 2026
          </p>
        </header>

        {!enviado && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-uis-green p-5 sm:p-6 md:p-8 mb-6 space-y-3 text-sm text-gray-700">
            <p>
              ¿Eres músico, cantante, bailarín, pintor, poeta, actor, artista circense o tienes
              algún talento artístico o cultural?
            </p>
            <p>
              En el 2.º Festival del Egresado UIS queremos abrir espacios para que nuestros
              egresados compartan su talento y hagan parte de la programación.
            </p>
            <p className="font-semibold text-navy">¡Queremos conocerte y conocer tu propuesta!</p>
            <p className="text-xs bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3">
              Diligenciar este formulario es una manifestación de interés — no garantiza la
              asignación de un espacio en la programación. ASEDUIS se pondrá en contacto con las
              propuestas seleccionadas.
            </p>
          </div>
        )}

        <FormularioTalento onEnviadoChange={setEnviado} />
      </div>
    </main>
  );
}