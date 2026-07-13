// ─── lib/access.ts ────────────────────────────────────────────────────────────
// Lógica de acceso alineada al schema clínico (Admin, Credential, Doctor).

import { AdminRole, AdminStatus, SessionAccessType } from "@prisma/client";
import { db } from "@/lib/db";
import { comparePassword } from "@/lib/auth";
import { logAccess } from "@/lib/audit";

// ─── Login Administrador (Panel Interno) ──────────────────────────────────────

export type AdminLoginResult =
  | { ok: true; adminId: string; role: AdminRole; nombre: string; username: string }
  | { ok: false; message: string };

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
 * Validates a guest voucher without creating a session.
 * The route handler creates the session after policy evaluation passes.
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
  return { ok: true, credentialId: credential.id, nombre: credential.nombre, tipo: credential.tipo, expireAt: credential.expireAt };
}

// ─── Login Médico WiFi (voucher permanente) ───────────────────────────────────

export type DoctorLoginResult =
  | { ok: true; doctorId: string; nombre: string; especialidad: string | null }
  | { ok: false; message: string };

/**
 * Validates a doctor voucher without creating a session.
 * The route handler creates the session after policy evaluation passes.
 */
export async function doctorLogin(input: {
  voucherCode: string;
  mac: string;
}): Promise<DoctorLoginResult> {
  // El portal envía el email del médico en el campo voucherCode. Los médicos
  // usan correos personales (gmail/outlook/yahoo...) que pueden escribir con
  // distinta capitalización a la del padrón importado — la búsqueda es
  // insensible a mayúsculas para que coincidan igual.
  const doctor = await db.doctor.findFirst({
    where: { email: { equals: input.voucherCode.trim(), mode: "insensitive" } },
  });
  if (!doctor || doctor.status !== "ACTIVE") {
    return { ok: false, message: "Acceso no autorizado." };
  }
  return { ok: true, doctorId: doctor.id, nombre: doctor.nombre, especialidad: doctor.especialidad };
}
