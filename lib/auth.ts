import bcrypt from "bcryptjs";
import crypto from "crypto";
import { AccessGrant, User } from "@prisma/client";
import { db } from "@/lib/db";

export function normalizeMac(mac: string) {
  return mac.trim().toLowerCase();
}

export async function hashPassword(value: string) {
  return bcrypt.hash(value, 10);
}

export async function comparePassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export function generateToken(size = 16) {
  return crypto.randomBytes(size).toString("hex").toUpperCase().match(/.{1,4}/g)?.join("-") ?? crypto.randomBytes(size).toString("hex");
}

export function generateUsername(prefix: string) {
  const suffix = Math.floor(10000 + Math.random() * 89999);
  return `${prefix}_${suffix}`;
}

export function isGrantActive(grant: AccessGrant | null) {
  if (!grant) return false;
  if (grant.isRevoked) return false;
  if (grant.isPermanent) return true;
  if (!grant.endsAt) return false;
  return grant.endsAt.getTime() > Date.now();
}

export async function findUserWithActiveGrant(username: string) {
  const user = await db.user.findUnique({
    where: { username },
    include: {
      grants: {
        orderBy: { createdAt: "desc" },
        take: 5
      }
    }
  });

  if (!user) return null;
  const grant = user.grants.find((item) => isGrantActive(item)) ?? null;
  return { user, grant };
}

export async function verifyLoginCredentials(input: {
  user: User;
  grant: AccessGrant | null;
  passwordOrToken?: string;
}) {
  const secret = input.passwordOrToken?.trim();
  if (!secret) return false;

  if (input.user.passwordHash) {
    return comparePassword(secret, input.user.passwordHash);
  }

  if (!input.grant?.token) return false;
  return input.grant.token === secret;
}
