export const CATEGORIAS_EXT = [
  "Alimentos y Bebidas Preparadas",
  "Alimentos y Bebidas Envasadas/Empacadas",
  "Moda y Accesorios",
  "Joyería y Bisutería",
  "Hogar y Decoración",
  "Cuidado Personal y Belleza",
  "Arte y Diseño",
  "Mascotas",
  "Servicios",
  "Tecnología y Gadgets",
  "Otro",
] as const;

export function formatoPrecioExterno(precio: number | null) {
  return precio ? `$${precio.toLocaleString("es-CO")}` : "Por definir";
}

export type EstadoExterno = "preinscrito" | "aceptado" | "rechazado";
export type EstadoPagoExterno = "pendiente_pago" | "pago_confirmado" | "pago_rechazado";
export type FiltroExterno = EstadoExterno | "todos" | "pago_confirmado";

export interface EmprendimientoExterno {
  id: string;
  nombre_responsable: string;
  documento: string;
  correo: string;
  telefono: string;
  ciudad: string;
  nombre_emprendimiento: string;
  descripcion: string;
  facebook: string | null;
  instagram: string | null;
  pagina_web: string | null;
  categoria: string;
  categoria_otro: string | null;
  necesita_electricidad: boolean;
  estado: EstadoExterno;
  estado_pago: EstadoPagoExterno;
  valor_pago: number | null;
  notas_admin: string | null;
  created_at: string;
}