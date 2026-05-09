import { AuditAction, UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { evaluateSecurityPolicies } from "@/lib/policy";
import { findUserWithActiveGrant, isGrantActive, normalizeMac, verifyLoginCredentials } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function executeLogin(input: {
  username: string;
  passwordOrToken?: string;
  clientMac: string;
  apMac: string;
  ssid: string;
}) {
  const username = input.username.trim();
  const mac = normalizeMac(input.clientMac);

  await logAudit({
    action: AuditAction.LOGIN_TRY,
    actorUsername: username,
    metadata: { clientMac: mac, apMac: input.apMac, ssid: input.ssid }
  });

  const found = await findUserWithActiveGrant(username);
  if (!found || !found.grant) {
    await logAudit({
      action: AuditAction.LOGIN_FAIL,
      actorUsername: username,
      metadata: { reason: "USER_OR_GRANT_NOT_FOUND", clientMac: mac }
    });
    return { ok: false as const, message: "Acceso denegado" };
  }

  const { user, grant } = found;
  if (user.status === "BLOCKED" || !isGrantActive(grant)) {
    await logAudit({
      action: AuditAction.LOGIN_FAIL,
      actorUsername: username,
      actorUserId: user.id,
      targetUserId: user.id,
      metadata: { reason: "BLOCKED_OR_EXPIRED", clientMac: mac }
    });
    return { ok: false as const, message: "Acceso denegado" };
  }

  const validSecret = await verifyLoginCredentials({
    user,
    grant,
    passwordOrToken: input.passwordOrToken
  });

  if (!validSecret) {
    await logAudit({
      action: AuditAction.LOGIN_FAIL,
      actorUsername: username,
      actorUserId: user.id,
      targetUserId: user.id,
      metadata: { reason: "INVALID_SECRET", clientMac: mac }
    });
    return { ok: false as const, message: "Acceso denegado" };
  }

  const existingDevices = await db.device.count({ where: { userId: user.id, isBlocked: false } });
  const hasCurrentDevice = await db.device.findUnique({
    where: { userId_mac: { userId: user.id, mac } }
  });

  if (!hasCurrentDevice && existingDevices >= grant.maxDevices) {
    await logAudit({
      action: AuditAction.LOGIN_FAIL,
      actorUsername: username,
      actorUserId: user.id,
      targetUserId: user.id,
      metadata: {
        reason: "MAX_DEVICES_REACHED",
        maxDevices: grant.maxDevices,
        currentDevices: existingDevices
      }
    });
    return { ok: false as const, message: "Acceso denegado" };
  }

  if (hasCurrentDevice) {
    await db.device.update({
      where: { id: hasCurrentDevice.id },
      data: { lastSeen: new Date() }
    });
  } else {
    await db.device.create({
      data: {
        userId: user.id,
        mac,
        firstSeen: new Date(),
        lastSeen: new Date()
      }
    });
  }

  const policy = await evaluateSecurityPolicies({
    userId: user.id,
    username: user.username,
    role: user.role,
    mac,
    grantMaxDevices: grant.maxDevices
  });

  if (policy.blocked) {
    return { ok: false as const, message: "Acceso denegado" };
  }

  await logAudit({
    action: AuditAction.LOGIN_OK,
    actorUsername: username,
    actorUserId: user.id,
    targetUserId: user.id,
    metadata: { clientMac: mac, role: user.role, grantId: grant.id }
  });

  return {
    ok: true as const,
    userId: user.id,
    role: user.role,
    grantId: grant.id
  };
}

export function mapApiTypeToRole(type: "Paciente" | "Transito" | "Medico" | "Gerencia"): UserRole {
  const mapping: Record<string, UserRole> = {
    Paciente: "PACIENTE",
    Transito: "TRANSITO",
    Medico: "MEDICO",
    Gerencia: "GERENCIA"
  };
  return mapping[type];
}
