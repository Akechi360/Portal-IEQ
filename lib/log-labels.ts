// lib/log-labels.ts
// Traduce los códigos crudos de auditoría (event + detail) a texto en español
// legible para los paneles de Logs de acceso y de Políticas (anomalías).

// Códigos exactos de "detail" -> texto legible.
const DETAIL_LABELS: Record<string, string> = {
  // Motivos de fallo de autenticación
  USER_NOT_FOUND: "Usuario no encontrado",
  INVALID_PASSWORD: "Contraseña incorrecta",
  INACTIVE_USER: "Usuario inactivo o bloqueado",
  STAFF_USER_NOT_FOUND_OR_INACTIVE: "Correo de personal no registrado o inactivo",
  // Anomalías del motor de políticas (lib/policy.ts)
  UNUSUAL_NIGHT_ACCESS: "Acceso en horario nocturno inusual",
  TRANSITO_TOO_MANY_SESSIONS: "Demasiadas sesiones simultáneas (tránsito)",
  REPEATED_VOUCHER_SAME_MAC: "Un mismo dispositivo usó varios vouchers",
};

// Etiquetas de eventos (LogEvent) legibles, para cuando no hay "detail".
const EVENT_LABELS: Record<string, string> = {
  AUTH_SUCCESS: "Acceso concedido",
  AUTH_FAIL: "Acceso rechazado",
  BLOCKED: "Bloqueado por política de seguridad",
  NEW_SESSION: "Nueva sesión",
  DISCONNECTED: "Desconexión",
  DOCTOR_APPROVED: "Médico aprobado",
  DOCTOR_REJECTED: "Médico rechazado",
  LIMIT_REACHED: "Límite de dispositivos alcanzado",
};

export function eventLabel(event?: string | null): string {
  if (!event) return "—";
  return EVENT_LABELS[event] ?? event.replace(/_/g, " ").toLowerCase();
}

/**
 * Convierte un "detail" crudo (o su ausencia) en texto entendible.
 * Maneja códigos exactos, listas de anomalías separadas por coma y los
 * formatos estructurados que genera el sistema (issued:, doctor:, staff:, etc.).
 */
export function humanizeDetail(detail?: string | null, event?: string | null): string {
  if (!detail) return eventLabel(event);

  // Lista de anomalías separadas por coma (evento BLOCKED).
  if (detail.includes(",")) {
    const parts = detail.split(",").map((d) => d.trim());
    if (parts.every((d) => DETAIL_LABELS[d])) {
      return parts.map((d) => DETAIL_LABELS[d]).join(" · ");
    }
  }

  // Código exacto conocido.
  if (DETAIL_LABELS[detail]) return DETAIL_LABELS[detail];

  // Formatos estructurados por prefijo.
  if (detail.startsWith("issued:")) {
    const [, tipo, code, ...nameParts] = detail.split(":");
    const nombre = nameParts.join(":");
    const t = tipo === "TRANSITO" ? "Tránsito" : "Paciente";
    return `Credencial ${t} emitida${code ? ` (${code})` : ""}${nombre ? ` para ${nombre}` : ""}`;
  }
  if (detail.startsWith("password_reset:")) {
    return `Contraseña cambiada para ${detail.split(":")[1] ?? ""}`.trim();
  }
  if (detail.startsWith("bulk_import:")) {
    const who = detail.includes("doctors") ? "médicos" : "personal";
    const m = detail.match(/created=(\d+):skipped=(\d+)/);
    return m
      ? `Importación masiva de ${who}: ${m[1]} creados, ${m[2]} omitidos`
      : `Importación masiva de ${who}`;
  }
  if (detail.startsWith("doctor:")) {
    const email = detail.split(":")[1] ?? "";
    if (detail.includes(":updated")) return `Médico actualizado (${email})`;
    if (detail.includes(":registered")) return `Médico registrado (${email})`;
    return `Médico ${email}`;
  }
  if (detail.startsWith("staff:")) {
    const val = detail.split(":")[1] ?? "";
    if (detail.includes(":updated")) return `Personal actualizado (${val})`;
    if (detail.includes(":registered")) return `Personal registrado (${val})`;
    return `Personal ${val}`;
  }
  if (detail.startsWith("credential:")) {
    const parts = detail.split(":");
    if (detail.includes("bindings_reset")) {
      return `Dispositivos liberados del voucher ${parts[1] ?? ""} (${parts[3] ?? "?"})`;
    }
    return `Credencial ${parts[1] ?? ""}`;
  }

  // Desconocido: devolver tal cual.
  return detail;
}
