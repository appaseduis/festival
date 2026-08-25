export type EstadoPago =
  | "pendiente_pago"
  | "comprobante_en_revision"
  | "pago_confirmado"
  | "pago_rechazado";

export type EstadoInscripcion = "registrada" | "confirmada" | "cancelada";
export type MetodoPago = "bold" | "bancolombia";
export type Genero = "M" | "F";
export type TipoEgresado = "socio" | "no_socio";

export interface ConfiguracionPublica {
  nombre_evento: string;
  fecha_inicio: string;
  fecha_fin: string;
  lugar: string;
  precio_egresado_socio: number;
  precio_egresado_no_socio: number;
  precio_acompanante: number;
  whatsapp_numero: string;
  bold_activo: boolean;
}

export interface Talla {
  id: string;
  nombre: string;
  activo: boolean;
  orden: number;
}

export interface Actividad {
  id: string;
  nombre: string;
  activo: boolean;
  orden: number;
}

export interface Inscrito {
  id: string;
  nombres_completos: string;
  documento: string;
  correo: string;
  celular: string;
  genero: Genero;
  programa_academico: string;
  talla_id: string;
  actividad_id: string | null;
  comentarios: string | null;
  tipo_egresado: TipoEgresado;
  cantidad_acompanantes: number;
  subtotal_egresado: number;
  subtotal_acompanantes: number;
  total: number;
  estado_pago: EstadoPago;
  estado_inscripcion: EstadoInscripcion;
  metodo_pago: MetodoPago | null;
  qr_token: string | null;
  cantidad_fichos: number;
}

export interface AcompananteInput {
  nombre: string;
  documento: string;
  edad: number;
}

export interface CrearInscripcionInput {
  nombres_completos: string;
  documento: string;
  correo: string;
  celular: string;
  genero: Genero;
  programa_academico: string;
  talla_id: string;
  actividades_ids: string[];
  comentarios: string | null;
  tipo_egresado: TipoEgresado;
  acompanantes: AcompananteInput[];
}

export type CategoriaEmprendimiento =
  | "Alimentos y Bebidas Preparadas"
  | "Alimentos y Bebidas Envasadas/Empacadas"
  | "Moda y Accesorios"
  | "Joyería y Bisutería"
  | "Hogar y Decoración"
  | "Cuidado Personal y Belleza"
  | "Arte y Diseño"
  | "Mascotas"
  | "Servicios"
  | "Tecnología y Gadgets"
  | "Otro";

export const CATEGORIAS_EMPRENDIMIENTO: CategoriaEmprendimiento[] = [
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
];

export type EstadoEmprendimiento = "preinscrito" | "rechazado" | "aceptado";

export interface Emprendimiento {
  id: string;
  nombre_responsable: string;
  correo: string;
  telefono: string;
  nombre_emprendimiento: string;
  facebook: string | null;
  instagram: string | null;
  pagina_web: string | null;
  categoria: CategoriaEmprendimiento;
  categoria_otro: string | null;
  tipo_egresado: TipoEgresado;
  necesita_electricidad: boolean;
  estado: EstadoEmprendimiento;
  notas_admin: string | null;
  created_at: string;
}

export interface CrearEmprendimientoInput {
  nombre_responsable: string;
  correo: string;
  telefono: string;
  nombre_emprendimiento: string;
  facebook: string | null;
  instagram: string | null;
  pagina_web: string | null;
  categoria: CategoriaEmprendimiento;
  categoria_otro: string | null;
  tipo_egresado: TipoEgresado;
  necesita_electricidad: boolean;
}