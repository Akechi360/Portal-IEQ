// app/api/list/route.ts
// GET — Lista credenciales WiFi activas (PACIENTE / TRANSITO) y médicos.
// Reescrito para schema clínico: Credential, Doctor, Session.
// Modo offline: retorna mock data alineada al nuevo schema.
// TODO Fase 3: conectar consultas reales a db.credential + db.doctor.

import { NextResponse } from "next/server";
import { CredentialStatus, DoctorStatus } from "@prisma/client";
import { db } from "@/lib/db";

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
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type"); // "PACIENTE" | "TRANSITO" | "MEDICO" | null
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search")?.trim().toLowerCase();
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "20");

    // ── MOCK OFFLINE — Datos simulados alineados al schema clínico ──
    // TODO Fase 3: reemplazar con consultas a db.credential.findMany() y db.doctor.findMany()

    const mockCredentials: ListItem[] = [
      {
        id: "cred-mock-001",
        name: "Juan Pérez",
        type: "PACIENTE",
        identifier: "IEQ-DEMO-PAC1",
        room: "H-204",
        status: "Active",
        devicesCount: 2,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "cred-mock-002",
        name: "María García",
        type: "TRANSITO",
        identifier: "IEQ-DEMO-TRN1",
        room: "Caja",
        status: "Active",
        devicesCount: 1,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];

    const mockDoctors: ListItem[] = [
      {
        id: "doctor-mock-001",
        name: "Dr. Jaime Ramírez",
        type: "MEDICO",
        identifier: "j.ramirez@ieq.med",
        room: null,
        status: "Active",
        devicesCount: 2,
        expiresAt: null, // Médicos: acceso permanente
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "doctor-mock-002",
        name: "Dra. Elena Vargas",
        type: "MEDICO",
        identifier: "e.vargas@ieq.med",
        room: null,
        status: "Active",
        devicesCount: 1,
        expiresAt: null,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    let items: ListItem[] = [...mockCredentials, ...mockDoctors];

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
      offline: true,
    });
  } catch (error) {
    console.error("GET /api/list", error);
    return NextResponse.json({ ok: false, message: "Error interno" }, { status: 500 });
  }
}
