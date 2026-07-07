import { NextResponse } from "next/server";

// WiFiDog heartbeat — AP pings this to verify the auth server is alive.
// Must respond with plain text "Pong" or the AP enters fail-open mode.
export async function GET() {
  return new NextResponse("Pong", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
