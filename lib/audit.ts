<<<<<<< HEAD
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
=======
import { AuditAction, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

interface LogAuditInput {
  action: AuditAction;
  actorUsername?: string | null;
  actorUserId?: string | null;
  targetUserId?: string | null;
  metadata?: Prisma.JsonValue;
}

export async function logAudit(input: LogAuditInput) {
  try {
    await db.auditLog.create({
      data: {
        action: input.action,
        actorUsername: input.actorUsername ?? null,
        actorUserId: input.actorUserId ?? null,
        targetUserId: input.targetUserId ?? null,
        metadata: input.metadata ?? {}
      }
    });
  } catch (error) {
    console.error("Audit log error", error);
>>>>>>> 53f8a2c92a064c1299ac43fdff28034dd65a9b27
  }
}
