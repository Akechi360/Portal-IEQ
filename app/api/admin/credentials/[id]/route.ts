import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireInternal } from "@/lib/jwt";
import { logAccess } from "@/lib/audit";

// ─── PATCH — Revocar credencial ───────────────────────────────────────────────

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireInternal(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;

  try {
    const credential = await db.credential.update({
      where: { id },
      data: { status: "EXPIRED", expireAt: new Date() },
    });

    await logAccess({
      event: "DISCONNECTED",
      actor: auth.username,
      detail: `credential:${credential.voucherCode}:revoked`,
    });

    return NextResponse.json({ ok: true, message: "Credencial revocada", data: credential });
  } catch (error) {
    console.error("PATCH /api/admin/credentials/[id]", error);
    return NextResponse.json({ ok: false, message: "Credencial no encontrada o error interno" }, { status: 404 });
  }
}
