// lib/session-activity.ts
// Una sesión de RADIUS se considera "activa" solo si NO ha cerrado (endedAt
// null) y recibió un paquete de accounting recientemente. Así, si el gateway
// pierde el Stop, la sesión no queda "pegada" como activa para siempre.

/** Ventana de inactividad tras la cual una sesión abierta se da por caída. */
export const SESSION_STALE_MS = 15 * 60 * 1000; // 15 min

/** Fecha de corte: `lastSeenAt` debe ser >= esto para contar como activa. */
export function staleCutoff(): Date {
  return new Date(Date.now() - SESSION_STALE_MS);
}

/** Filtro Prisma para sesiones activas (usar en findMany / _count). */
export function activeSessionWhere() {
  return { endedAt: null, lastSeenAt: { gte: staleCutoff() } };
}

/** ¿Está activa esta sesión ahora mismo? */
export function isSessionActive(s: { endedAt: Date | null; lastSeenAt: Date | null }): boolean {
  if (s.endedAt) return false;
  if (!s.lastSeenAt) return false;
  return new Date(s.lastSeenAt).getTime() >= Date.now() - SESSION_STALE_MS;
}
