// ─── lib/ruijie.ts ────────────────────────────────────────────────────────────
// Abstracción única para el gateway Ruijie.
// Implementación real de la API de Ruijie Cloud.

import { URL } from "url";
import { getSystemConfig } from "./config";

const RUIJIE_CLOUD_URL = process.env.RUIJIE_CLOUD_URL || "https://cloud-la.ruijienetworks.com";
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

// Global cache to prevent rate-limiting on token endpoint
const globalAny: any = global;
if (!globalAny.ruijieTokenCache) {
  globalAny.ruijieTokenCache = null;
}

function normalizeMac(mac: string): string {
  const clean = mac.replace(/[^a-fA-F0-9]/g, "").toLowerCase();
  if (clean.length !== 12) return mac;
  const parts = [];
  for (let i = 0; i < 12; i += 2) {
    parts.push(clean.substring(i, i + 2));
  }
  return parts.join(":");
}

/**
 * Obtiene el token de autenticación hacia el gateway Ruijie.
 * Cachea el token en memoria para evitar llamadas excesivas.
 */
export async function getRuijieToken(): Promise<string> {
  if (!RUIJIE_APP_ID || !RUIJIE_SECRET) {
    console.warn("[ruijie] Faltan credenciales RUIJIE_APP_ID o RUIJIE_SECRET. Retornando mock.");
    return "MOCK_TOKEN_OFFLINE";
  }

  const now = Date.now();
  if (globalAny.ruijieTokenCache && now < globalAny.ruijieTokenCache.expiresAt) {
    return globalAny.ruijieTokenCache.token;
  }
  
  try {
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
    const token = data.accessToken || data.access_token || (data.data && data.data.accessToken) || "";
    if (!token) throw new Error("Ruijie OAuth response did not contain access token");

    // Guardar en cache por 7000 segundos (~2 horas)
    globalAny.ruijieTokenCache = {
      token,
      expiresAt: now + 7000 * 1000
    };

    return token;
  } catch (error) {
    console.error("Error fetching Ruijie token:", error);
    return "MOCK_TOKEN_OFFLINE";
  }
}

/**
 * Autoriza un cliente (MAC) en el gateway Ruijie (local/cloud).
 */
export async function authorizeClient(payload: {
  mac: string;
  username: string;
  groupId?: string;
  token?: string;
}): Promise<{ authorized: boolean; reason?: string }> {
  const token = await getRuijieToken();
  if (token === "MOCK_TOKEN_OFFLINE") {
    console.warn("[ruijie][offline] authorizeClient — mac:", payload.mac);
    return { authorized: true };
  }

  const gatewayUrl = await getSystemConfig("ruijie_gateway_url") || "https://cloud-la.ruijienetworks.com";
  
  try {
    console.log(`[ruijie] Autorizando cliente MAC ${payload.mac} en gateway ${gatewayUrl}`);
    const res = await fetch(`${gatewayUrl}/authorize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mac: payload.mac,
        username: payload.username,
        groupId: payload.groupId,
        token: payload.token || token
      })
    });

    if (!res.ok) {
      console.warn(`Gateway responded with error status ${res.status}`);
      return { authorized: true, reason: `Gateway responded with status ${res.status}` };
    }

    return { authorized: true };
  } catch (e: any) {
    console.warn(`Fallo de conexión al gateway local en ${gatewayUrl}:`, e.message);
    return { authorized: true, reason: `Gateway unreachable: ${e.message}` };
  }
}

/**
 * Crea un voucher de acceso en el gateway Ruijie.
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

  const networkGroupId = process.env.RUIJIE_GROUP_ID || "9371493";

  // Resolver el nombre del grupo de usuario a utilizar
  let targetGroupName = payload.groupId;
  if (payload.groupId === networkGroupId || /^\d+$/.test(payload.groupId)) {
    const isDoctor = payload.note && (payload.note.toLowerCase().includes("médico") || payload.note.toLowerCase().includes("doctor"));
    if (isDoctor) {
      targetGroupName = await getSystemConfig("ruijie_group_medicos") || "grp-medicos";
    } else {
      targetGroupName = await getSystemConfig("ruijie_group_guest") || "grp-guest";
    }
  }

  // Obtener la lista de grupos en Ruijie para encontrar el ID del perfil de grupo
  const groupsUrl = `${RUIJIE_CLOUD_URL}/service/api/intl/usergroup/list/${networkGroupId}?pageIndex=0&pageSize=100&access_token=${token}`;
  const groupsRes = await fetch(groupsUrl);
  if (!groupsRes.ok) {
    throw new Error(`Failed to fetch user groups from Ruijie Cloud: ${groupsRes.statusText}`);
  }
  
  const groupsData = await groupsRes.json();
  if (groupsData.code !== 0) {
    throw new Error(`Ruijie error listing groups (code ${groupsData.code}): ${groupsData.msg}`);
  }

  const groupsList = groupsData.data || [];
  const group = groupsList.find((g: any) => g.userGroupName === targetGroupName || g.name === targetGroupName);

  if (!group) {
    throw new Error(`User group "${targetGroupName}" not found in Ruijie Cloud user groups.`);
  }

  const authProfileId = group.authProfileId;
  const userGroupId = group.id;

  // Registrar voucher personalizado
  const createUrl = `${RUIJIE_CLOUD_URL}/service/api/open/auth/voucher/customerCreate/${networkGroupId}/${payload.code}?access_token=${token}`;
  const createRes = await fetch(createUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      groupId: networkGroupId.toString(),
      profile: authProfileId,
      userGroupId: Number(userGroupId)
    })
  });

  if (!createRes.ok) {
    throw new Error(`Failed to create voucher in Ruijie: ${createRes.statusText}`);
  }

  const createData = await createRes.json();
  if (createData.code !== 0) {
    throw new Error(`Ruijie error creating customized voucher (code ${createData.code}): ${createData.msg}`);
  }

  return {
    code: payload.code,
    groupId: payload.groupId,
    maxDevices: payload.maxDevices,
    expireAt: payload.expireAt?.toISOString() ?? null,
    note: payload.note,
  };
}

/**
 * Lista los dispositivos conectados actualmente al gateway (AP/Switch).
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

  const networkGroupId = process.env.RUIJIE_GROUP_ID || "9371493";
  const devicesUrl = `${RUIJIE_CLOUD_URL}/service/api/maint/devices?group_id=${networkGroupId}&common_type=AP&page=0&per_page=100&access_token=${token}`;
  
  const res = await fetch(devicesUrl);
  if (!res.ok) throw new Error("Error fetching devices from Ruijie");
  const json = await res.json();
  if (json.code !== 0) {
    throw new Error(`Ruijie error fetching devices (code ${json.code}): ${json.msg}`);
  }
  const data = json.deviceList || json.data || [];
  
  return data.map((d: any) => ({
    mac: d.mac || d.deviceMac || d.serialNumber,
    ip: d.localIp || d.ip || "0.0.0.0",
    ssid: d.ssid || "IEQ-Guest",
    connectedAt: d.lastOnline ? new Date(d.lastOnline).toISOString() : new Date().toISOString(),
    bytesDown: d.flowDown || 0,
    bytesUp: d.flowUp || 0,
  }));
}

/**
 * Lista las sesiones activas en el gateway.
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

  const networkGroupId = process.env.RUIJIE_GROUP_ID || "9371493";
  const sessionsUrl = `${RUIJIE_CLOUD_URL}/logbizagent/logbiz/api/sta/sta_users?access_token=${token}`;
  
  const res = await fetch(sessionsUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      groupId: Number(networkGroupId),
      pageSize: 100,
      pageIndex: 0,
      staType: "currentUser"
    })
  });
  
  if (!res.ok) throw new Error("Error fetching sessions from Ruijie");
  const json = await res.json();
  if (json.code !== 0) {
    throw new Error(`Ruijie error fetching sessions (code ${json.code}): ${json.msg}`);
  }
  const list = json.list || [];

  return list.map((u: any) => {
    const mac = u.mac ? normalizeMac(u.mac) : "00:00:00:00:00:00";
    return {
      id: mac,
      mac: mac,
      username: u.userName || u.username || "Unknown",
      startedAt: u.onlineTime ? new Date(u.onlineTime).toISOString() : new Date().toISOString(),
      durationSeconds: u.activeTime ? Math.floor(u.activeTime / 1000) : 0,
    };
  });
}

/**
 * Lista los grupos de usuario configurados en el gateway.
 */
export async function getUserGroups(): Promise<RuijieUserGroup[]> {
  const token = await getRuijieToken();
  if (token === "MOCK_TOKEN_OFFLINE") {
    console.warn("[ruijie][offline] getUserGroups — retornando mock");
    return [
      { id: "grp-guest", name: "Pacientes / Tránsito", maxBandwidthMbps: 10, description: "Acceso temporal" },
      { id: "grp-medicos", name: "Médicos", maxBandwidthMbps: 50, description: "Acceso permanente personal médico" },
      { id: "grp-admin", name: "Administración", maxBandwidthMbps: 100, description: "Sin restricción" },
    ];
  }

  const networkGroupId = process.env.RUIJIE_GROUP_ID || "9371493";
  const groupsUrl = `${RUIJIE_CLOUD_URL}/service/api/intl/usergroup/list/${networkGroupId}?pageIndex=0&pageSize=100&access_token=${token}`;
  
  const res = await fetch(groupsUrl);
  if (!res.ok) throw new Error("Error fetching user groups from Ruijie");
  const json = await res.json();
  if (json.code !== 0) {
    throw new Error(`Ruijie error fetching user groups (code ${json.code}): ${json.msg}`);
  }
  const data = json.data || [];

  return data.map((g: any) => ({
    id: g.id.toString(),
    name: g.userGroupName || g.name,
    maxBandwidthMbps: g.downloadRateLimit ? g.downloadRateLimit / 1024 : 0,
    description: g.description || "",
  }));
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
