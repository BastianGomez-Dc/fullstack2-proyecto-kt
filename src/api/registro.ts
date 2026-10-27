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
  // El User Pool exige phone_number en formato E.164 (+56912345678)
  telefono: string;
  password: string;
}

// Acepta lo que la gente suele escribir ("9 1234 5678", "+56 9 1234-5678", "56912345678")
// y lo deja en E.164. Si no lo reconoce, lo devuelve sin separadores para que la validación lo marque.
export function normalizarTelefono(valor: string): string {
  const limpio = valor.replace(/[\s().-]/g, "");
  if (limpio.startsWith("+")) return limpio;
  if (/^9\d{8}$/.test(limpio)) return `+56${limpio}`;
  if (/^569\d{8}$/.test(limpio)) return `+${limpio}`;
  return limpio;
}

export const esTelefonoValido = (telefono: string) => /^\+[1-9]\d{7,14}$/.test(telefono);

export function registrarUsuario(datos: DatosRegistro): Promise<UsuarioRegistrado> {
  return apiRequest<UsuarioRegistrado>("/auth/registro", { method: "POST", body: datos });
}

export async function confirmarRegistro(email: string, codigo: string): Promise<void> {
  await apiRequest("/auth/registro/confirmar", { method: "POST", body: { email, codigo } });
}

export async function reenviarCodigo(email: string): Promise<void> {
  await apiRequest("/auth/registro/reenviar-codigo", { method: "POST", body: { email } });
}

export function mensajeDeRegistro(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.";
}
