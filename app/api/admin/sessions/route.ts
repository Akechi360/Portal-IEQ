// app/api/admin/sessions/route.ts
// GET — Sesiones activas: DB (quién se autenticó) enriquecida con los
// clientes vivos de Ruijie Cloud (IP, SSID, señal y tráfico reales por MAC).

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/jwt";
import { getSessions as getRuijieSessions, type RuijieSession } from "@/lib/ruijie";

function rssiToBars(rssi: number | null): number {
  if (rssi === null) return 0;
  if (rssi >= -55) return 4;
  if (rssi >= -65) return 3;
  if (rssi >= -75) return 2;
  return 1;
}

const bytesToMB = (bytes: number) => Math.round((bytes / 1_048_576) * 10) / 10;

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  try {
    const sessions = await db.session.findMany({
      orderBy: { startedAt: "desc" },
      take: 100,
      include: {
        credential: true,
        doctor: true,
        staffUser: true,
      },
    });

    // Clientes vivos según Ruijie Cloud, indexados por MAC.
    let liveByMac = new Map<string, RuijieSession>();
    try {
      const live = await getRuijieSessions();
      liveByMac = new Map(live.map((c) => [c.mac.toLowerCase(), c]));
    } catch (e) {
      console.warn("[sessions] No se pudo obtener clientes vivos de Ruijie:", e);
    }

    const formattedSessions = sessions.map((s) => {
      let name = "Invitado";
      let tipo = "Desconocido";

      if (s.credential) {
        name = s.credential.nombre;
        tipo = s.credential.tipo === "PACIENTE" ? "Paciente" : "Tránsito";
      } else if (s.doctor) {
        name = s.doctor.nombre;
        tipo = "Médico";
      } else if (s.staffUser) {
        name = s.staffUser.nombre || s.staffUser.email;
        tipo = "Staff / Gerencia";
      }

      // Calcular duración (hasta endedAt si la sesión ya cerró)
      let duration = "—";
      if (s.startedAt) {
        const end = s.endedAt ? new Date(s.endedAt).getTime() : Date.now();
        const diff = end - new Date(s.startedAt).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) {
          duration = `${mins}m`;
        } else {
          const hrs = Math.floor(mins / 60);
          const rm = mins % 60;
          duration = `${hrs}h ${rm}m`;
        }
      }

      const live = liveByMac.get(s.mac.toLowerCase());

      return {
        id: s.id,
        name,
        ip: live?.ip || s.ip || "—",
        mac: s.mac,
        ssid: live?.ssid || s.ssid || "—",
        signal: rssiToBars(live?.rssi ?? null),
        duration,
        download: live ? bytesToMB(live.bytesDown) : s.dataDownMB ?? 0,
        upload: live ? bytesToMB(live.bytesUp) : s.dataUpMB ?? 0,
        // Activo solo si Ruijie lo reporta conectado ahora mismo
        status: s.endedAt ? "Desconectado" : live ? "Activo" : "Desconectado",
        tipo,
      };
    });

    return NextResponse.json({ ok: true, sessions: formattedSessions });
  } catch (error) {
    console.error("GET /api/admin/sessions error:", error);
    return NextResponse.json({ ok: false, message: "Error interno al obtener sesiones." }, { status: 500 });
  }
}
