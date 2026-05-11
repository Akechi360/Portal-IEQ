<<<<<<< HEAD
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
=======
import { NextResponse } from "next/server";
import { UserRole, UserStatus } from "@prisma/client";
import { db } from "@/lib/db";

function mapStatus(userStatus: UserStatus, expiresAt: Date | null, isPermanent: boolean) {
  if (userStatus === "BLOCKED") return "Blocked";
  if (isPermanent) return "Active";
  if (!expiresAt) return "Expired";
  return expiresAt.getTime() > Date.now() ? "Active" : "Expired";
}

function mapRole(role?: string): UserRole | undefined {
  const map: Record<string, UserRole> = {
    Paciente: "PACIENTE",
    Transito: "TRANSITO",
    Medico: "MEDICO",
    Gerencia: "GERENCIA"
  };
  return role ? map[role] : undefined;
>>>>>>> 53f8a2c92a064c1299ac43fdff28034dd65a9b27
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
<<<<<<< HEAD
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
=======
    const role = url.searchParams.get("role");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search")?.trim();
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "20");
    const skip = (Math.max(page, 1) - 1) * Math.max(limit, 1);

    const roleFilter = mapRole(role ?? undefined);

    const users = await db.user.findMany({
      where: {
        ...(roleFilter ? { role: roleFilter } : {}),
        ...(search
          ? {
              OR: [{ username: { contains: search, mode: "insensitive" } }, { personName: { contains: search, mode: "insensitive" } }]
            }
          : {})
      },
      include: {
        grants: { orderBy: { createdAt: "desc" }, take: 1 },
        devices: { where: { isBlocked: false } }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: Math.max(limit, 1)
    });

    const items = users
      .map((user) => {
        const grant = user.grants[0] ?? null;
        const computed = mapStatus(user.status, grant?.endsAt ?? null, grant?.isPermanent ?? user.isPermanent);
        return {
          id: user.id,
          username: user.username,
          personName: user.personName,
          room: user.room,
          role: user.role,
          devicesCount: user.devices.length,
          expiresAt: grant?.endsAt ?? null,
          status: computed
        };
      })
      .filter((item) => (status && status !== "All" ? item.status === status : true));

    const total = await db.user.count({
      where: {
        ...(roleFilter ? { role: roleFilter } : {}),
        ...(search
          ? {
              OR: [{ username: { contains: search, mode: "insensitive" } }, { personName: { contains: search, mode: "insensitive" } }]
            }
          : {})
      }
    });

    return NextResponse.json({ ok: true, items, total, page, limit });
>>>>>>> 53f8a2c92a064c1299ac43fdff28034dd65a9b27
  } catch (error) {
    console.error("GET /api/list", error);
    return NextResponse.json({ ok: false, message: "Error interno" }, { status: 500 });
  }
}
