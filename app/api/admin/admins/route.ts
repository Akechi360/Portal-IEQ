import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/jwt";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  try {
    const admins = await db.admin.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        email: true,
        nombre: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    const formatted = admins.map((a) => {
      let lastAccess = "Nunca";
      if (a.lastLoginAt) {
        const diff = Date.now() - new Date(a.lastLoginAt).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) lastAccess = `Hace ${mins}m`;
        else if (mins < 1440) lastAccess = `Hace ${Math.floor(mins / 60)}h`;
        else lastAccess = `Hace ${Math.floor(mins / 1440)}d`;
      }

      return {
        id: a.id,
        nombre: a.nombre || a.email.split("@")[0],
        email: a.email,
        role: a.role,
        lastAccess,
        createdAt: a.createdAt,
      };
    });

    return NextResponse.json({ ok: true, admins: formatted });
  } catch (error) {
    console.error("GET /api/admin/admins error:", error);
    return NextResponse.json({ ok: false, message: "Error al obtener administradores." }, { status: 500 });
  }
}
