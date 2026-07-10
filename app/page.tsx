import { redirect } from 'next/navigation'

// El gateway (WISPr "URL para autenticación del servidor") apunta a la raíz
// del dominio, no a /login — hay que reenviar TODOS los query params
// (login_url, client_mac, nas_ip, url, ssid, etc.) o el portal pierde el
// contexto del gateway y el login nunca llega a autorizar al cliente.
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const qs = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') qs.set(key, value)
    else if (Array.isArray(value) && value[0]) qs.set(key, value[0])
  }

  const query = qs.toString()
  redirect(query ? `/login?${query}` : '/login')
}
