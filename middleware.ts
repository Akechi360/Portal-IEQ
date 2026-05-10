import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/app/lib/auth";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Rutas de autenticación internas
  const isAdminLogin = path === "/admin/login";
  const isAdmisionLogin = path === "/admision/login";
  
  // Zonas protegidas
  const isAdminZone = path.startsWith("/admin") && !isAdminLogin;
  const isAdmisionZone = path.startsWith("/admision") && !isAdmisionLogin;

  // Si no es una zona protegida interna, dejamos pasar
  if (!isAdminLogin && !isAdmisionLogin && !isAdminZone && !isAdmisionZone) {
    return NextResponse.next();
  }

  const token = request.cookies.get("ieq_session")?.value;
  let payload = null;

  if (token) {
    payload = await verifyToken(token);
  }

  // --- LÓGICA PARA RUTAS DE LOGIN ---
  // Si ya tiene sesión válida y entra al login, redirigirlo a su dashboard
  if (isAdminLogin || isAdmisionLogin) {
    if (payload) {
      if (isAdminLogin && (payload.role === "SUPERADMIN" || payload.role === "ADMIN")) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      if (isAdmisionLogin && (payload.role === "OPERADOR" || payload.role === "ADMIN" || payload.role === "SUPERADMIN")) {
        return NextResponse.redirect(new URL("/admision/dashboard", request.url));
      }
    }
    return NextResponse.next();
  }

  // --- LÓGICA PARA ZONAS PROTEGIDAS ---
  if (!payload) {
    // Redirigir al login correspondiente según la zona intentada
    const loginUrl = isAdmisionZone ? "/admision/login" : "/admin/login";
    return NextResponse.redirect(new URL(loginUrl, request.url));
  }

  // Verificar roles para /admin/*
  if (isAdminZone) {
    if (payload.role !== "SUPERADMIN" && payload.role !== "ADMIN") {
      // Si un operador intenta entrar a sistemas
      return NextResponse.redirect(new URL("/admision/dashboard", request.url));
    }
  }

  // Verificar roles para /admision/*
  if (isAdmisionZone) {
    // OPERADOR, ADMIN, SUPERADMIN están permitidos. (Básicamente cualquier rol válido)
    // No necesitamos validación adicional aquí porque el middleware ya bloquea si no hay payload,
    // y el enum de roles solo tiene esos tres.
  }

  return NextResponse.next();
}

export const config = {
  // Configurar las rutas donde aplica el middleware para optimizar el rendimiento
  matcher: [
    "/admin/:path*",
    "/admision/:path*",
  ],
};
