import { NextResponse } from "next/server";

// WiFiDog auth check — AP validates a client token here.
// Response: "Auth: 1" (allow) or "Auth: 0" (deny).
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const mac = searchParams.get("mac");

  // Por ahora permitir si hay token válido (no vacío)
  // TODO: validar token contra sesiones activas en DB
  const allowed = token && token.length > 0 ? 1 : 0;

  return new NextResponse(`Auth: ${allowed}`, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
