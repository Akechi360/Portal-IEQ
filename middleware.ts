import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
<<<<<<< HEAD
import { verifyToken } from "@/lib/jwt";
=======
import { verifyToken } from "@/app/lib/auth";
>>>>>>> 53f8a2c92a064c1299ac43fdff28034dd65a9b27

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

<<<<<<< HEAD
  // Rutas de autenticación internas (legacy + nuevo)
  const isAdminLogin = path === "/admin/login";
  const isAdmisionLogin = path === "/admision/login";
  const isStaffLogin = path === "/staff/login";
=======
  // Rutas de autenticación internas
  const isAdminLogin = path === "/admin/login";
  const isAdmisionLogin = path === "/admision/login";
>>>>>>> 53f8a2c92a064c1299ac43fdff28034dd65a9b27
  
  // Zonas protegidas
  const isAdminZone = path.startsWith("/admin") && !isAdminLogin;
  const isAdmisionZone = path.startsWith("/admision") && !isAdmisionLogin;
<<<<<<< HEAD
  const isStaffZone = path.startsWith("/staff") && !isStaffLogin;

  // Si no es una zona protegida interna, dejamos pasar
  if (!isAdminLogin && !isAdmisionLogin && !isStaffLogin && !isAdminZone && !isAdmisionZone && !isStaffZone) {
=======

  // Si no es una zona protegida interna, dejamos pasar
  if (!isAdminLogin && !isAdmisionLogin && !isAdminZone && !isAdmisionZone) {
>>>>>>> 53f8a2c92a064c1299ac43fdff28034dd65a9b27
    return NextResponse.next();
  }

  const token = request.cookies.get("ieq_session")?.value;
  let payload = null;

  if (token) {
    payload = await verifyToken(token);
  }

  // --- LÓGICA PARA RUTAS DE LOGIN ---
  // Si ya tiene sesión válida y entra al login, redirigirlo a su dashboard
<<<<<<< HEAD
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
=======
  if (isAdminLogin || isAdmisionLogin) {
    if (payload) {
      if (isAdminLogin && (payload.role === "SUPERADMIN" || payload.role === "ADMIN")) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      if (isAdmisionLogin && (payload.role === "OPERADOR" || payload.role === "ADMIN" || payload.role === "SUPERADMIN")) {
        return NextResponse.redirect(new URL("/admision/dashboard", request.url));
>>>>>>> 53f8a2c92a064c1299ac43fdff28034dd65a9b27
      }
    }
    return NextResponse.next();
  }

  // --- LÓGICA PARA ZONAS PROTEGIDAS ---
  if (!payload) {
<<<<<<< HEAD
    // Redirigir al login unificado
    return NextResponse.redirect(new URL("/staff/login", request.url));
=======
    // Redirigir al login correspondiente según la zona intentada
    const loginUrl = isAdmisionZone ? "/admision/login" : "/admin/login";
    return NextResponse.redirect(new URL(loginUrl, request.url));
>>>>>>> 53f8a2c92a064c1299ac43fdff28034dd65a9b27
  }

  // Verificar roles para /admin/*
  if (isAdminZone) {
    if (payload.role !== "SUPERADMIN" && payload.role !== "ADMIN") {
<<<<<<< HEAD
      // Si un operador intenta entrar a sistemas -> redirigir a admision
      return NextResponse.redirect(new URL("/admision", request.url));
=======
      // Si un operador intenta entrar a sistemas
      return NextResponse.redirect(new URL("/admision/dashboard", request.url));
>>>>>>> 53f8a2c92a064c1299ac43fdff28034dd65a9b27
    }
  }

  // Verificar roles para /admision/*
  if (isAdmisionZone) {
<<<<<<< HEAD
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
=======
    // OPERADOR, ADMIN, SUPERADMIN están permitidos. (Básicamente cualquier rol válido)
    // No necesitamos validación adicional aquí porque el middleware ya bloquea si no hay payload,
    // y el enum de roles solo tiene esos tres.
>>>>>>> 53f8a2c92a064c1299ac43fdff28034dd65a9b27
  }

  return NextResponse.next();
}

export const config = {
  // Configurar las rutas donde aplica el middleware para optimizar el rendimiento
  matcher: [
    "/admin/:path*",
    "/admision/:path*",
<<<<<<< HEAD
    "/staff/:path*",
=======
>>>>>>> 53f8a2c92a064c1299ac43fdff28034dd65a9b27
  ],
};
