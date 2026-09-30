import Link from "next/link";
import {
  listarEmprendimientosExternosAction,
  actualizarEmprendimientoExternoAction,
  cambiarEstadoExternoAction,
  obtenerConfigExternosAction,
} from "@/app/actions/emprendimientoExterno";
import { formatoPrecioExterno } from "@/lib/validations/emprendimientosExternos";

export const dynamic = "force-dynamic";

const sel = "rounded border border-gray-300 px-2 py-1 text-xs";

const BADGE_ESTADO: Record<string, string> = {
  preinscrito: "bg-amber-100 text-amber-800",
  aceptado: "bg-green-100 text-green-800",
  rechazado: "bg-red-100 text-red-800",
};

const FILTROS = [
  { key: "todos", label: "Todos" },
  { key: "preinscrito", label: "Preinscritos" },
  { key: "aceptado", label: "Aceptados" },
  { key: "rechazado", label: "Rechazados" },
];

export default async function AdminEmprendimientosExternosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado = "todos" } = await searchParams;
  const [todos, cfg] = await Promise.all([
    listarEmprendimientosExternosAction(),
    obtenerConfigExternosAction(),
  ]);

  const conteo = (k: string) =>
    k === "todos" ? todos.length : todos.filter((r) => r.estado === k).length;
  const rows = estado === "todos" ? todos : todos.filter((r) => r.estado === estado);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold text-navy">Emprendimientos</h1>
        <span className="rounded-full bg-cyan/10 px-3 py-1 text-xs font-bold uppercase text-cyan">
          Externos
        </span>
        <span className="text-sm text-gray-500">
          Tarifa única: {formatoPrecioExterno(cfg.precio)} ·{" "}
          {cfg.abierto ? "Formulario abierto" : "Formulario cerrado"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "todos" ? "?" : `?estado=${f.key}`}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              estado === f.key ? "bg-navy text-white" : "bg-white border border-gray-200 text-navy"
            }`}
          >
            {f.label} ({conteo(f.key)})
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-navy text-left text-xs text-white">
            <tr>
              <th className="p-3">Emprendimiento</th>
              <th className="p-3">Responsable</th>
              <th className="p-3">Categoría</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Pago</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-gray-100 align-top">
                <td className="p-3">
                  <p className="font-semibold text-navy">{r.nombre_emprendimiento}</p>
                  <p className="text-xs text-gray-500">{r.descripcion}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className="rounded bg-cyan/10 px-2 py-0.5 text-[10px] font-bold uppercase text-cyan">
                      Externo
                    </span>
                    {r.necesita_electricidad && (
                      <span className="rounded bg-yellow-100 px-2 py-0.5 text-[10px] font-bold text-yellow-800">
                        ⚡ Luz
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-gray-400">
                    {[r.instagram, r.facebook, r.pagina_web].filter(Boolean).join(" · ")}
                  </p>
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
                <td className="p-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${BADGE_ESTADO[r.estado]}`}
                  >
                    {r.estado}
                  </span>
                  <div className="mt-2 flex gap-1">
                    {r.estado !== "aceptado" && (
                      <form action={cambiarEstadoExternoAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="estado" value="aceptado" />
                        <button className="rounded bg-uis-green px-2 py-1 text-xs font-semibold text-white hover:opacity-90">
                          Aceptar
                        </button>
                      </form>
                    )}
                    {r.estado !== "rechazado" && (
                      <form action={cambiarEstadoExternoAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="estado" value="rechazado" />
                        <button className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:opacity-90">
                          Rechazar
                        </button>
                      </form>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <form action={actualizarEmprendimientoExternoAction} className="space-y-1">
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="estado" value={r.estado} />
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
                    <button className="rounded bg-navy px-3 py-1 text-xs font-semibold text-white">
                      Guardar pago
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  No hay emprendimientos externos en este filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}