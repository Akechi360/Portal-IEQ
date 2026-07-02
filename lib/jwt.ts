// lib/jwt.ts
// Edge-compatible JWT helpers — NO bcrypt, NO native modules
// Usable desde middleware.ts (Edge Runtime) y Route Handlers (Node.js)

import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_key_change_in_production";
const key = new TextEncoder().encode(JWT_SECRET);

export interface SessionPayload {
  sub: string;
  role: string;
  username: string;
  nombre: string;
  [key: string]: any;
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(key);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies the session from the ieq_session cookie.
 * Use in API route handlers that need authentication.
 * Returns the payload if valid, null otherwise.
 */
export async function getSessionFromRequest(req: Request): Promise<SessionPayload | null> {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/(?:^|;\s*)ieq_session=([^;]+)/);
  if (!match) return null;
  return verifyToken(match[1]);
}

const ADMIN_ROLES = ["SUPERADMIN", "ADMIN"];
const ALL_INTERNAL_ROLES = ["SUPERADMIN", "ADMIN", "OPERADOR"];

/**
 * Requires a valid admin session (SUPERADMIN or ADMIN).
 * Returns the payload or a 401/403 NextResponse.
 */
export async function requireAdmin(req: Request): Promise<SessionPayload | Response> {
  const { NextResponse } = await import("next/server");
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ ok: false, message: "No autenticado" }, { status: 401 });
  }
  if (!ADMIN_ROLES.includes(session.role)) {
    return NextResponse.json({ ok: false, message: "Permisos insuficientes" }, { status: 403 });
  }
  return session;
}

/**
 * Requires any internal role (SUPERADMIN, ADMIN, or OPERADOR).
 * Returns the payload or a 401/403 NextResponse.
 */
export async function requireInternal(req: Request): Promise<SessionPayload | Response> {
  const { NextResponse } = await import("next/server");
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ ok: false, message: "No autenticado" }, { status: 401 });
  }
  if (!ALL_INTERNAL_ROLES.includes(session.role)) {
    return NextResponse.json({ ok: false, message: "Permisos insuficientes" }, { status: 403 });
  }
  return session;
}
