<<<<<<< HEAD
// ─── lib/access.ts ────────────────────────────────────────────────────────────
// Lógica de acceso alineada al schema clínico (Admin, Credential, Doctor).
// Modo offline: los flujos de login retornan mock data sin consultar la DB.
// TODO Fase 3: descomentar las llamadas a `db.*` y eliminar los bloques MOCK.

import { AdminRole } from "@prisma/client";
import { db } from "@/lib/db";
import { comparePassword } from "@/lib/auth";
import { logAccess } from "@/lib/audit";

// ─── Login Administrador (Panel Interno) ──────────────────────────────────────

export type AdminLoginResult =
  | { ok: true; adminId: string; role: AdminRole; nombre: string; username: string }
  | { ok: false; message: string };

/**
 * Autentica un Admin del panel interno (admisión / sistemas).
 * TODO Fase 3: reemplazar MOCK_ADMINS con db.admin.findUnique({ where: { username } })
 */
export async function adminLogin(input: {
  username: string;
  password: string;
}): Promise<AdminLoginResult> {
  const username = input.username.trim();

  // ── MOCK OFFLINE ──────────────────────────────────────────────────────────
  // Credenciales de desarrollo. Reemplazar con consulta DB en Fase 3.
  // Passwords de prueba: sistemas → "Sistemas#2026" | operador → "Admision#2026"
  const MOCK_ADMINS = [
    {
      id: "admin-mock-superadmin",
      username: "admin_sistemas",
      // bcryptjs hash de "Sistemas#2026"
      passwordHash: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lVWy",
      role: AdminRole.SUPERADMIN,
      nombre: "Administrador de Sistemas",
      status: "ACTIVE" as const,
    },
    {
      id: "admin-mock-operador",
      username: "admin_operador",
      // bcryptjs hash de "Admision#2026"
      passwordHash: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
      role: AdminRole.OPERADOR,
      nombre: "Operador de Admisión",
      status: "ACTIVE" as const,
    },
  ];
  // ─────────────────────────────────────────────────────────────────────────

  /* TODO Fase 3: descomentar y eliminar MOCK_ADMINS
  const found = await db.admin.findUnique({ where: { username } });
  */
  const found = MOCK_ADMINS.find((a) => a.username === username);

  if (!found || found.status !== "ACTIVE") {
    await logAccess({ event: "AUTH_FAIL", actor: username, detail: "USER_NOT_FOUND" });
    return { ok: false, message: "Credenciales inválidas" };
  }

  const validPassword = await comparePassword(input.password, found.passwordHash);
  if (!validPassword) {
    await logAccess({ event: "AUTH_FAIL", actor: username, detail: "INVALID_PASSWORD" });
    return { ok: false, message: "Credenciales inválidas" };
  }

  await logAccess({ event: "AUTH_SUCCESS", actor: username });
  return { ok: true, adminId: found.id, role: found.role, nombre: found.nombre, username };
}

// ─── Login Invitado WiFi (voucher code) ───────────────────────────────────────

export type GuestLoginResult =
  | { ok: true; credentialId: string; nombre: string; tipo: string; expireAt: Date | null }
  | { ok: false; message: string };

/**
 * Valida un voucher de paciente / tránsito para el portal WiFi.
 * TODO Fase 3: db.credential.findUnique({ where: { voucherCode } }) + validar status y expiración
 */
export async function guestLogin(input: {
  voucherCode: string;
  mac: string;
}): Promise<GuestLoginResult> {
  // ── MOCK OFFLINE ──────────────────────────────────────────────────────────
  console.warn("[access][offline] guestLogin — voucherCode:", input.voucherCode);

  /* TODO Fase 3: descomentar
  const credential = await db.credential.findUnique({ where: { voucherCode: input.voucherCode } });
  if (!credential || credential.status !== "ACTIVE") {
    return { ok: false, message: "Código inválido o expirado." };
  }
  if (credential.expireAt && credential.expireAt < new Date()) {
    return { ok: false, message: "Código inválido o expirado." };
  }
  // Registrar sesión
  await db.session.create({ data: { mac: input.mac, credentialId: credential.id, ssid: "IEQ-Guest" } });
  return { ok: true, credentialId: credential.id, nombre: credential.nombre, tipo: credential.tipo, expireAt: credential.expireAt };
  */

  return {
    ok: true,
    credentialId: "cred-mock-001",
    nombre: "Paciente Demo",
    tipo: "PACIENTE",
    expireAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
  };
}

// ─── Login Médico WiFi (voucher permanente) ───────────────────────────────────

export type DoctorLoginResult =
  | { ok: true; doctorId: string; nombre: string; especialidad: string | null }
  | { ok: false; message: string };

/**
 * Valida el voucher permanente de un médico para el portal WiFi.
 * TODO Fase 3: db.doctor.findUnique({ where: { voucherCode } }) + validar status ACTIVE
 */
export async function doctorLogin(input: {
  voucherCode: string;
  mac: string;
}): Promise<DoctorLoginResult> {
  // ── MOCK OFFLINE ──────────────────────────────────────────────────────────
  console.warn("[access][offline] doctorLogin — voucherCode:", input.voucherCode);

  /* TODO Fase 3: descomentar
  const doctor = await db.doctor.findUnique({ where: { voucherCode: input.voucherCode } });
  if (!doctor || doctor.status !== "ACTIVE") {
    return { ok: false, message: "Acceso no autorizado." };
  }
  await db.session.create({ data: { mac: input.mac, doctorId: doctor.id, ssid: "IEQ-Medicos" } });
  return { ok: true, doctorId: doctor.id, nombre: doctor.nombre, especialidad: doctor.especialidad };
  */

  return {
    ok: true,
    doctorId: "doctor-mock-001",
    nombre: "Dr. Demo",
    especialidad: "Medicina General",
  };
=======
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
>>>>>>> 53f8a2c92a064c1299ac43fdff28034dd65a9b27
}
