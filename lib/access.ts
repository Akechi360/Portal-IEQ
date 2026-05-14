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
}

// Suppress unused import warning for db (used in TODO Fase 3 comments)
void db;
