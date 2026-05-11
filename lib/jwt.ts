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
