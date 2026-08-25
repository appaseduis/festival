"use client";

import { useEffect, useRef, useState } from "react";
import { generarDatosBoldAction } from "@/app/actions/pago";

export default function BotonPagoBold({
  inscripcionId,
  amount,
}: {
  inscripcionId: string;
  amount: number;
}) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;

    async function cargarBoton() {
      try {
        const datos = await generarDatosBoldAction(inscripcionId, amount);

        if (cancelado || !contenedorRef.current) return;

        contenedorRef.current.innerHTML = "";

        // 1. Insertamos primero el script con los datos del botón
        const scriptBoton = document.createElement("script");
        scriptBoton.setAttribute("data-bold-button", "dark-L");
        scriptBoton.setAttribute("data-order-id", datos.orderId);
        scriptBoton.setAttribute("data-currency", datos.currency);
        scriptBoton.setAttribute("data-amount", String(datos.amount));
        scriptBoton.setAttribute("data-api-key", datos.apiKey);
        scriptBoton.setAttribute("data-integrity-signature", datos.integritySignature);
        scriptBoton.setAttribute("data-description", datos.description);
        const urlRedireccion = `${process.env.NEXT_PUBLIC_APP_URL}/inscripcion`;
        if (urlRedireccion.startsWith("https://")) {
          scriptBoton.setAttribute("data-redirection-url", urlRedireccion);
        }
        contenedorRef.current.appendChild(scriptBoton);

        // 2. Recién AHORA cargamos la librería de Bold, para que su escaneo
        // del DOM (que ocurre una sola vez al cargar) sí encuentre el botón
        // que acabamos de insertar arriba.
        const libreria = document.createElement("script");
        libreria.src = "https://checkout.bold.co/library/boldPaymentButton.js";
        libreria.async = true;
        document.body.appendChild(libreria);

        setCargando(false);
      } catch (e) {
        console.error("Error generando botón de Bold:", e);
        if (!cancelado) {
          setError("No se pudo cargar el botón de pago. Intenta de nuevo.");
          setCargando(false);
        }
      }
    }

    cargarBoton();

    return () => {
      cancelado = true;
    };
  }, [inscripcionId, amount]);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div>
      {cargando && <p className="text-sm text-gray-500">Cargando botón de pago...</p>}
      <div ref={contenedorRef} className="flex justify-center" />
    </div>
  );
}