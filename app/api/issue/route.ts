import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { ok: false, message: "Legacy endpoint — use /api/admin/credentials/issue" },
    { status: 410 }
  );
}

