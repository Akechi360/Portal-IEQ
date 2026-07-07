import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/jwt";
import { getSessions } from "@/lib/ruijie";

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  try {
    const sessions = await getSessions();

    const totalDownBytes = sessions.reduce((s, c) => s + c.bytesDown, 0);
    const totalUpBytes = sessions.reduce((s, c) => s + c.bytesUp, 0);

    // Top usuarios por consumo total (down + up)
    const topUsers = [...sessions]
      .sort((a, b) => (b.bytesDown + b.bytesUp) - (a.bytesDown + a.bytesUp))
      .slice(0, 10)
      .map((s) => ({
        username: s.username,
        mac: s.mac,
        ip: s.ip,
        ssid: s.ssid,
        bytesDown: s.bytesDown,
        bytesUp: s.bytesUp,
        totalBytes: s.bytesDown + s.bytesUp,
      }));

    return NextResponse.json({
      ok: true,
      activeClients: sessions.length,
      totalDownBytes,
      totalUpBytes,
      totalBytes: totalDownBytes + totalUpBytes,
      topUsers,
    });
  } catch (error) {
    console.error("GET /api/admin/traffic error:", error);
    return NextResponse.json({ ok: false, message: "Error al obtener tráfico de Ruijie." }, { status: 500 });
  }
}
