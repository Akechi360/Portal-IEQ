import { jwtVerify, SignJWT } from "jose";
import bcrypt from "bcrypt";

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
    .setExpirationTime("12h") // Expiración de 12 horas para el panel
    .sign(key);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
