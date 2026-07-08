import { NextResponse } from "next/server";

// Punto de entrada WiFiDog del gateway Reyee (EG1510XS).
// El gateway agrega "/auth/wifidogAuth/login/" a la URL del portal configurada
// en Ruijie Cloud y redirige aquí al cliente con: gw_id, gw_sn, gw_address,
// gw_port, ip, mac, ssid, url (destino original), chap_id, chap_challenge.
// Reenviamos todos los parámetros a la página de login del portal.
export async function GET(req: Request) {
  const incoming = new URL(req.url);
  const login = new URL("/login", incoming.origin);

  incoming.searchParams.forEach((value, key) => {
    login.searchParams.set(key, value);
  });

  // La página /login espera el destino original como "redirect"
  const originalUrl = incoming.searchParams.get("url");
  if (originalUrl) {
    login.searchParams.set("redirect", originalUrl);
  }

  return NextResponse.redirect(login, 302);
}
