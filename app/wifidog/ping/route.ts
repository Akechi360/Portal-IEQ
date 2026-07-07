import { NextResponse } from "next/server";

// WiFiDog heartbeat — AP pings http://{ip}:{port}/wifidog/ping
// Must respond "Pong" or AP enters fail-open and skips portal for all clients.
export async function GET() {
  return new NextResponse("Pong", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
