import { ApiError, apiRequest } from "./client.ts";

export const ROLES = ["ADMINISTRADOR", "COORDINADOR", "VOLUNTARIO", "BENEFICIARIO"] as const;

export type Rol = (typeof ROLES)[number];

export interface ManualNotificationRequest {
  titulo: string;
  cuerpo: string;
  roles: Rol[];
}

export interface NotificationResponse {
  mensaje: string;
  enviadoEn: string;
}

function esNotificationResponse(value: unknown): value is NotificationResponse {
  if (typeof value !== "object" || value === null) return false;
  const respuesta = value as Record<string, unknown>;
  return typeof respuesta.mensaje === "string" && typeof respuesta.enviadoEn === "string";
}

export async function enviarNotificacionManual(
  request: ManualNotificationRequest,
  token: string,
): Promise<NotificationResponse> {
  const response = await apiRequest<unknown>("/notifications/manual", {
    method: "POST",
    body: request,
    token,
  });

  if (!esNotificationResponse(response)) {
    throw new ApiError(502, "El servidor devolvió una respuesta inesperada al enviar la notificación.");
  }

  return response;
}

export async function getHistorial(token: string): Promise<unknown[]> {
  const response = await apiRequest<unknown>("/notifications/historial", { token });
  if (!Array.isArray(response)) {
    throw new ApiError(502, "El servidor devolvió un historial de notificaciones con formato inesperado.");
  }
  return response;
}
