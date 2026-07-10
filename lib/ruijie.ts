// ─── lib/ruijie.ts ────────────────────────────────────────────────────────────
// Abstracción única para el gateway Ruijie.
// Implementación real de la API de Ruijie Cloud.

import { URL } from "url";
import { getSystemConfig } from "./config";

const RUIJIE_CLOUD_URL = process.env.RUIJIE_CLOUD_URL || "https://cloud-la.ruijienetworks.com";
const RUIJIE_APP_ID = process.env.RUIJIE_APP_ID || "";
const RUIJIE_SECRET = process.env.RUIJIE_SECRET || "";
// Valores reales del tenant gerencia_sistemas (grupo "Clinica IEQ Network"):
// userGroup "VIP_Group" id=115094, authProfileId largo. Ver API 2.7.1 Get User Group List.
const RUIJIE_USER_GROUP_ID = Number(process.env.RUIJIE_USER_GROUP_ID || "115094");
const RUIJIE_PROFILE_ID = process.env.RUIJIE_PROFILE_ID || "62573683689951241348214573646843";

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
  name: string | null;
  model: string | null;
  connectedAt: string;
  bytesDown: number;
  bytesUp: number;
}

export interface RuijieSession {
  id: string;
  mac: string;
  username: string;
  ip: string;
  ssid: string;
  apMac: string;
  startedAt: string;
  durationSeconds: number;
  bytesDown: number;
  bytesUp: number;
  rssi: number | null;
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

    // Cache por 25 min — Ruijie invalida el token a los 30 min de inactividad
    globalAny.ruijieTokenCache = {
      token,
      expiresAt: now + 25 * 60 * 1000
    };

    return token;
  } catch (error) {
    console.error("Error fetching Ruijie token:", error);
    return "MOCK_TOKEN_OFFLINE";
  }
}

/**
 * Códigos de Ruijie que indican token inválido/expirado. Ruijie expira el
 * token a los 30 min de inactividad y lo invalida al emitir uno nuevo, así
 * que el cache local puede quedar obsoleto — hay que renovar y reintentar.
 */
function isStaleTokenCode(code: number): boolean {
  return code === 3 || code === 4;
}

function invalidateRuijieToken() {
  globalAny.ruijieTokenCache = null;
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
    return { authorized: true, reason: "offline-mode" };
  }

  const networkGroupId = process.env.RUIJIE_GROUP_ID || "9371493";

  const attempt = async (accessToken: string) => {
    const res = await fetch(
      `${RUIJIE_CLOUD_URL}/service/api/open/auth/voucher/customerCreate/${networkGroupId}/${payload.username}?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: networkGroupId,
          profile: RUIJIE_PROFILE_ID,
          userGroupId: RUIJIE_USER_GROUP_ID,
        }),
      }
    );
    return res;
  };

  try {
    console.log(`[ruijie] Autorizando cliente MAC ${payload.mac} via voucher customerCreate`);
    let res = await attempt(token);

    if (!res.ok) {
      console.error(`[ruijie] Gateway HTTP error: ${res.status}`);
      return { authorized: false, reason: `Gateway HTTP ${res.status}` };
    }

    let data = await res.json();

    // Token vencido — renovar y reintentar una vez
    if (data.code !== 0 && isStaleTokenCode(data.code)) {
      console.warn(`[ruijie] Token vencido (code=${data.code}) — renovando y reintentando`);
      invalidateRuijieToken();
      const freshToken = await getRuijieToken();
      if (freshToken !== "MOCK_TOKEN_OFFLINE") {
        res = await attempt(freshToken);
        if (!res.ok) {
          return { authorized: false, reason: `Gateway HTTP ${res.status} (retry)` };
        }
        data = await res.json();
      }
    }

    if (data.code !== 0) {
      console.error(`[ruijie] Gateway rejected: code=${data.code} msg=${data.msg}`);
      return { authorized: false, reason: `Ruijie code ${data.code}: ${data.msg}` };
    }

    if (data.voucherData && data.voucherData.code !== undefined && data.voucherData.code !== 0) {
      console.warn(`[ruijie] Voucher warning: code=${data.voucherData.code} msg=${data.voucherData.msg}`);
      return { authorized: true, reason: `voucher-warning: ${data.voucherData.msg}` };
    }

    return { authorized: true };
  } catch (e: any) {
    console.error(`[ruijie] Connection failed:`, e.message);
    return { authorized: false, reason: `Gateway unreachable: ${e.message}` };
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

  const attempt = async (accessToken: string) => {
    const res = await fetch(
      `${RUIJIE_CLOUD_URL}/service/api/open/auth/voucher/customerCreate/${networkGroupId}/${payload.code}?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: networkGroupId.toString(),
          profile: RUIJIE_PROFILE_ID,
          userGroupId: RUIJIE_USER_GROUP_ID,
        }),
      }
    );
    if (!res.ok) {
      throw new Error(`Failed to create voucher in Ruijie: HTTP ${res.status}`);
    }
    return res.json();
  };

  let createData = await attempt(token);

  // Token vencido — renovar y reintentar una vez
  if (createData.code !== 0 && isStaleTokenCode(createData.code)) {
    console.warn(`[ruijie] Token vencido (code=${createData.code}) — renovando y reintentando createVoucher`);
    invalidateRuijieToken();
    const freshToken = await getRuijieToken();
    if (freshToken !== "MOCK_TOKEN_OFFLINE") {
      createData = await attempt(freshToken);
    }
  }

  if (createData.code !== 0) {
    throw new Error(`Ruijie error creating voucher (code ${createData.code}): ${createData.msg}`);
  }

  if (createData.voucherData && createData.voucherData.code !== 0) {
    console.warn(`[ruijie] Voucher sync warning: code=${createData.voucherData.code} msg=${createData.voucherData.msg}`);
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
 * Crea una CUENTA en Ruijie Cloud (distinto de un voucher). Necesaria cuando
 * el portal WISPr usa "Tipo de Auten: Cuenta local" — ese modo valida contra
 * la tabla de cuentas (account/create), no contra la de vouchers
 * (voucher/customerCreate). Usamos el mismo código de voucher como
 * username/password para no duplicar identificadores.
 */
export async function createAccount(payload: {
  username: string;
  password: string;
}): Promise<{ ok: boolean; reason?: string }> {
  const token = await getRuijieToken();
  if (token === "MOCK_TOKEN_OFFLINE") {
    console.warn("[ruijie][offline] createAccount — username:", payload.username);
    return { ok: true, reason: "offline-mode" };
  }

  const networkGroupId = process.env.RUIJIE_GROUP_ID || "9371493";

  const attempt = async (accessToken: string) => {
    const res = await fetch(
      `${RUIJIE_CLOUD_URL}/service/api/open/auth/account/create/${networkGroupId}?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: payload.username,
          password: payload.password,
          profileId: RUIJIE_PROFILE_ID,
          userGroupId: RUIJIE_USER_GROUP_ID,
          vpnEnable: false,
        }),
      }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  try {
    let data = await attempt(token);
    if (data.code !== 0 && isStaleTokenCode(data.code)) {
      invalidateRuijieToken();
      const fresh = await getRuijieToken();
      if (fresh !== "MOCK_TOKEN_OFFLINE") data = await attempt(fresh);
    }
    if (data.code !== 0) {
      console.error(`[ruijie] createAccount rechazado: code=${data.code} msg=${data.msg}`);
      return { ok: false, reason: `code ${data.code}: ${data.msg}` };
    }
    return { ok: true };
  } catch (e: any) {
    console.error("[ruijie] createAccount falló:", e.message);
    return { ok: false, reason: e.message };
  }
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
        name: "AP Recepción (demo)",
        model: "RAP2260(G)",
        connectedAt: new Date(Date.now() - 3600_000).toISOString(),
        bytesDown: 1_048_576,
        bytesUp: 204_800,
      },
      {
        mac: "9c:3d:cf:2f:bc:11",
        ip: "192.168.10.102",
        ssid: "IEQ-Medicos",
        name: "AP Consultorios (demo)",
        model: "RAP2260(G)",
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
    // Nombre/alias real del equipo en Ruijie Cloud (varía el campo según versión API)
    name: d.name || d.deviceName || d.alias || d.hostname || d.sn || d.serialNumber || null,
    model: d.deviceType || d.model || d.type || null,
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
        ip: "192.168.110.101",
        ssid: "WiFi Clinica IEQ Los Mangos",
        apMac: "00:d0:f8:aa:bb:cc",
        startedAt: new Date(Date.now() - 3_600_000).toISOString(),
        durationSeconds: 3_600,
        bytesDown: 52_428_800,
        rssi: -60,
        bytesUp: 10_485_760,
      },
      {
        id: "sess-mock-002",
        mac: "9c:3d:cf:2f:bc:11",
        username: "dr.demo",
        ip: "192.168.110.102",
        ssid: "WiFi Clinica IEQ Los Mangos",
        apMac: "00:d0:f8:aa:bb:cc",
        startedAt: new Date(Date.now() - 86_400_000).toISOString(),
        durationSeconds: 86_400,
        bytesDown: 209_715_200,
        rssi: -70,
        bytesUp: 41_943_040,
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
      mac,
      username: u.userName || u.username || "Unknown",
      ip: u.ip || u.ipAddress || u.staIp || "—",
      ssid: u.ssid || u.ssidName || "—",
      apMac: u.apMac ? normalizeMac(u.apMac) : "—",
      startedAt: u.onlineTime ? new Date(u.onlineTime).toISOString() : new Date().toISOString(),
      durationSeconds: u.activeTime ? Math.floor(u.activeTime / 1000) : 0,
      bytesDown: u.flowDown || u.downFlow || u.wifiDown || u.rxBytes || 0,
      bytesUp: u.flowUp || u.upFlow || u.wifiUp || u.txBytes || 0,
      rssi: typeof u.rssiInt === "number" ? u.rssiInt : u.rssi ? Number(u.rssi) : null,
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
