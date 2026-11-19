// Utilidades puras para presentar el historial de notificaciones (sin React ni HTTP).

const FECHA_HORA_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/;

// Se crea una sola vez: construir Intl.DateTimeFormat en cada render es costoso
const FORMATO_FECHA_HORA = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/**
 * `LocalDateTime` del backend ("2026-11-13T22:00:00", sin zona) → "13 nov 2026, 22:00".
 * Sin zona horaria, el navegador la interpreta como hora local, que es como la guarda el servidor.
 * Devuelve el texto original si no tiene ese formato.
 */
export function formatearFechaHora(valor: string): string {
  if (!FECHA_HORA_ISO.test(valor)) return valor;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? valor : FORMATO_FECHA_HORA.format(fecha);
}

/** Roles vacíos o null significan que el envío fue a todos los usuarios activos (contrato del backend). */
export function describirDestinatarios(roles: readonly string[] | null): string {
  return roles && roles.length > 0 ? roles.join(", ") : "Todos los usuarios activos";
}

export function describirDispositivos(cantidad: number): string {
  return cantidad === 1 ? "1 dispositivo" : `${cantidad} dispositivos`;
}
