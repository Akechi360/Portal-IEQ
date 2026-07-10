import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/jwt";
import { getSessions, getDevices } from "@/lib/ruijie";

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  try {
    const [sessions, aps] = await Promise.all([getSessions(), getDevices()]);

    const totalDown = sessions.reduce((s, c) => s + c.bytesDown, 0);
    const totalUp = sessions.reduce((s, c) => s + c.bytesUp, 0);

    const clients = sessions.map((s) => ({
      mac: s.mac,
      ip: s.ip,
      username: s.username,
      ssid: s.ssid,
      apMac: s.apMac,
      connectedAt: s.startedAt,
      durationSeconds: s.durationSeconds,
      bytesDown: s.bytesDown,
      bytesUp: s.bytesUp,
      status: "Activo" as const,
    }));

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
    return NextResponse.json({ ok: false, message: "Error al obtener dispositivos de Ruijie." }, { status: 500 });
  }
}
