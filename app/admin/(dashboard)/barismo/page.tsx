import { listarBarismoAction } from "@/app/actions/barismo";
import GestionBarismo from "@/components/admin/GestionBarismo";

export default async function PaginaBarismoAdmin() {
  const inscripciones = await listarBarismoAction("todas");

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy mb-6">Competencia de Barismo</h1>
      <GestionBarismo inscripcionesIniciales={inscripciones} />
    </div>
  );
}