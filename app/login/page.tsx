import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

interface Props {
  searchParams: { ssid?: string; mac?: string; ip?: string }
}

export default async function LoginRouter({ searchParams }: Props) {
  const { ssid, mac, ip } = searchParams

  // Guardar mac e ip en cookies para usarlas en el callback de Ruijie
  const cookieStore = cookies()
  if (mac) cookieStore.set('portal_mac', mac, { httpOnly: true, path: '/' })
  if (ip) cookieStore.set('portal_ip', ip, { httpOnly: true, path: '/' })

  // Redirigir según SSID
  if (ssid === 'medicos') {
    redirect('/login/medicos')
  }

  // Por defecto (guest, sin ssid, o cualquier otro valor) → guest
  redirect('/login/guest')
}
