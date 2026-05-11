// app/api/auth/doctor/route.ts
// POST — Autenticación de médicos mediante voucher permanente.
// Modo offline: valida input con Zod, responde sesión mock.
// TODO Fase 3: conectar doctorLogin() a DB real + authorizeClient() con grupo médicos.

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { doctorLoginSchema } from "@/lib/validators";
import { doctorLogin } from "@/lib/access";
import { authorizeClient } from "@/lib/ruijie";
import { logAccess } from "@/lib/audit";

export async function POST(req: Request) {
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

    // 1. Validar voucher médico (mock offline)
    const loginResult = await doctorLogin({ voucherCode: parsed.data.voucherCode, mac });
    if (!loginResult.ok) {
      await logAccess({ event: "AUTH_FAIL", actor: parsed.data.voucherCode, mac, ip, ssid: "IEQ-Medicos" });
      return NextResponse.json({ ok: false, message: loginResult.message }, { status: 401 });
    }

    // 2. Autorizar MAC en gateway con grupo médicos (offline: mock)
    // TODO Fase 3: usar groupId real desde getSystemConfig("ruijie_group_medicos")
    await authorizeClient({ mac, username: parsed.data.voucherCode, groupId: "grp-medicos" });

    await logAccess({
      event: "AUTH_SUCCESS",
      actor: parsed.data.voucherCode,
      mac,
      ip,
      ssid: "IEQ-Medicos",
      detail: `doctor:${loginResult.doctorId}`,
    });

    return NextResponse.json({
      ok: true,
      message: "Acceso médico concedido",
      data: {
        nombre: loginResult.nombre,
        especialidad: loginResult.especialidad,
        // Médicos tienen acceso permanente — sin expireAt
        expireAt: null,
        redirectUrl: "/login/medicos?success=1",
      },
    });
  } catch (error) {
    console.error("POST /api/auth/doctor", error);
    return NextResponse.json({ ok: false, message: "Error interno del servidor" }, { status: 500 });
  }
}
