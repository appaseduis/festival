import {listarEmprendimientosExternosAction,obtenerConfigExternosAction,} from "@/app/actions/emprendimientoExterno";
import { formatoPrecioExterno } from "@/lib/validations/emprendimientosExternos";
import GestionEmprendimientosExternos from "@/components/admin/GestionEmprendimientosExternos";

export const dynamic = "force-dynamic";

export default async function AdminEmprendimientosExternosPage() {
  const [iniciales, cfg] = await Promise.all([
    listarEmprendimientosExternosAction(),
    obtenerConfigExternosAction(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-navy">Emprendimientos</h1>
          <span className="rounded-full bg-cyan/10 px-3 py-1 text-xs font-bold uppercase text-cyan">
            Externos
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Tarifa única: {formatoPrecioExterno(cfg.precio)} ·{" "}
          {cfg.abierto ? "Formulario abierto" : "Formulario cerrado"}
        </p>
      </div>

      <GestionEmprendimientosExternos
        emprendimientosIniciales={iniciales}
        precioUnico={cfg.precio}
      />
    </div>
  );
}