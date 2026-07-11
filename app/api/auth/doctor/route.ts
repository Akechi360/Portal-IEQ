import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { doctorLoginSchema } from "@/lib/validators";
import { doctorLogin } from "@/lib/access";
import { authorizeClient } from "@/lib/ruijie";
import { logAccess } from "@/lib/audit";
import { evaluatePolicy } from "@/lib/policy";
import { getSystemConfig } from "@/lib/config";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = checkRateLimit(`doctor-login:${clientIp}`);
  if (!rl.allowed) {
    return NextResponse.json({ ok: false, message: "Demasiados intentos. Intenta de nuevo más tarde." }, { status: 429 });
  }

  try {
    const json = await req.json();
    const parsed = doctorLoginSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Datos inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const mac =
      parsed.data.mac ??
      cookieStore.get("portal_mac")?.value ??
      "00:00:00:00:00:00";
    const ip = cookieStore.get("portal_ip")?.value ?? null;

    // 1. Validate doctor voucher (no session created yet)
    const loginResult = await doctorLogin({ voucherCode: parsed.data.voucherCode, mac });
    if (!loginResult.ok) {
      await logAccess({ event: "AUTH_FAIL", actor: parsed.data.voucherCode, mac, ip, ssid: "IEQ-Medicos" });
      return NextResponse.json({ ok: false, message: loginResult.message }, { status: 401 });
    }

    // 2. Evaluate policies BEFORE creating session
    const policy = await evaluatePolicy({ mac, actor: parsed.data.voucherCode, tipo: "MEDICO", ssid: "IEQ-Medicos" });
    if (policy.blocked) {
      return NextResponse.json({ ok: false, message: "Acceso bloqueado por política de seguridad." }, { status: 403 });
    }

    // 3. Sin authorizeClient() (API Ruijie Cloud): la autorización la hace el
    // gateway local vía WiFiDog, no la nube. Evita la doble autorización.

    // 4. La sesión la crea/cierra el accounting de RADIUS, no el login.

    await logAccess({
      event: "AUTH_SUCCESS",
      actor: parsed.data.voucherCode,
      mac,
      ip,
      ssid: "IEQ-Medicos",
      detail: `doctor:${loginResult.doctorId}`,
    });

    // WiFiDog: el cliente debe volver al gateway para que abra el acceso
    const gwAddress = cookieStore.get("portal_gw_address")?.value;
    const gwPort = cookieStore.get("portal_gw_port")?.value;
    const gatewayAuthUrl =
      gwAddress && gwPort
        ? `http://${gwAddress}:${gwPort}/wifidog/auth?token=${encodeURIComponent(parsed.data.voucherCode)}`
        : null;

    return NextResponse.json({
      ok: true,
      message: "Acceso médico concedido",
      data: {
        nombre: loginResult.nombre,
        especialidad: loginResult.especialidad,
        expireAt: null,
        redirectUrl: "/login/medicos?success=1",
        gatewayAuthUrl,
      },
    });
  } catch (error) {
    console.error("POST /api/auth/doctor", error);
    return NextResponse.json({ ok: false, message: "Error interno del servidor" }, { status: 500 });
  }
}
