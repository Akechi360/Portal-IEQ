// app/api/cron/purge/route.ts
// Mantenimiento automático (llamado por un Coolify Scheduled Task):
//  1. Cierra sesiones "stale" (Stop perdido) marcándoles endedAt.
//  2. Borra sesiones cerradas más viejas que la retención.
//  3. Borra vouchers expirados (cascade borra sus DeviceBinding).
//
// Protegido por CRON_SECRET (header Authorization: Bearer <secret> o ?secret=).

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { staleCutoff } from "@/lib/session-activity";

const CLOSED_SESSION_RETENTION_DAYS = 7; // sesiones cerradas más viejas se borran
const EXPIRED_CRED_GRACE_HOURS = 24; // vouchers expirados hace más de esto se borran

async function handle(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, message: "CRON_SECRET no configurado" }, { status: 500 });
  }

  const url = new URL(req.url);
  const provided =
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    url.searchParams.get("secret") ||
    "";
  if (provided !== secret) {
    return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });
  }

  try {
    const now = new Date();
    const cutoff = staleCutoff();

    // 1) Cerrar sesiones stale (sin accounting reciente y aún abiertas).
    const { count: closedStale } = await db.session.updateMany({
      where: {
        endedAt: null,
        OR: [
          { lastSeenAt: { lt: cutoff } },
          { lastSeenAt: null, startedAt: { lt: cutoff } },
        ],
      },
      data: { endedAt: now },
    });

    // 2) Borrar sesiones cerradas viejas.
    const closedCutoff = new Date(now.getTime() - CLOSED_SESSION_RETENTION_DAYS * 86_400_000);
    const { count: deletedSessions } = await db.session.deleteMany({
      where: { endedAt: { lt: closedCutoff } },
    });

    // 3) Borrar vouchers expirados (cascade -> DeviceBinding).
    const credCutoff = new Date(now.getTime() - EXPIRED_CRED_GRACE_HOURS * 3_600_000);
    const { count: deletedCredentials } = await db.credential.deleteMany({
      where: { expireAt: { lt: credCutoff } },
    });

    const result = { ok: true, closedStale, deletedSessions, deletedCredentials, at: now.toISOString() };
    console.log("[cron/purge]", JSON.stringify(result));
    return NextResponse.json(result);
  } catch (error) {
    console.error("[cron/purge] error:", error);
    return NextResponse.json({ ok: false, message: "Error en la purga" }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
