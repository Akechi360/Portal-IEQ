import { NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
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
