// ─── lib/validators.ts ────────────────────────────────────────────────────────
// Schemas Zod reutilizables para todos los route handlers.
// Importar directamente en cada handler: import { guestLoginSchema } from '@/lib/validators'

import { z } from "zod";

// ─── Portal WiFi ──────────────────────────────────────────────────────────────

/** POST /api/auth/guest */
export const guestLoginSchema = z.object({
  voucherCode: z.string().min(3, "El código de voucher es requerido").trim(),
  mac: z.string().optional(), // se toma de cookie portal_mac si no viene en body
});

/** POST /api/auth/doctor */
export const doctorLoginSchema = z.object({
  voucherCode: z.string().min(3, "El código de voucher es requerido").trim(),
  mac: z.string().optional(),
});

/** POST /api/auth/staff-wifi */
export const staffLoginSchema = z.object({
  email: z.string().email("Correo institucional inválido").trim(),
  mac: z.string().optional(),
});

// ─── Panel Interno ────────────────────────────────────────────────────────────

/** POST /api/auth/admin (handler existente) */
export const adminLoginSchema = z.object({
  username: z.string().min(1, "Usuario requerido").trim(),
  password: z.string().min(1, "Contraseña requerida"),
});

// ─── Credenciales ─────────────────────────────────────────────────────────────

/** POST /api/admin/credentials/issue */
export const issueCredentialSchema = z.object({
  tipo: z.enum(["PACIENTE", "TRANSITO"]),
  nombre: z.string().min(2, "Nombre requerido (mín. 2 caracteres)").trim(),
  habitacion: z.string().trim().optional(),
  maxDevices: z.number().int().min(1).max(5).default(2),
  diasEstancia: z.number().int().min(1).optional(),
  issuerId: z.string().min(1, "ID del emisor requerido"),
});

export type IssueCredentialInput = z.infer<typeof issueCredentialSchema>;

// ─── Médicos ──────────────────────────────────────────────────────────────────

/** POST /api/admin/doctors */
export const doctorCreateSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido").trim(),
  especialidad: z.string().min(2).optional(),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(7, "Teléfono inválido").optional(),
});

export type DoctorCreateInput = z.infer<typeof doctorCreateSchema>;

// ─── Webhooks ─────────────────────────────────────────────────────────────────

/** POST /api/webhooks/clinic */
export const webhookClinicSchema = z.object({
  event: z.string().min(1, "El campo 'event' es requerido"),
  timestamp: z.string().datetime().optional(),
  // Zod 4: record requiere (keyType, valueType). Usamos string keys y unknown values.
  payload: z.record(z.string(), z.unknown()).optional(),
});

export type WebhookClinicInput = z.infer<typeof webhookClinicSchema>;

// ─── Ruijie ───────────────────────────────────────────────────────────────────

/** GET /api/ruijie/callback */
export const ruijieCallbackSchema = z.object({
  mac: z.string().optional(),
  ip: z.string().optional(),
  ssid: z.string().optional(),
  redirect: z.string().optional(),
  username: z.string().optional(),
  // Parámetros WISPr / WiFiDog opcionales
  gw_id: z.string().optional(),
  gw_address: z.string().optional(),
  WISPrVersion: z.string().optional(),
});
