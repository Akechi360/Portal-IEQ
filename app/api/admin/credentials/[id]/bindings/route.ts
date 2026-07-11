import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireInternal } from "@/lib/jwt";
import { logAccess } from "@/lib/audit";

// ─── GET — Dispositivos casados a este voucher ────────────────────────────────

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireInternal(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;

  try {
    const bindings = await db.deviceBinding.findMany({
      where: { credentialId: id },
      orderBy: { boundAt: "asc" },
    });
    return NextResponse.json({ ok: true, bindings });
  } catch (error) {
    console.error("GET /api/admin/credentials/[id]/bindings", error);
    return NextResponse.json({ ok: false, message: "Error interno" }, { status: 500 });
  }
}

// ─── DELETE — Liberar el binding (permite casar un nuevo dispositivo) ──────────

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireInternal(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;

  try {
    const credential = await db.credential.findUnique({ where: { id } });
    const { count } = await db.deviceBinding.deleteMany({
      where: { credentialId: id },
    });

    await logAccess({
      event: "DISCONNECTED",
      actor: auth.username,
      detail: `credential:${credential?.voucherCode ?? id}:bindings_reset:${count}`,
    });

    return NextResponse.json({ ok: true, message: `Liberados ${count} dispositivo(s)`, count });
  } catch (error) {
    console.error("DELETE /api/admin/credentials/[id]/bindings", error);
    return NextResponse.json({ ok: false, message: "Error interno" }, { status: 500 });
  }
}
