// Con extensión para que las pruebas de Node (node --test) puedan cargar el módulo
import { ApiError, apiRequest } from "./client.ts";

// El registro pasa por el backend: crea la cuenta en Cognito y el perfil en la base de datos.
// El rol lo asigna el servidor; por eso aquí no se envía.

export interface UsuarioRegistrado {
  id: number;
  username: string;
  nombre: string;
  email: string | null;
  rol: string;
  activo: boolean;
}

export interface DatosRegistro {
  nombre: string;
  email: string;
  // El User Pool exige phone_number en formato E.164 (+56912345678); ver utils/telefono.ts
  telefono: string;
  password: string;
}

export function registrarUsuario(datos: DatosRegistro): Promise<UsuarioRegistrado> {
  return apiRequest<UsuarioRegistrado>("/auth/registro", { method: "POST", body: datos });
}

// Contratos explícitos de las peticiones. El servidor asigna el rol; el front no lo envía.
export interface ConfirmarRegistroRequest {
  email: string;
  codigo: string;
}

export interface ReenviarCodigoRequest {
  email: string;
}

export async function confirmarRegistro(request: ConfirmarRegistroRequest): Promise<void> {
  await apiRequest("/auth/registro/confirmar", { method: "POST", body: request });
}

export async function reenviarCodigo(request: ReenviarCodigoRequest): Promise<void> {
  await apiRequest("/auth/registro/reenviar-codigo", { method: "POST", body: request });
}

export function mensajeDeRegistro(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.";
}
