// ─── lib/config.ts ────────────────────────────────────────────────────────────
// Helper de configuración del portal — modo offline.
// Retorna valores por defecto hardcoded hasta que la DB esté disponible.
// TODO Fase 3: leer desde db.portalConfig y db.systemConfig

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface PortalConfigShape {
  portalName: string;
  slogan: string | null;
  logoUrl: string | null;
  bgUrl: string | null;
  primaryColor: string;
  fontFamily: string;
  loginTitle: string;
  loginButton: string;
  successMsg: string;
  errorMsg: string;
}

export interface SystemConfigMap {
  guest_session_hours: number;
  doctor_session_hours: number | null; // null = permanente
  max_devices_guest: number;
  max_devices_doctor: number;
  webhook_clinic_enabled: boolean;
  ruijie_gateway_url: string;
  ruijie_group_guest: string;
  ruijie_group_medicos: string;
}

// ─── Valores por defecto (offline) ────────────────────────────────────────────

const DEFAULT_PORTAL: PortalConfigShape = {
  portalName: "Portal IEQ",
  slogan: "Acceso WiFi para pacientes y personal médico",
  logoUrl: null,
  bgUrl: null,
  primaryColor: "#0EA5E9",
  fontFamily: "Inter",
  loginTitle: "Acceso WiFi",
  loginButton: "Conectarme",
  successMsg: "¡Acceso concedido! Ya puedes navegar.",
  errorMsg: "Código inválido o expirado. Verifica con admisión.",
};

const DEFAULT_SYSTEM: SystemConfigMap = {
  guest_session_hours: 48,
  doctor_session_hours: null,
  max_devices_guest: 2,
  max_devices_doctor: 3,
  webhook_clinic_enabled: false,
  ruijie_gateway_url: process.env.RUIJIE_GATEWAY_URL ?? "http://localhost:8080",
  ruijie_group_guest: process.env.RUIJIE_GROUP_GUEST ?? "grp-guest",
  ruijie_group_medicos: process.env.RUIJIE_GROUP_MEDICOS ?? "grp-medicos",
};

import { db } from "@/lib/db";

// ─── API pública ──────────────────────────────────────────────────────────────

function parseConfigValue(key: string, value: string): any {
  if (value === "null") return null;
  if (
    key === "guest_session_hours" ||
    key === "max_devices_guest" ||
    key === "max_devices_doctor"
  ) {
    const num = Number(value);
    return isNaN(num) ? null : num;
  }
  if (key === "doctor_session_hours") {
    if (value === "null" || value === "") return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  }
  if (key === "webhook_clinic_enabled") {
    return value === "true" || value === "1";
  }
  return value;
}

/**
 * Retorna la configuración del portal cautivo.
 */
export async function getPortalConfig(): Promise<PortalConfigShape> {
  try {
    const config = await db.portalConfig.findFirst();
    if (!config) return DEFAULT_PORTAL;
    return {
      portalName: config.portalName,
      slogan: config.slogan,
      logoUrl: config.logoUrl,
      bgUrl: config.bgUrl,
      primaryColor: config.primaryColor,
      fontFamily: config.fontFamily,
      loginTitle: config.loginTitle,
      loginButton: config.loginButton,
      successMsg: config.successMsg,
      errorMsg: config.errorMsg,
    };
  } catch (error) {
    console.error("Error getting portal config, using default:", error);
    return DEFAULT_PORTAL;
  }
}

/**
 * Retorna un valor de configuración del sistema por clave.
 */
export async function getSystemConfig<K extends keyof SystemConfigMap>(
  key: K
): Promise<SystemConfigMap[K]> {
  try {
    const config = await db.systemConfig.findUnique({ where: { key } });
    if (!config) return DEFAULT_SYSTEM[key];
    return parseConfigValue(key, config.value) as SystemConfigMap[K];
  } catch (error) {
    console.error(`Error getting system config for key ${key}, using fallback:`, error);
    return DEFAULT_SYSTEM[key];
  }
}

/**
 * Retorna toda la configuración del sistema como mapa.
 */
export async function getAllSystemConfig(): Promise<SystemConfigMap> {
  try {
    const configs = await db.systemConfig.findMany();
    const result = { ...DEFAULT_SYSTEM };
    for (const config of configs) {
      if (config.key in result) {
        (result as any)[config.key] = parseConfigValue(config.key, config.value);
      }
    }
    return result;
  } catch (error) {
    console.error("Error getting all system configs, using fallback:", error);
    return { ...DEFAULT_SYSTEM };
  }
}
