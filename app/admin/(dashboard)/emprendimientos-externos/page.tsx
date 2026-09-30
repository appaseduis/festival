import {
  listarEmprendimientosExternosAction,
  actualizarEmprendimientoExternoAction,
  obtenerConfigExternosAction,
} from "@/app/actions/emprendimientoExterno";
import { formatoPrecioExterno } from "@/lib/validations/emprendimientosExternos";

export const dynamic = "force-dynamic";

const sel = "rounded border border-gray-300 px-2 py-1 text-xs";

export default async function AdminEmprendimientosExternosPage() {
  const [rows, cfg] = await Promise.all([
    listarEmprendimientosExternosAction(),
    obtenerConfigExternosAction(),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold text-navy">Emprendimientos</h1>
        <span className="rounded-full bg-cyan/10 px-3 py-1 text-xs font-bold uppercase text-cyan">
          Externos
        </span>
        <span className="text-sm text-gray-500">
          {rows.length} registros · Tarifa única: {formatoPrecioExterno(cfg.precio)} ·{" "}
          {cfg.abierto ? "Formulario abierto" : "Formulario cerrado"}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-navy text-left text-xs text-white">
            <tr>
              <th className="p-3">Emprendimiento</th>
              <th className="p-3">Responsable</th>
              <th className="p-3">Categoría</th>
              <th className="p-3">Luz</th>
              <th className="p-3">Gestión</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-gray-100 align-top">
                <td className="p-3">
                  <p className="font-semibold text-navy">{r.nombre_emprendimiento}</p>
                  <p className="text-xs text-gray-500">{r.descripcion}</p>
                  <span className="mt-1 inline-block rounded bg-cyan/10 px-2 py-0.5 text-[10px] font-bold uppercase text-cyan">
                    Externo
                  </span>
                </td>
                <td className="p-3 text-xs">
                  <p className="font-medium">{r.nombre_responsable}</p>
                  <p>{r.documento} · {r.ciudad}</p>
                  <p>{r.correo}</p>
                  <p>{r.telefono}</p>
                </td>
                <td className="p-3 text-xs">
                  {r.categoria === "Otro" ? `Otro: ${r.categoria_otro}` : r.categoria}
                </td>
                <td className="p-3 text-xs">{r.necesita_electricidad ? "Sí" : "No"}</td>
                <td className="p-3">
                  <form action={actualizarEmprendimientoExternoAction} className="space-y-1">
                    <input type="hidden" name="id" value={r.id} />
                    <select name="estado" defaultValue={r.estado} className={sel}>
                      <option value="preinscrito">Preinscrito</option>
                      <option value="aceptado">Aceptado</option>
                      <option value="rechazado">Rechazado</option>
                    </select>
                    <select name="estado_pago" defaultValue={r.estado_pago} className={sel}>
                      <option value="pendiente_pago">Pendiente pago</option>
                      <option value="pago_confirmado">Pago confirmado</option>
                      <option value="pago_rechazado">Pago rechazado</option>
                    </select>
                    <input
                      name="valor_pago"
                      type="number"
                      defaultValue={r.valor_pago ?? cfg.precio ?? ""}
                      placeholder="Valor"
                      className={`${sel} w-28`}
                    />
                    <input
                      name="notas_admin"
                      defaultValue={r.notas_admin ?? ""}
                      placeholder="Notas"
                      className={`${sel} w-full`}
                    />
                    <button className="rounded bg-uis-green px-3 py-1 text-xs font-semibold text-white">
                      Guardar
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  Aún no hay preinscripciones de emprendimientos externos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}