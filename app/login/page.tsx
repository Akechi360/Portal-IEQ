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
  const mac = typeof params.mac === 'string' ? params.mac : undefined
  const ip = typeof params.ip === 'string' ? params.ip : undefined
  const redirect = typeof params.redirect === 'string' ? params.redirect : undefined
  const ssid = typeof params.ssid === 'string' ? params.ssid : undefined

  return (
    <LoginClient
      mac={mac || ''}
      ip={ip || ''}
      redirect={redirect || ''}
      ssid={ssid || 'WiFi-ClinicaIEQ'}
    />
  )
}
