import { NextResponse } from "next/server";
<<<<<<< HEAD
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
=======
import { verifyToken } from "@/app/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
>>>>>>> 53f8a2c92a064c1299ac43fdff28034dd65a9b27
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
