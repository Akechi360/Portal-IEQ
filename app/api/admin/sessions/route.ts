// app/api/admin/sessions/route.ts
// GET — Consultar sesiones activas de red registradas en la base de datos (PostgreSQL).

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/jwt";

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

      // Calcular duración
      let duration = "—";
      if (s.startedAt) {
        const diff = Date.now() - new Date(s.startedAt).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) {
          duration = `${mins}m`;
        } else {
          const hrs = Math.floor(mins / 60);
          const rm = mins % 60;
          duration = `${hrs}h ${rm}m`;
        }
      }

      return {
        id: s.id,
        name,
        ip: s.ip || "—",
        mac: s.mac,
        ssid: s.ssid || "—",
        duration,
        download: s.dataDownMB ?? null,
        upload: s.dataUpMB ?? null,
        status: s.endedAt ? "Desconectado" : "Activo",
        tipo,
      };
    });

    return NextResponse.json({ ok: true, sessions: formattedSessions });
  } catch (error) {
    console.error("GET /api/admin/sessions error:", error);
    return NextResponse.json({ ok: false, message: "Error interno al obtener sesiones." }, { status: 500 });
  }
}
