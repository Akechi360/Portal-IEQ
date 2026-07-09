import { NextResponse } from "next/server";

// WiFiDog auth check — AP validates client token at http://{ip}:{port}/wifidog/auth?stage=...&ip=...&mac=...&token=...&incoming=...&outgoing=...
// Response must be plain text: "Auth: 1" (allow) or "Auth: 0" (deny) or "Auth: 6" (error)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") ?? "";

  console.log(`[wifidog/auth] ${searchParams.toString()}`);

  const allowed = token.length > 0 ? 1 : 0;

  return new NextResponse(`Auth: ${allowed}`, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
