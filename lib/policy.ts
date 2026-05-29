// ─── lib/policy.ts ────────────────────────────────────────────────────────────
// Motor de políticas de seguridad.
// Comprobación de anomalías contra Session y AccessLog en DB.

import { db } from "@/lib/db";
import { LogEvent } from "@prisma/client";
import { logAccess } from "@/lib/audit";

export interface PolicyInput {
  mac: string;
  actor: string;
  tipo?: string;   // "PACIENTE" | "TRANSITO" | "MEDICO" | "STAFF"
  ssid?: string;
}

export interface PolicyResult {
  anomalies: string[];
  blocked: boolean;
}

/**
 * Evalúa políticas de seguridad para una sesión entrante.
 *
 * Comprobaciones contra DB:
 *  - PACIENTE: misma MAC usada por >4 credenciales distintas → REPEATED_VOUCHER_SAME_MAC
 *  - TRANSITO: >1 sesión simultánea activa → TRANSITO_TOO_MANY_SESSIONS
 *  - MEDICO/ADMIN: acceso en horario nocturno inusual → UNUSUAL_NIGHT_ACCESS
 */
export async function evaluatePolicy(input: PolicyInput): Promise<PolicyResult> {
  const anomalies: string[] = [];

  try {
    if (input.tipo === "TRANSITO") {
      const activeSessions = await db.session.count({
        where: { mac: input.mac, endedAt: null },
      });
      // Si ya hay más de una sesión activa (incluyendo la recién creada antes de evaluar)
      if (activeSessions > 1) {
        anomalies.push("TRANSITO_TOO_MANY_SESSIONS");
      }
    }

    if (input.tipo === "PACIENTE") {
      const sharedMacCount = await db.session.groupBy({
        by: ["credentialId"],
        where: { 
          mac: input.mac,
          credentialId: { not: null }
        },
      });
      if (sharedMacCount.length > 4) {
        anomalies.push("REPEATED_VOUCHER_SAME_MAC");
      }
    }

    const hour = new Date().getHours();
    if ((input.tipo === "MEDICO" || input.tipo === "STAFF") && (hour < 5 || hour > 23)) {
      anomalies.push("UNUSUAL_NIGHT_ACCESS");
    }

    if (anomalies.length > 0) {
      await logAccess({
        event: LogEvent.BLOCKED,
        actor: input.actor,
        mac: input.mac,
        ssid: input.ssid || null,
        detail: anomalies.join(","),
      });

      // Si está bloqueado por múltiples sesiones de tránsito, terminamos las sesiones activas de esta MAC
      if (anomalies.includes("TRANSITO_TOO_MANY_SESSIONS")) {
        await db.session.updateMany({
          where: { mac: input.mac, endedAt: null },
          data: { endedAt: new Date() },
        });
      }
    }
  } catch (error) {
    console.error("Error evaluating policies:", error);
  }

  const blocked = anomalies.includes("TRANSITO_TOO_MANY_SESSIONS");
  return { anomalies, blocked };
}

