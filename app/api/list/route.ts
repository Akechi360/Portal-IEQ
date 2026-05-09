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
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
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
  } catch (error) {
    console.error("GET /api/list", error);
    return NextResponse.json({ ok: false, message: "Error interno" }, { status: 500 });
  }
}
