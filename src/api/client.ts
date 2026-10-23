const BASE_URL = (import.meta.env?.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const MENSAJES_ERROR: Record<number, string> = {
  400: "Revisa los datos enviados e intenta nuevamente.",
  401: "Sesión no válida o expirada. Inicia sesión nuevamente.",
  403: "No tienes permisos para realizar esta acción.",
  404: "No encontramos la información solicitada.",
  409: "No se pudo completar la operación por un conflicto.",
  502: "El servidor no pudo completar la operación. Inténtalo de nuevo.",
};

export interface ApiRequestOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.error ?? MENSAJES_ERROR[response.status] ?? MENSAJES_ERROR[502],
    );
  }
  return data as T;
}
