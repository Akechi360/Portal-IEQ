// app/api/auth/doctor/route.ts
// POST — Autenticación de médicos mediante voucher permanente.
// Conectado a db real y políticas en Fase 3.

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { doctorLoginSchema } from "@/lib/validators";
import { doctorLogin } from "@/lib/access";
import { authorizeClient } from "@/lib/ruijie";
import { logAccess } from "@/lib/audit";
import { evaluatePolicy } from "@/lib/policy";
import { getSystemConfig } from "@/lib/config";

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

    // 1. Validar voucher médico
    const loginResult = await doctorLogin({ voucherCode: parsed.data.voucherCode, mac });
    if (!loginResult.ok) {
      await logAccess({ event: "AUTH_FAIL", actor: parsed.data.voucherCode, mac, ip, ssid: "IEQ-Medicos" });
      return NextResponse.json({ ok: false, message: loginResult.message }, { status: 401 });
    }

    // 2. Evaluar políticas de seguridad
    const policy = await evaluatePolicy({ mac, actor: parsed.data.voucherCode, tipo: "MEDICO", ssid: "IEQ-Medicos" });
    if (policy.blocked) {
      return NextResponse.json({ ok: false, message: "Acceso bloqueado por política de seguridad." }, { status: 403 });
    }

    // 3. Autorizar MAC en gateway con grupo médicos obtenido de configuración
    const ruijieGroupMedicos = await getSystemConfig("ruijie_group_medicos") || "grp-medicos";
    await authorizeClient({ mac, username: parsed.data.voucherCode, groupId: ruijieGroupMedicos });

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

