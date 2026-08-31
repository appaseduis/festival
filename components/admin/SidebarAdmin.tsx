"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cerrarSesionAction } from "@/app/actions/auth";

const ENLACES = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/inscritos", label: "Inscritos" },
  { href: "/admin/actividades", label: "Deportes y actividades" },
  { href: "/admin/pagos", label: "Pagos" },
  { href: "/admin/emprendimientos", label: "Emprendimientos" },
  { href: "/admin/talento", label: "Talento Cultural" },
  { href: "/admin/control", label: "Control (QR/Cédula)" },
  { href: "/admin/reportes", label: "Reportes" },
  { href: "/admin/configuracion", label: "Configuración" },
  
];

export default function SidebarAdmin({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-navy flex flex-col shrink-0">
      <div className="p-5 border-b border-white/10">
        <p className="font-display font-bold text-white text-sm">Festival UIS V2</p>
        <p className="text-xs text-white/50 mt-1 truncate">{email}</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {ENLACES.map((enlace) => {
          const activo =
            enlace.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(enlace.href);

          return (
            <Link
              key={enlace.href}
              href={enlace.href}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                activo
                  ? "bg-white text-navy font-medium"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {enlace.label}
            </Link>
          );
        })}
      </nav>

      <form action={cerrarSesionAction} className="p-3 border-t border-white/10">
        <button
          type="submit"
          className="w-full px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white text-left transition-colors"
        >
          Cerrar sesión
        </button>
      </form>
    </aside>
  );
}