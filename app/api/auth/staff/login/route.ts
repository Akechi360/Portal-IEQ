// app/api/auth/staff/login/route.ts
// Endpoint unificado para login de staff interno
// Resuelve rol y devuelve redirect al dashboard correspondiente
// Contrato: { success: true, redirect: "...", role: "..." } | { success: false, message: "..." }

import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { comparePassword, signToken } from "@/app/lib/auth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Faltan credenciales" },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    if (admin.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, message: "Usuario inactivo o bloqueado" },
        { status: 403 }
      );
    }

    const isMatch = await comparePassword(password, admin.passwordHash);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Actualizar último login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    // Resolver redirect según rol
    const role = admin.role;
    let redirect: string;

    if (role === "OPERADOR") {
      redirect = "/admision";
    } else if (role === "ADMIN" || role === "SUPERADMIN") {
      redirect = "/admin";
    } else {
      // Rol no reconocido para dashboards
      return NextResponse.json(
        { success: false, message: "Rol no autorizado para paneles" },
        { status: 403 }
      );
    }

    // Crear token y setear cookie
    const token = await signToken({
      sub: admin.id,
      role: admin.role,
      username: admin.username,
      nombre: admin.nombre,
    });

    const response = NextResponse.json({
      success: true,
      redirect,
      role: admin.role,
    });

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
    console.error("[POST /api/auth/staff/login]", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
