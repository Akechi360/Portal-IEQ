// app/login/page.tsx
// Portal cautivo público único para WiFi-ClinicaIEQ
// Consolidado: "Acceso con código" (PACIENTE/TRANSITO) + "Soy médico" en una sola pantalla
// Lee query params del gateway (mac, ip, redirect, etc.) y los guarda en cookies

import { cookies } from 'next/headers'
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

  // Guardar parámetros técnicos en cookies para usarlos en el flujo
  const cookieStore = await cookies()
  const isSecure = process.env.NODE_ENV === 'production'
  
  if (mac) {
    cookieStore.set('portal_mac', mac, { 
      httpOnly: true, 
      secure: isSecure, 
      sameSite: 'lax',
      maxAge: 300 
    })
  }
  
  if (ip) {
    cookieStore.set('portal_ip', ip, { 
      httpOnly: true, 
      secure: isSecure, 
      sameSite: 'lax',
      maxAge: 300 
    })
  }
  
  if (redirect) {
    cookieStore.set('portal_redirect', redirect, { 
      httpOnly: true, 
      secure: isSecure, 
      sameSite: 'lax',
      maxAge: 300 
    })
  }
  
  if (ssid) {
    cookieStore.set('portal_ssid', ssid, { 
      httpOnly: true, 
      secure: isSecure, 
      sameSite: 'lax',
      maxAge: 300 
    })
  }

  return (
    <LoginClient 
      mac={mac || ''}
      ip={ip || ''}
      redirect={redirect || ''}
      ssid={ssid || 'WiFi-ClinicaIEQ'}
    />
  )
}
