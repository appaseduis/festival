import { obtenerCuposBarismoAction } from "@/app/actions/barismo";
import FormularioBarismo from "@/components/barismo/FormularioBarismo";

export const dynamic = "force-dynamic";

export default async function PaginaBarismo() {
  const cupos = await obtenerCuposBarismoAction();
  const cuposDisponibles = Math.max(0, cupos.total - cupos.ocupados);

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
            ⚔️ Campeón de Filtrados de Alumni Café
          </h1>
          <p className="text-[#002855]/70 mt-2 text-sm">
            ¿Tienes el pulso, la receta y la versatilidad para convertirte en el primer campeón?
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-uis-green p-5 sm:p-6 md:p-8 mb-6 space-y-3 text-sm text-gray-700">
          <div>
            <p className="font-semibold text-navy mb-1">🗓️ Fases de la competencia</p>
            <ul className="space-y-0.5">
              <li><strong>Fase 1 (Clasificación):</strong> Ronda libre. Trae tu propio método.</li>
              <li><strong>Fase 2 (Semifinal):</strong> Sorteo de métodos en vivo (3 métodos).</li>
              <li><strong>Fase 3 (Gran Final):</strong> Cara a cara con un único método sorteado.</li>
            </ul>
          </div>
          <p>☕ El café oficial en grano será suministrado en su totalidad por Alumni Café.</p>
          <p className="text-xs bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3">
            ⚠️ Cupos limitados a 18 participantes.{" "}
          </p>
          <p>
            💰 Valor de la inscripción: <strong>$50.000 COP</strong> (incluye café oficial de
            competencia en todas tus rondas y certificado oficial).
          </p>
          <p>🏆 Premios de patrocinadores.</p>
        </div>

        <FormularioBarismo cuposDisponibles={cuposDisponibles} />
      </div>
    </main>
  );
}