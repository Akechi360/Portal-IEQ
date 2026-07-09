import { NextResponse } from "next/server";

// Catch-all WiFiDog para el gateway Reyee (EG1510XS).
// El EG construye sus rutas bajo /auth/wifidogAuth/* (igual que la de login).
// Aquí atendemos el resto del protocolo: ping (heartbeat), auth (validación
// de token) y cualquier variante — y registramos cada llamada para diagnóstico.
async function handle(
  req: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const url = new URL(req.url);
  const path = slug.join("/");

  console.log(`[wifidogAuth] ${req.method} /${path}?${url.searchParams.toString()}`);

  const last = slug[slug.length - 1]?.toLowerCase() ?? "";

  // Heartbeat del gateway — responder Pong o entra en fail-open
  if (last === "ping") {
    return new NextResponse("Pong", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // Validación de token del cliente (stage=login) y contadores (stage=counters)
  if (last === "auth") {
    const token = url.searchParams.get("token") ?? "";
    const allowed = token.length > 0 ? 1 : 0;
    return new NextResponse(`Auth: ${allowed}`, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // Portal/mensajes u otras rutas — mandar al login conservando parámetros
  const params2 = new URLSearchParams(url.searchParams);
  const originalUrl = url.searchParams.get("url");
  if (originalUrl) params2.set("redirect", originalUrl);

  return new NextResponse(null, {
    status: 302,
    headers: { Location: `/login?${params2.toString()}` },
  });
}

export const GET = handle;
export const POST = handle;
export const HEAD = handle;
