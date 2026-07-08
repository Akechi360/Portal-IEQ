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
  return new NextResponse(null, {
    status: 302,
    headers: { Location: `/login?${params.toString()}` },
  });
}
