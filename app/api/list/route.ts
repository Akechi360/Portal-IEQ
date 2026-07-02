// app/api/list/route.ts
// GET — Lista credenciales WiFi activas (PACIENTE / TRANSITO) y médicos.
// Reescrito para schema clínico: Credential, Doctor, Session.
// Modo offline: retorna mock data alineada al nuevo schema.
// TODO Fase 3: conectar consultas reales a db.credential + db.doctor.

import { NextResponse } from "next/server";
import { CredentialStatus, DoctorStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireInternal } from "@/lib/jwt";

type ListItemType = "PACIENTE" | "TRANSITO" | "MEDICO";

interface ListItem {
  id: string;
  name: string;
  type: ListItemType;
  identifier: string; // voucherCode o email
  room?: string | null;
  status: string;
  devicesCount: number;
  expiresAt: string | null;
  createdAt: string;
}

function mapCredentialStatus(status: CredentialStatus, expireAt: Date | null): string {
  if (status === "BLOCKED") return "Blocked";
  if (status === "EXPIRED") return "Expired";
  if (expireAt && expireAt.getTime() < Date.now()) return "Expired";
  return "Active";
}

function mapDoctorStatus(status: DoctorStatus): string {
  if (status === "INACTIVE") return "Blocked";
  if (status === "PENDING") return "Pending";
  return "Active";
}

export async function GET(req: Request) {
  const auth = await requireInternal(req);
  if (auth instanceof Response) return auth;

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type"); // "PACIENTE" | "TRANSITO" | "MEDICO" | null
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search")?.trim().toLowerCase();
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "20");

    let items: ListItem[] = [];

    const includeDoctors = !type || type === "MEDICO";
    const includeCredentials = !type || type === "PACIENTE" || type === "TRANSITO";

    if (includeCredentials) {
      const credentials = await db.credential.findMany({
        where: type && type !== "MEDICO" ? { tipo: type as "PACIENTE" | "TRANSITO" } : undefined,
        include: { _count: { select: { sessions: true } } },
        orderBy: { createdAt: "desc" },
      });
      items.push(
        ...credentials.map((c) => ({
          id: c.id,
          name: c.nombre,
          type: c.tipo as ListItemType,
          identifier: c.voucherCode,
          room: c.habitacion,
          status: mapCredentialStatus(c.status, c.expireAt),
          devicesCount: c._count.sessions,
          expiresAt: c.expireAt?.toISOString() || null,
          createdAt: c.createdAt.toISOString(),
        }))
      );
    }

    if (includeDoctors) {
      const doctors = await db.doctor.findMany({
        include: { _count: { select: { sessions: true } } },
        orderBy: { createdAt: "desc" },
      });
      items.push(
        ...doctors.map((d) => ({
          id: d.id,
          name: d.nombre,
          type: "MEDICO" as ListItemType,
          identifier: d.email,
          room: d.especialidad,
          status: mapDoctorStatus(d.status),
          devicesCount: d._count.sessions,
          expiresAt: null,
          createdAt: d.createdAt.toISOString(),
        }))
      );
    }

    // ── Filtros ──
    if (type && ["PACIENTE", "TRANSITO", "MEDICO"].includes(type)) {
      items = items.filter((i) => i.type === type);
    }

    if (search) {
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(search) ||
          i.identifier.toLowerCase().includes(search) ||
          (i.room && i.room.toLowerCase().includes(search))
      );
    }

    if (status && status !== "All") {
      items = items.filter((i) => i.status === status);
    }

    // ── Paginación ──
    const total = items.length;
    const skip = (Math.max(page, 1) - 1) * Math.max(limit, 1);
    const paginated = items.slice(skip, skip + Math.max(limit, 1));

    return NextResponse.json({
      ok: true,
      items: paginated,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("GET /api/list", error);
    return NextResponse.json({ ok: false, message: "Error interno" }, { status: 500 });
  }
}
