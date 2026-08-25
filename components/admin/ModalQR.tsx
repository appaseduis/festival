"use client";

import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

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

    // Convertimos el SVG a una imagen PNG usando un canvas intermedio,
    // porque los navegadores no permiten descargar un <svg> directamente
    // como archivo de imagen sin pasar por esto.
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const padding = 24;
      const canvas = document.createElement("canvas");
      canvas.width = img.width + padding * 2;
      canvas.height = img.height + padding * 2;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Fondo blanco (los QR sin fondo pueden no leerse bien en pantallas oscuras)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, padding, padding);

      URL.revokeObjectURL(url);

      const enlace = document.createElement("a");
      const nombreArchivo = nombre
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // quita tildes
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      enlace.download = `qr-${nombreArchivo || "inscripcion"}.png`;
      enlace.href = canvas.toDataURL("image/png");
      enlace.click();
    };
    img.src = url;
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
          <p className="text-xs text-gray-500 mt-1">
            Código QR de esta inscripción
          </p>
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