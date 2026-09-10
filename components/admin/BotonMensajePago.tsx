"use client";

import { useState } from "react";
import { obtenerInfoBancolombiaAction } from "@/app/actions/pago";

function formatoCOP(valor: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}

function construirMensaje(nombre: string, total: number, cantidadAcompanantes: number) {
  return `Hola, buenos días ${nombre} 👋

Te escribimos para completar tu inscripción al Festival del Egresado UIS.

Para confirmar tu cupo, es necesario realizar el pago correspondiente:

📌 Valor a pagar: ${formatoCOP(total)}
📌 Cantidad de acompañantes: ${cantidadAcompanantes}

Puedes pagar por cualquiera de estos medios:
🔹 Bold: @bold804001549
🔹 Bancolombia: 0090310223

📷 Te comparto el código QR para facilitar el pago.

Quedo atento al comprobante de pago o cualquier duda que tengas. ¡Gracias! 🎓`;
}

export default function BotonMensajePago({
  nombre,
  celular,
  total,
  cantidadAcompanantes,
}: {
  nombre: string;
  celular: string;
  total: number;
  cantidadAcompanantes: number;
}) {
  const [mensajeCopiado, setMensajeCopiado] = useState(false);
  const [qrCopiado, setQrCopiado] = useState(false);
  const [copiandoQr, setCopiandoQr] = useState(false);
  const [errorQr, setErrorQr] = useState<string | null>(null);

  const mensaje = construirMensaje(nombre, total, cantidadAcompanantes);

  async function copiarMensaje() {
    try {
      await navigator.clipboard.writeText(mensaje);
      setMensajeCopiado(true);
      setTimeout(() => setMensajeCopiado(false), 2000);
    } catch {
      // Si el navegador bloquea el portapapeles, no hacemos nada más
    }
  }

  async function copiarQR() {
    setErrorQr(null);
    setCopiandoQr(true);

    const info = await obtenerInfoBancolombiaAction();

    if (!info.qr_url) {
      setErrorQr("No hay QR configurado en Configuración.");
      setCopiandoQr(false);
      return;
    }

    try {
      const respuesta = await fetch(info.qr_url);
      const blob = await respuesta.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      setQrCopiado(true);
      setTimeout(() => setQrCopiado(false), 2000);
    } catch {
      setErrorQr("No se pudo copiar la imagen. Copia el QR manualmente desde Configuración.");
    } finally {
      setCopiandoQr(false);
    }
  }

  function abrirWhatsApp() {
    const numero = celular.replace(/\D/g, "");
    const numeroConIndicativo = numero.startsWith("57") ? numero : `57${numero}`;
    window.open(
      `https://wa.me/${numeroConIndicativo}?text=${encodeURIComponent(mensaje)}`,
      "_blank"
    );
  }

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <button
        onClick={copiarMensaje}
        className="px-3 py-1 rounded-lg border border-gray-300 text-xs"
      >
        {mensajeCopiado ? "¡Copiado!" : "Copiar mensaje"}
      </button>
      <button
        onClick={copiarQR}
        disabled={copiandoQr}
        className="px-3 py-1 rounded-lg border border-gray-300 text-xs disabled:opacity-50"
      >
        {copiandoQr ? "Copiando..." : qrCopiado ? "¡QR copiado!" : "Copiar QR"}
      </button>
      <button
        onClick={abrirWhatsApp}
        className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs"
      >
        Abrir WhatsApp
      </button>
      {errorQr && <span className="text-xs text-red-600 w-full">{errorQr}</span>}
    </div>
  );
}