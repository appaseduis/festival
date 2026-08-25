"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

export default function EscanerQR({ onDetectado }: { onDetectado: (texto: string) => void }) {
  const contenedorId = "lector-qr";
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [estado, setEstado] = useState<"pidiendo_permiso" | "activa" | "error">("pidiendo_permiso");
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function detenerSiEstaActivo(scanner: Html5Qrcode) {
      try {
        if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
          await scanner.stop();
        }
      } catch {
        // Ignoramos: puede fallar si el estado cambió entre la
        // verificación y el intento de detener.
      }
      try {
        scanner.clear();
      } catch {
        // Ignoramos: limpieza del DOM del lector, no siempre es necesaria
      }
    }

    async function iniciar() {
      const scanner = new Html5Qrcode(contenedorId);
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          (textoDetectado) => {
            if (cancelado) return;
            cancelado = true;
            detenerSiEstaActivo(scanner);
            onDetectado(textoDetectado);
          },
          () => {
            // Se ignoran errores de frames sin QR detectado (ocurre constantemente)
          }
        );

        if (cancelado) {
          await detenerSiEstaActivo(scanner);
          return;
        }

        setEstado("activa");
      } catch (err: unknown) {
        if (cancelado) return;

        const nombre = err instanceof Error ? err.name : "";
        if (nombre === "NotAllowedError") {
          setMensajeError(
            "No se concedió permiso de cámara. Actívalo en la configuración del navegador (icono de candado en la barra de direcciones) y recarga la página."
          );
        } else if (nombre === "NotFoundError") {
          setMensajeError("No se encontró ninguna cámara disponible en este dispositivo.");
        } else {
          setMensajeError(
            "No se pudo iniciar la cámara. En redes locales (http://), algunos navegadores bloquean el acceso a la cámara — prueba con otro navegador o usa la versión desplegada (https://)."
          );
        }
        setEstado("error");
        console.error("No se pudo iniciar la cámara:", err);
      }
    }

    iniciar();

    return () => {
      cancelado = true;
      const scanner = scannerRef.current;
      if (scanner) {
        detenerSiEstaActivo(scanner);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {estado === "pidiendo_permiso" && (
        <p className="text-sm text-gray-500 text-center py-4">
          Solicitando acceso a la cámara...
        </p>
      )}

      {estado === "error" && mensajeError && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm p-3 text-center">
          {mensajeError}
        </div>
      )}

      {/* IMPORTANTE: nunca display:none. html5-qrcode calcula el tamaño
          del video según el ancho del contenedor en el momento de start();
          si estuviera oculto, el video queda con dimensiones inválidas
          y nunca se ve, aunque la cámara sí esté encendida. */}
      <div
        id={contenedorId}
        className="w-full max-w-sm mx-auto rounded-xl overflow-hidden"
        style={{ minHeight: estado === "activa" ? "auto" : 0 }}
      />

      {estado === "activa" && (
        <p className="text-xs text-gray-500 text-center mt-2">
          Apunta la cámara al código QR de la inscripción.
        </p>
      )}
    </div>
  );
}