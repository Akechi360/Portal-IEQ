<<<<<<< HEAD
// ─── lib/policy.ts ────────────────────────────────────────────────────────────
// Motor de políticas de seguridad — modo offline.
// TODO Fase 3: implementar detección de anomalías contra Session y AccessLog en DB.

import { logAccess } from "@/lib/audit";

export interface PolicyInput {
  mac: string;
  actor: string;
  tipo?: string;   // "PACIENTE" | "TRANSITO" | "MEDICO" etc.
  ssid?: string;
}

export interface PolicyResult {
  anomalies: string[];
  blocked: boolean;
}

/**
 * Evalúa políticas de seguridad para una sesión entrante.
 * En modo offline retorna siempre { anomalies: [], blocked: false }.
 *
 * TODO Fase 3: implementar las siguientes comprobaciones contra DB:
 *  - PACIENTE: misma MAC usada por >4 credenciales distintas → REPEATED_VOUCHER_SAME_MAC
 *  - TRANSITO: >1 sesión simultánea activa → TRANSITO_TOO_MANY_SESSIONS
 *  - MEDICO/ADMIN: acceso en horario nocturno inusual → UNUSUAL_NIGHT_ACCESS
 */
export async function evaluatePolicy(input: PolicyInput): Promise<PolicyResult> {
  /*
  TODO Fase 3: descomentar y completar

  const anomalies: string[] = [];

  if (input.tipo === "TRANSITO") {
    const activeSessions = await db.session.count({
      where: { mac: input.mac, endedAt: null },
    });
    if (activeSessions > 1) anomalies.push("TRANSITO_TOO_MANY_SESSIONS");
  }

  if (input.tipo === "PACIENTE") {
    const sharedMacCount = await db.session.groupBy({
      by: ["credentialId"],
      where: { mac: input.mac },
      _count: true,
    });
    if (sharedMacCount.length > 4) anomalies.push("REPEATED_VOUCHER_SAME_MAC");
  }

  const hour = new Date().getHours();
  if ((input.tipo === "MEDICO") && (hour < 5 || hour > 23)) {
    anomalies.push("UNUSUAL_NIGHT_ACCESS");
  }

  if (anomalies.length > 0) {
    await logAccess({ event: "BLOCKED", actor: input.actor, mac: input.mac, detail: anomalies.join(",") });
  }

  const blocked = anomalies.includes("TRANSITO_TOO_MANY_SESSIONS");
  return { anomalies, blocked };
  */

  // Offline: sin bloqueos
  return { anomalies: [], blocked: false };
=======
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
>>>>>>> 53f8a2c92a064c1299ac43fdff28034dd65a9b27
}
