// app/api/ruijie/authorize/route.ts
// GET — Punto de entrada del portal cautivo Ruijie.
// Recibe parámetros del gateway, valida credencial (guest/doctor), autoriza en gateway.
// Reescrito para schema clínico: usa guestLogin(), doctorLogin(), authorizeClient(), logAccess().
// Modo offline: validación mock + autorización mock.
// TODO Fase 3: eliminar mocks y conectar a DB real.

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { LogEvent } from "@prisma/client";
import { guestLogin, doctorLogin } from "@/lib/access";
import { authorizeClient, buildRuijieSuccessRedirect, buildRuijieDenyRedirect } from "@/lib/ruijie";
import { logAccess } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams;

    // ── Parámetros del gateway Ruijie ──
    const voucherCode = query.get("voucher") ?? query.get("username") ?? query.get("user") ?? "";
    const clientMac = query.get("client_mac") ?? query.get("mac") ?? query.get("macaddr") ?? "";
    const clientIp = query.get("client_ip") ?? query.get("ip") ?? query.get("uip") ?? null;
    const ssid = query.get("ssid") ?? query.get("wlan") ?? "IEQ-Guest";
    const redirect = query.get("redirect") ?? query.get("url") ?? query.get("dst") ?? "/";

    // Guardar MAC/IP en cookies para el flujo de login
    const cookieStore = await cookies();
    if (clientMac) {
      cookieStore.set("portal_mac", clientMac, { httpOnly: true, secure: false, sameSite: "lax", maxAge: 300 });
    }
    if (clientIp) {
      cookieStore.set("portal_ip", clientIp, { httpOnly: true, secure: false, sameSite: "lax", maxAge: 300 });
    }
    if (ssid) {
      cookieStore.set("portal_ssid", ssid, { httpOnly: true, secure: false, sameSite: "lax", maxAge: 300 });
    }

    // Si no hay voucher, redirigir al portal de login intermedio
    if (!voucherCode) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", redirect);
      loginUrl.searchParams.set("mac", clientMac);
      loginUrl.searchParams.set("ssid", ssid);
      return NextResponse.redirect(loginUrl.toString(), { status: 302 });
    }

    // ── Validar credencial (modo offline) ──
    // Intentar como guest (PACIENTE/TRANSITO) primero, luego como doctor
    const guestResult = await guestLogin({ voucherCode, mac: clientMac });
    let isAuthorized = false;
    let actorName = "";
    let groupId = "grp-guest";

    if (guestResult.ok) {
      isAuthorized = true;
      actorName = guestResult.nombre;
      groupId = "grp-guest";
    } else {
      const doctorResult = await doctorLogin({ voucherCode, mac: clientMac });
      if (doctorResult.ok) {
        isAuthorized = true;
        actorName = doctorResult.nombre;
        groupId = "grp-medicos";
      }
    }

    // ── Autorizar en gateway Ruijie ──
    if (isAuthorized) {
      await authorizeClient({ mac: clientMac, username: voucherCode, groupId });

      await logAccess({
        event: LogEvent.AUTH_SUCCESS,
        actor: voucherCode,
        mac: clientMac,
        ip: clientIp,
        ssid,
        detail: `ruijie_authorize:${groupId}`,
      });

      const successUrl = buildRuijieSuccessRedirect(redirect);
      return NextResponse.redirect(successUrl, { status: 302 });
    }

    // ── Acceso denegado ──
    await logAccess({
      event: LogEvent.AUTH_FAIL,
      actor: voucherCode,
      mac: clientMac,
      ip: clientIp,
      ssid,
      detail: "ruijie_authorize:denied",
    });

    const denyUrl = buildRuijieDenyRedirect(redirect, "invalid_voucher");
    return NextResponse.redirect(denyUrl, { status: 302 });

  } catch (error) {
    console.error("GET /api/ruijie/authorize", error);
    return NextResponse.json({ ok: false, message: "Error interno" }, { status: 500 });
  }
}
