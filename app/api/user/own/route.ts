<<<<<<< HEAD
﻿import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { ok: false, message: "Legacy endpoint" },
    { status: 410 }
  );
}

=======
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function formatTimeLeft(endsAt: Date | null, isPermanent: boolean) {
  if (isPermanent || !endsAt) {
    return { status: "permanente", timeLeft: "Permanente" };
  }

  const diffMs = endsAt.getTime() - Date.now();
  if (diffMs <= 0) {
    return { status: "expirado", timeLeft: "0m" };
  }

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return { status: "activo", timeLeft: `${hours}h ${rem}m` };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    if (!username) {
      return NextResponse.json({ ok: false, message: "username es requerido" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { username },
      include: {
        grants: { orderBy: { createdAt: "desc" }, take: 1 },
        devices: { orderBy: { lastSeen: "desc" } }
      }
    });

    if (!user) {
      return NextResponse.json({ ok: false, message: "Usuario no encontrado" }, { status: 404 });
    }

    const grant = user.grants[0] ?? null;
    const sessionInfo = formatTimeLeft(grant?.endsAt ?? null, grant?.isPermanent ?? user.isPermanent);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        expiresAt: grant?.endsAt ?? null
      },
      devices: user.devices.map((device) => ({
        id: device.id,
        mac: device.mac,
        label: device.label,
        firstSeen: device.firstSeen,
        lastSeen: device.lastSeen
      })),
      sessionInfo
    });
  } catch (error) {
    console.error("GET /api/user/own", error);
    return NextResponse.json({ ok: false, message: "Error interno" }, { status: 500 });
  }
}
>>>>>>> 53f8a2c92a064c1299ac43fdff28034dd65a9b27
