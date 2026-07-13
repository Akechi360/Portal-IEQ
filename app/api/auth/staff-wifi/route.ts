import { NextResponse } from "next/server";
import { SessionAccessType, StaffStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { authorizeClient } from "@/lib/ruijie";
import { logAccess } from "@/lib/audit";
import { evaluatePolicy } from "@/lib/policy";
import { staffLoginSchema } from "@/lib/validators";
import { cookies } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = checkRateLimit(`staff-login:${clientIp}`);
  if (!rl.allowed) {
    return NextResponse.json({ success: false, message: "Demasiados intentos. Intenta de nuevo más tarde." }, { status: 429 });
  }

  try {
    const json = await req.json();
    const parsed = staffLoginSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Datos inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const email = parsed.data.email.toLowerCase();
    const mac =
      parsed.data.mac ??
      cookieStore.get("portal_mac")?.value ??
      "00:00:00:00:00:00";

    // 1. Validate staff user (búsqueda insensible a mayúsculas: cubre filas
    //    guardadas con distinta capitalización a la del correo escrito)
    const staffUser = await db.staffUser.findFirst({
      where: { email: { equals: email, mode: "insensitive" } }
    });

    if (!staffUser || staffUser.status !== StaffStatus.ACTIVE) {
      await logAccess({
        event: "AUTH_FAIL",
        actor: email,
        mac,
        ssid: "IEQ-Staff",
        detail: "STAFF_USER_NOT_FOUND_OR_INACTIVE"
      });
      return NextResponse.json(
        { success: false, message: "Correo no encontrado o inactivo en el registro de Staff." },
        { status: 404 }
      );
    }

    // 2. Evaluate policies BEFORE creating session
    const policy = await evaluatePolicy({ mac, actor: email, tipo: "STAFF", ssid: "IEQ-Staff" });
    if (policy.blocked) {
      return NextResponse.json(
        { success: false, message: "Acceso bloqueado por política de seguridad." },
        { status: 403 }
      );
    }

    // 3. Sin authorizeClient() (API Ruijie Cloud): la autorización la hace el
    // gateway local vía WiFiDog, no la nube. Evita la doble autorización.

    // 4. La sesión la crea/cierra el accounting de RADIUS, no el login.

    await logAccess({
      event: "AUTH_SUCCESS",
      actor: email,
      mac,
      ssid: "IEQ-Staff",
      detail: `staff:${staffUser.id}`
    });

    // WiFiDog: el cliente debe volver al gateway para que abra el acceso
    const gwAddress = cookieStore.get("portal_gw_address")?.value;
    const gwPort = cookieStore.get("portal_gw_port")?.value;
    const gatewayAuthUrl =
      gwAddress && gwPort
        ? `http://${gwAddress}:${gwPort}/wifidog/auth?token=${encodeURIComponent(email)}`
        : null;

    return NextResponse.json({
      success: true,
      message: "Acceso concedido.",
      data: {
        email: staffUser.email,
        nombre: staffUser.nombre ?? "Staff IEQ",
        mac,
        accessType: SessionAccessType.STAFF,
        gatewayAuthUrl
      },
    });
  } catch (error) {
    console.error("[POST /api/auth/staff-wifi]", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
