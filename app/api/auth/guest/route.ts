import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { guestLoginSchema } from "@/lib/validators";
import { guestLogin } from "@/lib/access";
import { evaluatePolicy } from "@/lib/policy";
import { authorizeClient } from "@/lib/ruijie";
import { logAccess } from "@/lib/audit";
import { getSystemConfig } from "@/lib/config";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = checkRateLimit(`guest-login:${clientIp}`);
  if (!rl.allowed) {
    return NextResponse.json({ ok: false, message: "Demasiados intentos. Intenta de nuevo más tarde." }, { status: 429 });
  }

  try {
    const json = await req.json();
    const parsed = guestLoginSchema.safeParse(json);

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
    // El gateway manda el nombre de VLAN (p.ej. VLAN233) — mapear al SSID real
    const rawSsid = cookieStore.get("portal_ssid")?.value;
    const ssid =
      rawSsid && !/^vlan/i.test(rawSsid) ? rawSsid : "WiFi Clinica IEQ Los Mangos";

    // 1. Validate voucher (no session created yet)
    const loginResult = await guestLogin({ voucherCode: parsed.data.voucherCode, mac });
    if (!loginResult.ok) {
      await logAccess({ event: "AUTH_FAIL", actor: parsed.data.voucherCode, mac, ip, ssid: ssid });
      return NextResponse.json({ ok: false, message: loginResult.message }, { status: 401 });
    }

    // 2. Evaluate policies BEFORE creating session
    const policy = await evaluatePolicy({ mac, actor: parsed.data.voucherCode, tipo: loginResult.tipo, ssid: ssid });
    if (policy.blocked) {
      return NextResponse.json({ ok: false, message: "Acceso bloqueado por política de seguridad." }, { status: 403 });
    }

    // 3. NO llamamos a authorizeClient() (API Ruijie Cloud). En el flujo
    // WiFiDog externo, quien abre el acceso es el GATEWAY local validando el
    // token contra nuestro /auth/wifidogAuth/auth. Llamar además a la nube
    // crea una doble autorización que confunde al gateway.

    // 4. La sesión ya NO se crea aquí: el accounting de RADIUS es el dueño
    // del ciclo de vida (Start la crea, Stop la cierra con endedAt + tráfico).
    // Crearla aquí generaba una sesión "fantasma" que nunca cerraba.

    await logAccess({
      event: "AUTH_SUCCESS",
      actor: parsed.data.voucherCode,
      mac,
      ip,
      ssid: ssid,
      detail: `credential:${loginResult.credentialId}`,
    });

    // WiFiDog: el cliente debe volver al gateway para que este abra el acceso.
    // El gateway valida el token llamando a nuestro /wifidog/auth (Auth: 1).
    const gwAddress = cookieStore.get("portal_gw_address")?.value;
    const gwPort = cookieStore.get("portal_gw_port")?.value;
    const gatewayAuthUrl =
      gwAddress && gwPort
        ? `http://${gwAddress}:${gwPort}/wifidog/auth?token=${encodeURIComponent(parsed.data.voucherCode)}`
        : null;

    return NextResponse.json({
      ok: true,
      message: "Acceso concedido",
      data: {
        nombre: loginResult.nombre,
        tipo: loginResult.tipo,
        expireAt: loginResult.expireAt,
        redirectUrl: "/login/guest?success=1",
        gatewayAuthUrl,
      },
    });
  } catch (error) {
    console.error("POST /api/auth/guest", error);
    return NextResponse.json({ ok: false, message: "Error interno del servidor" }, { status: 500 });
  }
}
