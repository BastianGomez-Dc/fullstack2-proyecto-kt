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

/**
 * Un envío del historial. Refleja el record `HistorialItem` de `NotificationController`
 * en el backend (`GET /api/notifications/historial`).
 */
export interface HistorialItem {
  id: number;
  titulo: string;
  cuerpo: string;
  /** Roles destino. Vacío (o null) significa que se envió a todos los usuarios activos. */
  roles: string[] | null;
  /** `LocalDateTime` del backend, sin zona horaria: "2026-11-13T22:00:00". */
  enviadoEn: string;
  dispositivosEnviados: number;
}

/** Respuesta completa del historial. El backend persiste cada envío en `notificacion_historial`. */
export type HistorialResponse = HistorialItem[];

function esNotificationResponse(value: unknown): value is NotificationResponse {
  if (typeof value !== "object" || value === null) return false;
  const respuesta = value as Record<string, unknown>;
  return typeof respuesta.mensaje === "string" && typeof respuesta.enviadoEn === "string";
}

function esHistorialItem(value: unknown): value is HistorialItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  const rolesValidos =
    item.roles === null ||
    (Array.isArray(item.roles) && item.roles.every((rol) => typeof rol === "string"));
  return (
    typeof item.id === "number" &&
    typeof item.titulo === "string" &&
    typeof item.cuerpo === "string" &&
    rolesValidos &&
    typeof item.enviadoEn === "string" &&
    typeof item.dispositivosEnviados === "number"
  );
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

export async function getHistorial(token: string): Promise<HistorialResponse> {
  const response = await apiRequest<unknown>("/notifications/historial", { token });
  if (!Array.isArray(response) || !response.every(esHistorialItem)) {
    throw new ApiError(502, "El servidor devolvió un historial de notificaciones con formato inesperado.");
  }
  return response;
}
