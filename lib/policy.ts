import { AuditAction, UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

type AnomalyCode =
  | "REPEATED_PATIENT_TOKENS_SAME_MAC"
  | "TRANSITO_TOO_MANY_DEVICES"
  | "PERMANENT_ROLE_UNUSUAL_DEVICES";

interface AnomalyInput {
  userId: string;
  username: string;
  role: UserRole;
  mac: string;
  grantMaxDevices: number;
}

export async function evaluateSecurityPolicies(input: AnomalyInput) {
  const anomalies: AnomalyCode[] = [];

  const deviceCount = await db.device.count({
    where: {
      userId: input.userId,
      isBlocked: false
    }
  });

  if (input.role === "TRANSITO" && deviceCount > 1) {
    anomalies.push("TRANSITO_TOO_MANY_DEVICES");
  }

  if ((input.role === "MEDICO" || input.role === "GERENCIA") && deviceCount > Math.max(input.grantMaxDevices + 2, 5)) {
    anomalies.push("PERMANENT_ROLE_UNUSUAL_DEVICES");
  }

  if (input.role === "PACIENTE") {
    const repeatedMacGrants = await db.device.count({
      where: {
        mac: input.mac,
        user: { role: "PACIENTE" }
      }
    });

    if (repeatedMacGrants > 4) {
      anomalies.push("REPEATED_PATIENT_TOKENS_SAME_MAC");
    }
  }

  if (anomalies.length > 0) {
    await logAudit({
      action: AuditAction.POLICY_ANOMALY,
      actorUsername: input.username,
      actorUserId: input.userId,
      targetUserId: input.userId,
      metadata: { anomalies, mac: input.mac, role: input.role }
    });
  }

  const shouldBlock = anomalies.includes("TRANSITO_TOO_MANY_DEVICES");

  if (shouldBlock) {
    await db.user.update({
      where: { id: input.userId },
      data: { status: "BLOCKED" }
    });

    await logAudit({
      action: AuditAction.USER_BLOCKED_BY_POLICY,
      actorUsername: "system",
      targetUserId: input.userId,
      metadata: { reason: anomalies }
    });
  }

  return { anomalies, blocked: shouldBlock };
}
