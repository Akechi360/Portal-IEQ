import { NextResponse } from "next/server";

// Ruta alterna WiFiDog (por si el gateway usa /wifidog/auth sin prefijo).
// Formato Reyee: resultado en el HEADER "Auth: 1"/"Auth: 0", cuerpo vacío,
// Content-Length: 0, sin chunked. Ver app/auth/wifidogAuth/[...slug]/route.ts.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") ?? "";
  const allowed = token.length > 0 ? "1" : "0";

  console.log(`[wifidog/auth] ${searchParams.toString()} → Auth: ${allowed}`);

  const res = new NextResponse(null, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Content-Length": "0",
      Auth: allowed,
      Connection: "close",
    },
  });
  res.headers.delete("Vary");
  return res;
}
