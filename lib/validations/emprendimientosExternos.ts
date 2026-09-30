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