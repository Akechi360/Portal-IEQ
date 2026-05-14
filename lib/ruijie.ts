// ─── lib/ruijie.ts ────────────────────────────────────────────────────────────
// Abstracción única para el gateway Ruijie.
// En modo offline cada función retorna mock data.
// TODO Fase 3: reemplazar el cuerpo de cada función con la llamada HTTP real al gateway.

import { URL } from "url";

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
  console.warn("[ruijie][offline] getRuijieToken — usando token mock");
  return "MOCK_TOKEN_OFFLINE";
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
  groupId: string;
  maxDevices: number;
  expireAt?: Date;
  note?: string;
}): Promise<RuijieVoucher> {
  console.warn("[ruijie][offline] createVoucher — groupId:", payload.groupId);
  // TODO Fase 3: llamada real al gateway para crear el voucher y retornar el código
  const code = `IEQ-${Date.now().toString(36).toUpperCase().slice(-4)}-MOCK`;
  return {
    code,
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
  console.warn("[ruijie][offline] getDevices — retornando mock");
  // TODO Fase 3: fetch(RUIJIE_GATEWAY_URL + "/devices", { headers: { Authorization: token } })
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

/**
 * Lista las sesiones activas en el gateway.
 * TODO Fase 3: GET /gateway/sessions
 */
export async function getSessions(): Promise<RuijieSession[]> {
  console.warn("[ruijie][offline] getSessions — retornando mock");
  // TODO Fase 3: fetch(RUIJIE_GATEWAY_URL + "/sessions", { headers: { Authorization: token } })
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
