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

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Retorna la configuración del portal cautivo.
 * TODO Fase 3: await db.portalConfig.findFirst() ?? DEFAULT_PORTAL
 */
export async function getPortalConfig(): Promise<PortalConfigShape> {
  return DEFAULT_PORTAL;
}

/**
 * Retorna un valor de configuración del sistema por clave.
 * TODO Fase 3: leer db.systemConfig.findUnique({ where: { key } }) y hacer JSON.parse(value)
 */
export async function getSystemConfig<K extends keyof SystemConfigMap>(
  key: K
): Promise<SystemConfigMap[K]> {
  return DEFAULT_SYSTEM[key];
}

/**
 * Retorna toda la configuración del sistema como mapa.
 * TODO Fase 3: await db.systemConfig.findMany() → reducir a objeto
 */
export async function getAllSystemConfig(): Promise<SystemConfigMap> {
  return { ...DEFAULT_SYSTEM };
}
