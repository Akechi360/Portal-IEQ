// app/api/auth/guest/route.ts
// POST — Autenticación de invitados (pacientes / tránsito) mediante voucher code.
// Modo offline: valida input con Zod, responde sesión mock.
// TODO Fase 3: conectar guestLogin() a DB real y llamar a authorizeClient() del gateway.

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { guestLoginSchema } from "@/lib/validators";
import { guestLogin } from "@/lib/access";
import { evaluatePolicy } from "@/lib/policy";
import { authorizeClient } from "@/lib/ruijie";
import { logAccess } from "@/lib/audit";
import { getSystemConfig } from "@/lib/config";

export async function POST(req: Request) {
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

    // 1. Validar voucher (mock offline)
    const loginResult = await guestLogin({ voucherCode: parsed.data.voucherCode, mac });
    if (!loginResult.ok) {
      await logAccess({ event: "AUTH_FAIL", actor: parsed.data.voucherCode, mac, ip, ssid: "IEQ-Guest" });
      return NextResponse.json({ ok: false, message: loginResult.message }, { status: 401 });
    }

    // 2. Evaluar políticas (offline: sin bloqueos)
    const policy = await evaluatePolicy({ mac, actor: parsed.data.voucherCode, tipo: loginResult.tipo, ssid: "IEQ-Guest" });
    if (policy.blocked) {
      return NextResponse.json({ ok: false, message: "Acceso bloqueado por política de seguridad." }, { status: 403 });
    }

    // 3. Autorizar MAC en gateway Ruijie
    const ruijieGroupGuest = await getSystemConfig("ruijie_group_guest") || "grp-guest";
    await authorizeClient({ mac, username: parsed.data.voucherCode, groupId: ruijieGroupGuest });

    await logAccess({
      event: "AUTH_SUCCESS",
      actor: parsed.data.voucherCode,
      mac,
      ip,
      ssid: "IEQ-Guest",
      detail: `credential:${loginResult.credentialId}`,
    });

    return NextResponse.json({
      ok: true,
      message: "Acceso concedido",
      data: {
        nombre: loginResult.nombre,
        tipo: loginResult.tipo,
        expireAt: loginResult.expireAt,
        // TODO Fase 3: incluir redirectUrl del gateway real
        redirectUrl: "/login/guest?success=1",
      },
    });
  } catch (error) {
    console.error("POST /api/auth/guest", error);
    return NextResponse.json({ ok: false, message: "Error interno del servidor" }, { status: 500 });
  }
}
