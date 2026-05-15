import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { comparePassword, signToken } from "@/app/lib/auth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    if (admin.status !== "ACTIVE") {
      return NextResponse.json({ error: "Usuario inactivo o bloqueado" }, { status: 403 });
    }

    const isMatch = await comparePassword(password, admin.passwordHash);

    if (!isMatch) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    // Actualizar último login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    // Crear token y setear cookie
    const token = await signToken({
      sub: admin.id,
      role: admin.role,
      username: admin.username,
      nombre: admin.nombre,
    });

    // Determinar redirección basada en el ROL
    let redirect = "/admision/dashboard";
    if (admin.role === "SUPERADMIN" || admin.role === "ADMIN") {
      redirect = "/admin/dashboard";
    }

    const response = NextResponse.json({ success: true, redirect });

    response.cookies.set({
      name: "ieq_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12, // 12 horas
    });

    return response;
  } catch (error) {
    console.error("Staff Login Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
