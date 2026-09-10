"use client";

import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

// Posición y tamaño del recuadro blanco dentro de plantilla-qr.png,
// expresados como PORCENTAJE del ancho/alto total de la imagen (no en
// píxeles fijos), para que funcione sin importar la resolución exacta
// del archivo. Si el QR queda desalineado, ajusta estos 3 valores.
const QR_X_PERCENT = 0.36;
const QR_Y_PERCENT = 0.395;
const QR_SIZE_PERCENT = 0.28;

export default function ModalQR({
  nombre,
  qrToken,
  onCerrar,
}: {
  nombre: string;
  qrToken: string;
  onCerrar: () => void;
}) {
  const contenedorRef = useRef<HTMLDivElement>(null);

  function descargarQR() {
    const svg = contenedorRef.current?.querySelector("svg");
    if (!svg) return;

    // 1. Convertimos el SVG del QR a una imagen que podamos dibujar en canvas
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const urlQR = URL.createObjectURL(svgBlob);

    const imgQR = new Image();
    imgQR.onload = () => {
      // 2. Cargamos la plantilla del festival
      const imgPlantilla = new Image();
      imgPlantilla.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = imgPlantilla.naturalWidth;
        canvas.height = imgPlantilla.naturalHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Dibuja la plantilla completa como fondo
        ctx.drawImage(imgPlantilla, 0, 0, canvas.width, canvas.height);

        // Dibuja el QR encima, en el recuadro blanco
        const qrSize = canvas.width * QR_SIZE_PERCENT;
        const qrX = canvas.width * QR_X_PERCENT;
        const qrY = canvas.height * QR_Y_PERCENT;
        ctx.drawImage(imgQR, qrX, qrY, qrSize, qrSize);

        URL.revokeObjectURL(urlQR);

        const enlace = document.createElement("a");
        const nombreArchivo = nombre
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        enlace.download = `qr-${nombreArchivo || "inscripcion"}.png`;
        enlace.href = canvas.toDataURL("image/png");
        enlace.click();
      };
      imgPlantilla.src = "/plantilla-qr.png";
    };
    imgQR.src = urlQR;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onCerrar}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <p className="font-semibold text-gray-900">{nombre}</p>
          <p className="text-xs text-gray-500 mt-1">Código QR de esta inscripción</p>
        </div>

        <div ref={contenedorRef} className="flex justify-center">
          <QRCodeSVG value={qrToken} size={220} />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={descargarQR}
            className="flex-1 px-5 py-2 rounded-lg border border-gray-300 text-sm font-medium"
          >
            Descargar QR
          </button>
          <button
            type="button"
            onClick={onCerrar}
            className="flex-1 px-5 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}