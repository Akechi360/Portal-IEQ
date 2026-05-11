import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Rutas de autenticación internas (legacy + nuevo)
  const isAdminLogin = path === "/admin/login";
  const isAdmisionLogin = path === "/admision/login";
  const isStaffLogin = path === "/staff/login";
  
  // Zonas protegidas
  const isAdminZone = path.startsWith("/admin") && !isAdminLogin;
  const isAdmisionZone = path.startsWith("/admision") && !isAdmisionLogin;
  const isStaffZone = path.startsWith("/staff") && !isStaffLogin;

  // Si no es una zona protegida interna, dejamos pasar
  if (!isAdminLogin && !isAdmisionLogin && !isStaffLogin && !isAdminZone && !isAdmisionZone && !isStaffZone) {
    return NextResponse.next();
  }

  const token = request.cookies.get("ieq_session")?.value;
  let payload = null;

  if (token) {
    payload = await verifyToken(token);
  }

  // --- LÓGICA PARA RUTAS DE LOGIN ---
  // Si ya tiene sesión válida y entra al login, redirigirlo a su dashboard
  if (isAdminLogin || isAdmisionLogin || isStaffLogin) {
    if (payload) {
      const isAdminRole = payload.role === "SUPERADMIN" || payload.role === "ADMIN";
      const isOperadorRole = payload.role === "OPERADOR";

      // Admin/Superadmin -> /admin
      if (isAdminRole) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      // Operador -> /admision
      if (isOperadorRole) {
        return NextResponse.redirect(new URL("/admision", request.url));
      }
    }
    return NextResponse.next();
  }

  // --- LÓGICA PARA ZONAS PROTEGIDAS ---
  if (!payload) {
    // Redirigir al login unificado
    return NextResponse.redirect(new URL("/staff/login", request.url));
  }

  // Verificar roles para /admin/*
  if (isAdminZone) {
    if (payload.role !== "SUPERADMIN" && payload.role !== "ADMIN") {
      // Si un operador intenta entrar a sistemas -> redirigir a admision
      return NextResponse.redirect(new URL("/admision", request.url));
    }
  }

  // Verificar roles para /admision/*
  if (isAdmisionZone) {
    // Solo OPERADOR, ADMIN, SUPERADMIN permitidos
    const validRoles = ["OPERADOR", "ADMIN", "SUPERADMIN"];
    if (!validRoles.includes(payload.role)) {
      return NextResponse.redirect(new URL("/staff/login", request.url));
    }
  }

  // Verificar roles para /staff/* (dashboards de staff, si existen)
  if (isStaffZone) {
    const validRoles = ["OPERADOR", "ADMIN", "SUPERADMIN"];
    if (!validRoles.includes(payload.role)) {
      return NextResponse.redirect(new URL("/staff/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Configurar las rutas donde aplica el middleware para optimizar el rendimiento
  matcher: [
    "/admin/:path*",
    "/admision/:path*",
    "/staff/:path*",
  ],
};
