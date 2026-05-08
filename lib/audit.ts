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
  }
}
