"use client";

import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

const QR_X_PERCENT = 0.315;
const QR_Y_PERCENT = 0.375;
const QR_SIZE_PERCENT = 0.37;

// Posición del texto del nombre, debajo del recuadro del QR y por
// debajo de "CONTROL KIT / ALMUERZO", como porcentaje de la plantilla.
const NOMBRE_Y_PERCENT = 0.97;
const NOMBRE_FONT_SIZE_MAX_PERCENT = 0.028;
const NOMBRE_ANCHO_MAX_PERCENT = 0.82; // no puede ocupar más del 82% del ancho

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

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const urlQR = URL.createObjectURL(svgBlob);

    const imgQR = new Image();
    imgQR.onload = () => {
      const imgPlantilla = new Image();
      imgPlantilla.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = imgPlantilla.naturalWidth;
        canvas.height = imgPlantilla.naturalHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // 1. Plantilla de fondo
        ctx.drawImage(imgPlantilla, 0, 0, canvas.width, canvas.height);

        // 2. QR encima
        const qrSize = canvas.width * QR_SIZE_PERCENT;
        const qrX = canvas.width * QR_X_PERCENT;
        const qrY = canvas.height * QR_Y_PERCENT;
        ctx.drawImage(imgQR, qrX, qrY, qrSize, qrSize);

        // 3. Nombre del inscrito: tamaño de letra se reduce
        // automáticamente si el nombre es muy largo para no
        // desbordarse ni chocar con el resto del diseño.
        const nombreTexto = nombre.toUpperCase();
        const anchoMaximo = canvas.width * NOMBRE_ANCHO_MAX_PERCENT;
        let fontSize = Math.round(canvas.width * NOMBRE_FONT_SIZE_MAX_PERCENT);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#000000";

        do {
          ctx.font = `700 ${fontSize}px Arial, sans-serif`;
          const anchoTexto = ctx.measureText(nombreTexto).width;
          if (anchoTexto <= anchoMaximo) break;
          fontSize -= 1;
        } while (fontSize > 10);

        ctx.fillText(nombreTexto, canvas.width / 2, canvas.height * NOMBRE_Y_PERCENT);

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