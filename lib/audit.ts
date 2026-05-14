// ─── lib/audit.ts ─────────────────────────────────────────────────────────────
// Registro de eventos en AccessLog (schema clínico).
// En modo offline (sin DB), los eventos se escriben solo en consola.

import { LogEvent } from "@prisma/client";
import { db } from "@/lib/db";

export interface LogAccessInput {
  event: LogEvent;
  actor: string;
  mac?: string | null;
  ip?: string | null;
  ssid?: string | null;
  detail?: string | null;
}

/**
 * Registra un evento en la tabla AccessLog.
 * Falla silenciosamente en modo offline (sin DB disponible).
 * TODO Fase 3: asegurarse de que la DB esté disponible para persistir todos los eventos.
 */
export async function logAccess(input: LogAccessInput): Promise<void> {
  try {
    await db.accessLog.create({
      data: {
        event: input.event,
        actor: input.actor,
        mac: input.mac ?? null,
        ip: input.ip ?? null,
        ssid: input.ssid ?? null,
        detail: input.detail ?? null,
      },
    });
  } catch {
    // Offline: sin DB, el log falla silenciosamente para no interrumpir el flujo
    console.warn("[audit][offline]", input.event, "|", input.actor, "|", input.detail ?? "");
  }
}
