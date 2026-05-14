<<<<<<< HEAD
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { ok: false, message: "Legacy endpoint — use /api/auth/doctor" },
    { status: 410 }
  );
=======
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { ok: false, message: "Legacy endpoint — use /api/auth/doctor" },
    { status: 410 }
  );
>>>>>>> 122e5623a76acc8320884b73a0c20152eceade21
}
