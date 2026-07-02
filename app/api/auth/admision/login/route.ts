import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparePassword } from "@/lib/auth";
import { signToken } from "@/lib/jwt";
import { logAccess } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = checkRateLimit(`admision-login:${clientIp}`);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Demasiados intentos. Intenta de nuevo más tarde." }, { status: 429 });
  }

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 });
    }

    const admin = await db.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      await logAccess({ event: "AUTH_FAIL", actor: username, detail: "USER_NOT_FOUND" });
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    if (admin.status !== "ACTIVE") {
      await logAccess({ event: "AUTH_FAIL", actor: username, detail: "INACTIVE_USER" });
      return NextResponse.json({ error: "Usuario inactivo o bloqueado" }, { status: 403 });
    }

    const validRoles = ["OPERADOR", "ADMIN", "SUPERADMIN"];
    if (!validRoles.includes(admin.role)) {
      return NextResponse.json({ error: "No tienes permisos de Admisión" }, { status: 403 });
    }

    const isMatch = await comparePassword(password, admin.passwordHash);

    if (!isMatch) {
      await logAccess({ event: "AUTH_FAIL", actor: username, detail: "INVALID_PASSWORD" });
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    await db.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const token = await signToken({
      sub: admin.id,
      role: admin.role,
      username: admin.username,
      nombre: admin.nombre,
    });

    await logAccess({ event: "AUTH_SUCCESS", actor: username });

    const response = NextResponse.json({ success: true, redirect: "/admision/dashboard" });

    response.cookies.set({
      name: "ieq_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
