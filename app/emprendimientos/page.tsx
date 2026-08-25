import FormularioEmprendimiento from "@/components/emprendimientos/FormularioEmprendimiento";

export default function PaginaEmprendimientos() {
  return (
    <main className="min-h-screen bg-[#F4F6F9]">
      {/* Banner institucional */}
      <div className="w-full bg-white">
        <img
          src="/banner-festival.png"
          alt="2do Festival del Egresado UIS — Nos vemos en octubre"
          className="w-full h-auto"
        />
      </div>

      {/* Onda de transición, en el lenguaje visual del banner */}
      <svg
        viewBox="0 0 1440 40"
        className="w-full h-6 md:h-10 -mt-1"
        preserveAspectRatio="none"
      >
        <path d="M0,20 C360,45 1080,-5 1440,20 L1440,0 L0,0 Z" fill="#F4F6F9" />
        <path
          d="M0,25 C360,45 1080,5 1440,25"
          fill="none"
          stroke="#52B4D8"
          strokeWidth="2"
          opacity="0.5"
        />
      </svg>

      <div className="max-w-2xl mx-auto px-3 sm:px-4 pb-12 -mt-2">
        <header className="text-center mb-6">
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-navy">
            Festival de Emprendedores UIS
          </h1>
          <p className="text-[#002855]/70 mt-2 text-sm">
            Salón Principal, Casona La Perla — durante el Primer Festival del Egresado UIS
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-uis-green p-5 sm:p-6 md:p-8 mb-6 space-y-4 text-sm text-gray-700">
          <div>
            <p className="font-semibold text-navy mb-1">🗓️ Fechas y horarios</p>
            <ul className="space-y-0.5">
              <li>Viernes 09 de octubre: 2:00 p.m. a 7:00 p.m.</li>
              <li>Sábado 10 de octubre: 9:00 a.m. a 7:00 p.m.</li>
              <li>Domingo 11 de octubre: 9:00 a.m. a 1:00 p.m.</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-navy mb-1">💰 Valores de participación</p>
            <p>
              Incluye espacio de exhibición, logística general del evento y equipamiento
              básico del stand (1 mesa y 2 sillas):
            </p>
            <ul className="mt-1 space-y-0.5">
              <li>Egresado NO asociado: <strong>$220.000</strong></li>
              <li>Egresado Asociado ASEDUIS: <strong>$190.000</strong></li>
            </ul>
            <p className="mt-1 text-xs text-gray-500">
              ⚡ La conexión eléctrica tiene un costo adicional de $30.000, que se confirma
              al finalizar este formulario.
            </p>
          </div>

          <p className="text-xs text-gray-500">
            👨‍👩‍👧‍👦 La programación cultural y recreativa es de ingreso libre para tu familia
            e invitados
          </p>

          <p className="text-xs bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3">
            📌 Los emprendimientos deben ser de <strong>origen propio</strong> del egresado
            participante. No se aceptan reventas ni representación de marcas de terceros.
          </p>

          <p className="text-xs bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3">
            Este formulario es una <strong>preinscripción</strong>. No se realiza ningún
            pago en este momento — nuestro equipo revisará tu emprendimiento y te
            contactará para confirmar tu participación y coordinar el pago.
          </p>
        </div>

        <FormularioEmprendimiento />
      </div>
    </main>
  );
}