// app/api/admin/sessions/route.ts
// GET — Sesiones desde el accounting de RADIUS (tabla Session). El estado,
// el tráfico y el tiempo son la fuente de verdad del gateway; ya no
// dependemos de Ruijie Cloud (que no ve a los clientes autenticados por RADIUS).

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/jwt";
import { isSessionActive } from "@/lib/session-activity";

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

      const active = isSessionActive(s);

      // Duración: hasta endedAt (si cerró), hasta ahora (si sigue activa), o
      // hasta el último accounting visto (si quedó stale por un Stop perdido).
      let duration = "—";
      if (s.startedAt) {
        const endMs = s.endedAt
          ? new Date(s.endedAt).getTime()
          : active
          ? Date.now()
          : s.lastSeenAt
          ? new Date(s.lastSeenAt).getTime()
          : new Date(s.startedAt).getTime();
        const mins = Math.max(0, Math.floor((endMs - new Date(s.startedAt).getTime()) / 60000));
        duration = mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
      }

      return {
        id: s.id,
        name,
        ip: s.ip || "—",
        mac: s.mac,
        ssid: s.ssid || "—",
        signal: 0, // RADIUS no reporta RSSI
        duration,
        download: s.dataDownMB ?? 0,
        upload: s.dataUpMB ?? 0,
        // Activa solo si no cerró Y recibió accounting reciente (no stale).
        status: active ? "Activo" : "Desconectado",
        tipo,
      };
    });

    return NextResponse.json({ ok: true, sessions: formattedSessions });
  } catch (error) {
    console.error("GET /api/admin/sessions error:", error);
    return NextResponse.json({ ok: false, message: "Error interno al obtener sesiones." }, { status: 500 });
  }
}
