// app/api/admin/traffic/route.ts
// GET — Tráfico de las sesiones ACTIVAS (RADIUS accounting), desde la DB.

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/jwt";
import { db } from "@/lib/db";
import { activeSessionWhere } from "@/lib/session-activity";

const MB = 1_048_576;

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  try {
    const openSessions = await db.session.findMany({
      where: activeSessionWhere(),
      include: { credential: true, doctor: true, staffUser: true },
    });

    const toBytes = (mb: number | null | undefined) => Math.round((mb ?? 0) * MB);

    const totalDownBytes = openSessions.reduce((a, s) => a + toBytes(s.dataDownMB), 0);
    const totalUpBytes = openSessions.reduce((a, s) => a + toBytes(s.dataUpMB), 0);

    const topUsers = [...openSessions]
      .sort(
        (a, b) =>
          (b.dataDownMB ?? 0) + (b.dataUpMB ?? 0) - ((a.dataDownMB ?? 0) + (a.dataUpMB ?? 0))
      )
      .slice(0, 10)
      .map((s) => ({
        username:
          s.credential?.nombre ||
          s.doctor?.nombre ||
          s.staffUser?.nombre ||
          s.staffUser?.email ||
          "Invitado",
        mac: s.mac,
        ip: s.ip ?? "—",
        ssid: s.ssid ?? "—",
        bytesDown: toBytes(s.dataDownMB),
        bytesUp: toBytes(s.dataUpMB),
        totalBytes: toBytes(s.dataDownMB) + toBytes(s.dataUpMB),
      }));

    return NextResponse.json({
      ok: true,
      activeClients: openSessions.length,
      totalDownBytes,
      totalUpBytes,
      totalBytes: totalDownBytes + totalUpBytes,
      topUsers,
    });
  } catch (error) {
    console.error("GET /api/admin/traffic error:", error);
    return NextResponse.json({ ok: false, message: "Error al obtener tráfico." }, { status: 500 });
  }
}
