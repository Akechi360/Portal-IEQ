import { GuestPortalClient } from "@/components/guest/GuestPortalClient";

type GuestPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function GuestPage({ searchParams }: GuestPageProps) {
  const params = await searchParams;

  const asText = (value: string | string[] | undefined, fallback: string) => {
    if (!value) return fallback;
    return Array.isArray(value) ? value[0] : value;
  };

  const placeholders = {
    client_mac: asText(params.client_mac, "00:00:00:00:00:00"),
    ap_mac: asText(params.ap_mac, "11:11:11:11:11:11"),
    ssid: asText(params.ssid, "CLINICA_WIFI"),
    redirect: asText(params.redirect, "https://redirect.local/success")
  };

  return <GuestPortalClient placeholders={placeholders} />;
}
