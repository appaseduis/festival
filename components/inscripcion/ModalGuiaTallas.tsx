"use client";

export default function ModalGuiaTallas({ onCerrar }: { onCerrar: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onCerrar}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-2xl w-full text-center space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-semibold text-navy">Guía de tallas</p>

        <img
          src="/guia_tallas.jpeg"
          alt="Guía de tallas"
          className="w-full h-auto rounded-lg"
        />

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