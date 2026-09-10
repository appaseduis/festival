"use client";

import { useState } from "react";

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
  total,
  cantidadAcompanantes,
}: {
  nombre: string;
  total: number;
  cantidadAcompanantes: number;
}) {
  const [mensajeCopiado, setMensajeCopiado] = useState(false);

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

  return (
    <button onClick={copiarMensaje} className="px-3 py-1 rounded-lg border border-gray-300 text-xs">
      {mensajeCopiado ? "¡Copiado!" : "Copiar mensaje"}
    </button>
  );
}