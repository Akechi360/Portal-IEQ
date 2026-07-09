import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Log temporal de diagnóstico: registrar peticiones no estáticas.
  // IMPORTANTE: las rutas WiFiDog del gateway están EXCLUIDAS del matcher —
  // cualquier respuesta que pase por middleware sale como Transfer-Encoding:
  // chunked y el parser HTTP embebido del EG1510XS no entiende chunks.
  if (!path.startsWith("/_next") && !path.includes(".")) {
    console.log(`[req] ${request.method} ${path}${request.nextUrl.search}`);
  }

  // Con skipTrailingSlashRedirect activo, conservar el 308 estándar para el
  // resto de rutas (las WiFiDog no pasan por aquí y se manejan en su route).
  if (path.length > 1 && path.endsWith("/")) {
    const url = request.nextUrl.clone();
    url.pathname = path.slice(0, -1);
    return NextResponse.redirect(url, 308);
  }

  // Rutas de autenticación internas
  const isAdminLogin = path === "/admin/login";
  const isAdmisionLogin = path === "/admision/login";
  
  // Zonas protegidas
  const isAdminZone = path.startsWith("/admin") && !isAdminLogin;
  const isAdmisionZone = path.startsWith("/admision") && !isAdmisionLogin;

  // Si no es una zona protegida interna, dejamos pasar (ej. portal de invitados, assets)
  if (!isAdminLogin && !isAdmisionLogin && !isAdminZone && !isAdmisionZone) {
    return NextResponse.next();
  }

  const token = request.cookies.get('ieq_session')?.value;
  let payload = null;

  if (token) {
    payload = await verifyToken(token);
  }

  // --- LÓGICA PARA RUTAS DE LOGIN ---
  // Si ya tiene sesión válida y entra al login, redirigirlo a su dashboard
  if (isAdminLogin || isAdmisionLogin) {
    if (payload) {
      const isAdminRole = payload.role === 'SUPERADMIN' || payload.role === 'ADMIN';
      const isOperadorRole = payload.role === 'OPERADOR';

      // Admin/Superadmin -> /admin/dashboard
      if (isAdminRole) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      // Operador -> /admision/dashboard
      if (isOperadorRole) {
        return NextResponse.redirect(new URL('/admision/dashboard', request.url));
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
    const isAdminRole = payload.role === 'SUPERADMIN' || payload.role === 'ADMIN';
    if (!isAdminRole) {
      // Si un operador intenta entrar a sistemas -> redirigir a su panel de admision
      if (payload.role === 'OPERADOR') {
        return NextResponse.redirect(new URL('/admision/dashboard', request.url));
      }
      // Si es cualquier otro rol no autorizado -> login de sistemas
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Verificar roles para /admision/*
  if (isAdmisionZone) {
    // Solo OPERADOR, ADMIN, SUPERADMIN permitidos
    const validRolesForAdmision = ['OPERADOR', 'ADMIN', 'SUPERADMIN'];
    if (!validRolesForAdmision.includes(payload.role)) {
      // Si tuviera una sesión válida de otro tipo pero no permitida aquí, login de admisión
      return NextResponse.redirect(new URL("/admision/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Excluir del middleware TODO el tráfico WiFiDog del gateway (wifidog y
  // auth/wifidogAuth): el middleware fuerza respuestas chunked que el
  // parser del EG no puede leer. Esas rutas manejan su barra final solas.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|wifidog|auth/wifidogAuth).*)",
  ],
};
