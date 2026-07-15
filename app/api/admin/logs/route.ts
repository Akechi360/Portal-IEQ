// app/api/admin/logs/route.ts
// GET — Consultar logs reales de auditoría (AccessLog) desde PostgreSQL.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LogEvent } from "@prisma/client";
import { requireAdmin } from "@/lib/jwt";
import { humanizeDetail } from "@/lib/log-labels";

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const eventType = searchParams.get("event") || "";

    // Filtros dinámicos
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { actor: { contains: search, mode: "insensitive" } },
        { mac: { contains: search, mode: "insensitive" } },
        { detail: { contains: search, mode: "insensitive" } },
      ];
    }

    if (eventType && eventType !== "ALL") {
      whereClause.event = eventType as LogEvent;
    }

    const logs = await db.accessLog.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 150,
    });

    const totalLogs = await db.accessLog.count({
      where: whereClause,
    });

    // Mapear logs reales para el visor administrativo
    const formattedLogs = logs.map((log) => {
      let type = "Conexión";
      if (log.event === "AUTH_FAIL" || log.event === "DOCTOR_REJECTED") {
        type = "Rechazado";
      } else if (log.event === "BLOCKED" || log.event === "LIMIT_REACHED") {
        type = "Bloqueo";
      } else if (log.event === "AUTH_SUCCESS" || log.event === "DOCTOR_APPROVED") {
        type = "Éxito";
      } else if (log.event === "NEW_SESSION") {
        type = "Conexión";
      } else if (log.event === "DISCONNECTED") {
        type = "Desconexión";
      }

      // Convertir formato de hora legible (hora local de la clínica).
      const time = new Date(log.createdAt).toLocaleString("es-ES", {
        timeZone: "America/Caracas",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      return {
        id: log.id,
        type,
        user: log.actor,
        action: humanizeDetail(log.detail, log.event),
        ip: log.ip || "—",
        mac: log.mac || "—",
        ssid: log.ssid || "WiFi-ClinicaIEQ",
        time,
      };
    });

    return NextResponse.json({ ok: true, logs: formattedLogs, total: totalLogs });
  } catch (error) {
    console.error("GET /api/admin/logs error:", error);
    return NextResponse.json({ ok: false, message: "Error al obtener logs de auditoría." }, { status: 500 });
  }
}
