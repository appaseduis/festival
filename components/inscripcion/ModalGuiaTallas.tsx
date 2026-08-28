"use client";

export default function ModalGuiaTallas({ onCerrar }: { onCerrar: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onCerrar}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-md w-full text-center space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-semibold text-navy">Guía de tallas</p>

        {/* TODO: reemplazar por la imagen real de la guía de tallas.
            Cuando la tengas, cambia este bloque por:
            <img src="/guia-tallas.png" alt="Guía de tallas" className="w-full h-auto rounded-lg" />
        */}
        <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
          Imagen de guía de tallas próximamente
        </div>

        <button
          type="button"
          onClick={onCerrar}
          className="px-5 py-2 rounded-lg bg-navy text-white text-sm font-medium"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}