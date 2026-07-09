import { NextResponse } from "next/server";

// Punto de entrada WiFiDog del gateway Reyee (EG1510XS).
// El gateway agrega "/auth/wifidogAuth/login/" a la URL del portal configurada
// en Ruijie Cloud y redirige aquí al cliente con: gw_id, gw_sn, gw_address,
// gw_port, ip, mac, ssid, url (destino original), chap_id, chap_challenge.
// Reenviamos todos los parámetros a la página de login del portal.
export async function GET(req: Request) {
  const incoming = new URL(req.url);
  const params = new URLSearchParams(incoming.searchParams);

  // La página /login espera el destino original como "redirect"
  const originalUrl = incoming.searchParams.get("url");
  if (originalUrl) {
    params.set("redirect", originalUrl);
  }

  // Location relativo: detrás del proxy el contenedor no conoce su dominio público
  const res = new NextResponse(null, {
    status: 302,
    headers: { Location: `/login?${params.toString()}` },
  });

  // Guardar los parámetros técnicos del gateway en cookies para el flujo de auth
  // secure:false — el popup del portal navega por HTTP (IP directa del
  // servidor); con secure:true el navegador descarta las cookies y el flujo
  // pierde gw_address/gw_port (el cliente nunca vuelve al gateway).
  const cookieOpts = {
    httpOnly: true,
    secure: false,
    sameSite: "lax" as const,
    maxAge: 300,
  };
  const mac = incoming.searchParams.get("mac");
  const ip = incoming.searchParams.get("ip");
  const ssid = incoming.searchParams.get("ssid");
  const gwAddress = incoming.searchParams.get("gw_address");
  const gwPort = incoming.searchParams.get("gw_port");
  const gwId = incoming.searchParams.get("gw_id");

  if (mac) res.cookies.set("portal_mac", mac, cookieOpts);
  if (ip) res.cookies.set("portal_ip", ip, cookieOpts);
  if (originalUrl) res.cookies.set("portal_redirect", originalUrl, cookieOpts);
  if (ssid) res.cookies.set("portal_ssid", ssid, cookieOpts);
  if (gwAddress) res.cookies.set("portal_gw_address", gwAddress, cookieOpts);
  if (gwPort) res.cookies.set("portal_gw_port", gwPort, cookieOpts);
  if (gwId) res.cookies.set("portal_gw_id", gwId, cookieOpts);

  return res;
}
