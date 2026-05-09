import { AuditAction } from "@prisma/client";
import { NextResponse } from "next/server";
import { executeLogin } from "@/lib/access";
import { authorizeWithRuijieGateway } from "@/lib/ruijie";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams;

    const username = query.get("username") ?? query.get("user") ?? "";
    const passwordOrToken = query.get("password") ?? query.get("token") ?? "";
    const clientMac = query.get("client_mac") ?? query.get("mac") ?? "";
    const apMac = query.get("ap_mac") ?? query.get("gateway_mac") ?? "unknown";
    const ssid = query.get("ssid") ?? "unknown";
    const redirect = query.get("redirect") ?? query.get("url") ?? "/";

    if (!username || !clientMac || !redirect) {
      return NextResponse.json({ ok: false, message: "Parametros incompletos para autorizacion" }, { status: 400 });
    }

    const loginResult = await executeLogin({ username, passwordOrToken, clientMac, apMac, ssid });
    const ruijieResult = await authorizeWithRuijieGateway({
      approved: loginResult.ok,
      reason: loginResult.ok ? undefined : loginResult.message,
      redirect,
      query
    });

    await logAudit({
      action: AuditAction.RUIJIE_AUTHORIZE,
      actorUsername: username,
      metadata: {
        approved: ruijieResult.allow,
        protocol: ruijieResult.protocol,
        redirect: ruijieResult.redirectUrl,
        clientMac
      }
    });

    return NextResponse.redirect(ruijieResult.redirectUrl, { status: 302 });
  } catch (error) {
    console.error("GET /api/ruijie/authorize", error);
    return NextResponse.json({ ok: false, message: "Error interno" }, { status: 500 });
  }
}
