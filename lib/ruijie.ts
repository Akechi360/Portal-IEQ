// ─── lib/ruijie.ts ────────────────────────────────────────────────────────────
// Abstracción única para el gateway Ruijie.
// En modo offline cada función retorna mock data.
// TODO Fase 3: reemplazar el cuerpo de cada función con la llamada HTTP real al gateway.

import { URL } from "url";

const RUIJIE_CLOUD_URL = process.env.RUIJIE_CLOUD_URL || "https://cloud-as.ruijienetworks.com";
const RUIJIE_APP_ID = process.env.RUIJIE_APP_ID || "";
const RUIJIE_SECRET = process.env.RUIJIE_SECRET || "";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface RuijieAuthorizeResult {
  allow: boolean;
  redirectUrl: string;
  protocol: "WISPr" | "WiFiDog" | "Unknown";
  reason?: string;
}

export interface RuijieDevice {
  mac: string;
  ip: string;
  ssid: string;
  connectedAt: string;
  bytesDown: number;
  bytesUp: number;
}

export interface RuijieSession {
  id: string;
  mac: string;
  username: string;
  startedAt: string;
  durationSeconds: number;
}

export interface RuijieUserGroup {
  id: string;
  name: string;
  maxBandwidthMbps: number;
  description?: string;
}

export interface RuijieVoucher {
  code: string;
  groupId: string;
  maxDevices: number;
  expireAt: string | null;
  note?: string;
}

// ─── Stubs offline ────────────────────────────────────────────────────────────

/**
 * Obtiene el token de autenticación hacia el gateway Ruijie.
 * TODO Fase 3: POST /gateway/token con credenciales del .env
 */
export async function getRuijieToken(): Promise<string> {
  if (!RUIJIE_APP_ID || !RUIJIE_SECRET) {
    console.warn("[ruijie][offline] Faltan credenciales RUIJIE_APP_ID o RUIJIE_SECRET. Retornando mock.");
    return "MOCK_TOKEN_OFFLINE";
  }
  
  const res = await fetch(`${RUIJIE_CLOUD_URL}/service/api/oauth20/client/access_token?token=d63dss0a81e4415a889ac5b78fsc904a`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      appid: RUIJIE_APP_ID,
      secret: RUIJIE_SECRET
    })
  });
  
  if (!res.ok) throw new Error("Failed to get Ruijie token");
  const data = await res.json();
  return data.accessToken || data.access_token || "";
}

/**
 * Autoriza un cliente (MAC) en el gateway Ruijie.
 * TODO Fase 3: llamada HTTP al endpoint de autorización del gateway real.
 */
export async function authorizeClient(payload: {
  mac: string;
  username: string;
  groupId?: string;
  token?: string;
}): Promise<{ authorized: boolean; reason?: string }> {
  console.warn("[ruijie][offline] authorizeClient — mac:", payload.mac);
  // TODO Fase 3: POST RUIJIE_GATEWAY_URL/authorize con payload + token
  return { authorized: true };
}

/**
 * Crea un voucher de acceso en el gateway Ruijie.
 * TODO Fase 3: POST /gateway/vouchers
 */
export async function createVoucher(payload: {
  code: string;
  groupId: string;
  maxDevices: number;
  expireAt?: Date;
  note?: string;
}): Promise<RuijieVoucher> {
  const token = await getRuijieToken();
  if (token === "MOCK_TOKEN_OFFLINE") {
    console.warn("[ruijie][offline] createVoucher — groupId:", payload.groupId);
    return {
      code: payload.code,
      groupId: payload.groupId,
      maxDevices: payload.maxDevices,
      expireAt: payload.expireAt?.toISOString() ?? null,
      note: payload.note,
    };
  }

  const res = await fetch(`${RUIJIE_CLOUD_URL}/service/api/open/auth/voucher/customerCreate/${payload.groupId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      code: payload.code,
      maxDevices: payload.maxDevices,
      expireAt: payload.expireAt ? payload.expireAt.getTime() : null,
      note: payload.note
    })
  });

  if (!res.ok) throw new Error("Error creando voucher en Ruijie");

  return {
    code: payload.code,
    groupId: payload.groupId,
    maxDevices: payload.maxDevices,
    expireAt: payload.expireAt?.toISOString() ?? null,
    note: payload.note,
  };
}

/**
 * Lista los dispositivos conectados actualmente al gateway.
 * TODO Fase 3: GET /gateway/devices
 */
export async function getDevices(): Promise<RuijieDevice[]> {
  const token = await getRuijieToken();
  if (token === "MOCK_TOKEN_OFFLINE") {
    console.warn("[ruijie][offline] getDevices — retornando mock");
    return [
      {
        mac: "00:1a:c2:7b:00:47",
        ip: "192.168.10.101",
        ssid: "IEQ-Guest",
        connectedAt: new Date(Date.now() - 3600_000).toISOString(),
        bytesDown: 1_048_576,
        bytesUp: 204_800,
      },
      {
        mac: "9c:3d:cf:2f:bc:11",
        ip: "192.168.10.102",
        ssid: "IEQ-Medicos",
        connectedAt: new Date(Date.now() - 7_200_000).toISOString(),
        bytesDown: 5_242_880,
        bytesUp: 1_048_576,
      },
    ];
  }

  const res = await fetch(`${RUIJIE_CLOUD_URL}/service/api/maint/devices`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Error fetching devices from Ruijie");
  const json = await res.json();
  const data = json.data || [];
  
  return data.map((d: any) => ({
    mac: d.mac || d.deviceMac,
    ip: d.ip,
    ssid: d.ssid || "N/A",
    connectedAt: new Date().toISOString(),
    bytesDown: d.flowDown || 0,
    bytesUp: d.flowUp || 0,
  }));
}

/**
 * Lista las sesiones activas en el gateway.
 * TODO Fase 3: GET /gateway/sessions
 */
export async function getSessions(): Promise<RuijieSession[]> {
  const token = await getRuijieToken();
  if (token === "MOCK_TOKEN_OFFLINE") {
    console.warn("[ruijie][offline] getSessions — retornando mock");
    return [
      {
        id: "sess-mock-001",
        mac: "00:1a:c2:7b:00:47",
        username: "paciente_demo",
        startedAt: new Date(Date.now() - 3_600_000).toISOString(),
        durationSeconds: 3_600,
      },
      {
        id: "sess-mock-002",
        mac: "9c:3d:cf:2f:bc:11",
        username: "dr.demo",
        startedAt: new Date(Date.now() - 86_400_000).toISOString(),
        durationSeconds: 86_400,
      },
    ];
  }

  const res = await fetch(`${RUIJIE_CLOUD_URL}/service/api/open/v1/dev/user/current-user`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Error fetching sessions from Ruijie");
  const json = await res.json();
  const data = json.data || [];

  return data.map((u: any) => ({
    id: u.mac,
    mac: u.mac,
    username: u.userName || "Unknown",
    startedAt: u.onlineTime ? new Date(u.onlineTime).toISOString() : new Date().toISOString(),
    durationSeconds: 0,
  }));
}

/**
 * Lista los grupos de usuario configurados en el gateway.
 * TODO Fase 3: GET /gateway/usergroups
 */
export async function getUserGroups(): Promise<RuijieUserGroup[]> {
  console.warn("[ruijie][offline] getUserGroups — retornando mock");
  // TODO Fase 3: fetch(RUIJIE_GATEWAY_URL + "/usergroups", { headers: { Authorization: token } })
  return [
    { id: "grp-guest", name: "Pacientes / Tránsito", maxBandwidthMbps: 10, description: "Acceso temporal" },
    { id: "grp-medicos", name: "Médicos", maxBandwidthMbps: 50, description: "Acceso permanente personal médico" },
    { id: "grp-admin", name: "Administración", maxBandwidthMbps: 100, description: "Sin restricción" },
  ];
}

// ─── Funciones de protocolo (compatibilidad con /api/ruijie/authorize) ────────

export function detectPortalProtocol(query: URLSearchParams): RuijieAuthorizeResult["protocol"] {
  if (query.get("gw_id") || query.get("gw_address")) return "WiFiDog";
  if (query.get("WISPrVersion") || query.get("WISPAccessGatewayAddress")) return "WISPr";
  return "Unknown";
}

export function buildRuijieSuccessRedirect(redirect: string) {
  try {
    return new URL(redirect).toString();
  } catch {
    return redirect;
  }
}

export function buildRuijieDenyRedirect(redirect: string, message = "access_denied") {
  try {
    const url = new URL(redirect);
    url.searchParams.set("error", message);
    return url.toString();
  } catch {
    return `${redirect}${redirect.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`;
  }
}

export async function authorizeWithRuijieGateway(input: {
  redirect: string;
  approved: boolean;
  reason?: string;
  query: URLSearchParams;
}): Promise<RuijieAuthorizeResult> {
  const protocol = detectPortalProtocol(input.query);
  if (input.approved) {
    return { allow: true, redirectUrl: buildRuijieSuccessRedirect(input.redirect), protocol };
  }
  return {
    allow: false,
    redirectUrl: buildRuijieDenyRedirect(input.redirect, input.reason ?? "denied"),
    protocol,
    reason: input.reason,
  };
}
