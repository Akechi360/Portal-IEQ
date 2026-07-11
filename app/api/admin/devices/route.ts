// app/api/admin/devices/route.ts
// GET — Clientes conectados desde el accounting de RADIUS (sesiones abiertas),
// y los Access Points reales desde Ruijie Cloud (inventario de equipos).

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/jwt";
import { getDevices } from "@/lib/ruijie";
import { db } from "@/lib/db";
import { activeSessionWhere } from "@/lib/session-activity";

const MB = 1_048_576;

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  try {
    const [openSessions, aps] = await Promise.all([
      db.session.findMany({
        where: activeSessionWhere(),
        orderBy: { startedAt: "desc" },
        include: { credential: true, doctor: true, staffUser: true },
      }),
      getDevices().catch((e) => {
        console.warn("[devices] No se pudo obtener APs de Ruijie:", e);
        return [] as Awaited<ReturnType<typeof getDevices>>;
      }),
    ]);

    const toBytes = (mb: number | null | undefined) => Math.round((mb ?? 0) * MB);

    const clients = openSessions.map((s) => ({
      mac: s.mac,
      ip: s.ip ?? "—",
      username:
        s.credential?.nombre ||
        s.doctor?.nombre ||
        s.staffUser?.nombre ||
        s.staffUser?.email ||
        "Invitado",
      ssid: s.ssid ?? "—",
      connectedAt: s.startedAt,
      durationSeconds: s.startedAt
        ? Math.floor((Date.now() - new Date(s.startedAt).getTime()) / 1000)
        : 0,
      bytesDown: toBytes(s.dataDownMB),
      bytesUp: toBytes(s.dataUpMB),
      status: "Activo" as const,
    }));

    const totalDown = clients.reduce((a, c) => a + c.bytesDown, 0);
    const totalUp = clients.reduce((a, c) => a + c.bytesUp, 0);

    return NextResponse.json({
      ok: true,
      clients,
      aps: aps.map((ap) => ({
        mac: ap.mac,
        ip: ap.ip,
        ssid: ap.ssid,
        name: ap.name,
        model: ap.model,
        connectedAt: ap.connectedAt,
        bytesDown: ap.bytesDown,
        bytesUp: ap.bytesUp,
      })),
      kpis: {
        totalClients: clients.length,
        activeClients: clients.length,
        totalAps: aps.length,
        totalDownBytes: totalDown,
        totalUpBytes: totalUp,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/devices error:", error);
    return NextResponse.json({ ok: false, message: "Error al obtener dispositivos." }, { status: 500 });
  }
}
