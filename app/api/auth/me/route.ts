<<<<<<< HEAD
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("ieq_session")?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user: payload });
}
=======
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("ieq_session")?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user: payload });
}
>>>>>>> 122e5623a76acc8320884b73a0c20152eceade21
