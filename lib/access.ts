// ─── lib/access.ts ────────────────────────────────────────────────────────────
// Lógica de acceso alineada al schema clínico (Admin, Credential, Doctor).
// Modo offline: los flujos de login retornan mock data sin consultar la DB.
// TODO Fase 3: descomentar las llamadas a `db.*` y eliminar los bloques MOCK.

import { AdminRole, AdminStatus, SessionAccessType } from "@prisma/client";
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

  const found = await db.admin.findUnique({ where: { username } });

  if (!found || found.status !== AdminStatus.ACTIVE) {
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
  const credential = await db.credential.findUnique({ where: { voucherCode: input.voucherCode } });
  if (!credential || credential.status !== "ACTIVE") {
    return { ok: false, message: "Código inválido o expirado." };
  }
  if (credential.expireAt && credential.expireAt < new Date()) {
    return { ok: false, message: "Código inválido o expirado." };
  }
  // Registrar sesión
  await db.session.create({ 
    data: { 
      mac: input.mac, 
      credentialId: credential.id, 
      ssid: "IEQ-Guest",
      accessType: SessionAccessType.GUEST 
    } 
  });
  return { ok: true, credentialId: credential.id, nombre: credential.nombre, tipo: credential.tipo, expireAt: credential.expireAt };
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
  const doctor = await db.doctor.findUnique({ where: { voucherCode: input.voucherCode } });
  if (!doctor || doctor.status !== "ACTIVE") {
    return { ok: false, message: "Acceso no autorizado." };
  }
  await db.session.create({ 
    data: { 
      mac: input.mac, 
      doctorId: doctor.id, 
      ssid: "IEQ-Medicos",
      accessType: SessionAccessType.DOCTOR
    } 
  });
  return { ok: true, doctorId: doctor.id, nombre: doctor.nombre, especialidad: doctor.especialidad };
}


