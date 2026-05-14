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
  void logAccess; // suppress unused import warning
  return { anomalies: [], blocked: false };
}
