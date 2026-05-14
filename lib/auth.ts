// ─── lib/auth.ts ──────────────────────────────────────────────────────────────
// Utilidades de autenticación alineadas al schema clínico (Admin, Credential, Doctor).
// No importa modelos del schema viejo (User, AccessGrant).

import bcrypt from "bcryptjs";
import crypto from "crypto";

// ─── MAC ──────────────────────────────────────────────────────────────────────

/** Normaliza una dirección MAC a lowercase con ':' como separador. */
export function normalizeMac(mac: string): string {
  return mac.trim().toLowerCase();
}

// ─── Passwords ────────────────────────────────────────────────────────────────

export async function hashPassword(value: string): Promise<string> {
  return bcrypt.hash(value, 10);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ─── Tokens y códigos ────────────────────────────────────────────────────────

/**
 * Genera un código de voucher legible para imprimir.
 * Formato: IEQ-XXXX-XXXX (ej: IEQ-3A7F-B12C)
 */
export function generateVoucherCode(): string {
  const part = () => crypto.randomBytes(2).toString("hex").toUpperCase();
  return `IEQ-${part()}-${part()}`;
}

/**
 * Genera un token aleatorio con formato de grupos separados por guión.
 * Usado para tokens internos de sesión o reset.
 */
export function generateToken(size = 16): string {
  return (
    crypto
      .randomBytes(size)
      .toString("hex")
      .toUpperCase()
      .match(/.{1,4}/g)
      ?.join("-") ?? crypto.randomBytes(size).toString("hex").toUpperCase()
  );
}
