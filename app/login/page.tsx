// app/login/page.tsx
// Portal cautivo público único para WiFi-ClinicaIEQ
// Consolidado: "Acceso con código" (PACIENTE/TRANSITO) + "Soy médico" en una sola pantalla
// Los parámetros del gateway (mac, ip, redirect, ssid) llegan por query string;
// las cookies las setea /auth/wifidogAuth/login (Route Handler) — un Server
// Component no puede modificar cookies en Next 15.

import { LoginClient } from './LoginClient'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const str = (v: string | string[] | undefined) =>
    typeof v === 'string' ? v : undefined

  // WiFiDog usa mac/ip/redirect; WISPr (preset "Ruijie") usa
  // client_mac/nas_ip/url + login_url/logout_url. Aceptamos ambos.
  const mac = str(params.mac) ?? str(params.client_mac)
  const ip = str(params.ip) ?? str(params.nas_ip)
  const redirect = str(params.redirect) ?? str(params.url)
  const ssid = str(params.ssid)

  // WISPr: URL del gateway donde el portal envía las credenciales
  const loginUrl = str(params.login_url)
  const logoutUrl = str(params.logout_url)

  return (
    <LoginClient
      mac={mac || ''}
      ip={ip || ''}
      redirect={redirect || ''}
      ssid={ssid || 'WiFi-ClinicaIEQ'}
      loginUrl={loginUrl || ''}
      logoutUrl={logoutUrl || ''}
    />
  )
}
