import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/jwt";

export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ ok: false, message: "sessionId requerido." }, { status: 400 });
    }

    const session = await db.session.findUnique({
      where: { id: sessionId },
      include: { credential: true },
    });

    if (!session) {
      return NextResponse.json({ ok: false, message: "Sesión no encontrada." }, { status: 404 });
    }

    await db.session.update({
      where: { id: sessionId },
      data: { endedAt: new Date() },
    });

    if (session.credentialId) {
      await db.credential.update({
        where: { id: session.credentialId },
        data: { status: "BLOCKED" as const },
      });
    }

    await db.accessLog.create({
      data: {
        event: "BLOCKED",
        actor: (auth as any).email || "admin",
        mac: session.mac || null,
        ip: session.ip || null,
        ssid: session.ssid || null,
        detail: `Sesión ${sessionId} terminada y credencial bloqueada por administrador`,
      },
    });

    return NextResponse.json({ ok: true, message: "Sesión cerrada y credencial bloqueada." });
  } catch (error) {
    console.error("POST /api/admin/sessions/kick error:", error);
    return NextResponse.json({ ok: false, message: "Error al cerrar sesión." }, { status: 500 });
  }
}
