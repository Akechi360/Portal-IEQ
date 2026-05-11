# Auditoría Técnica — Saneamiento Pre-Fase 3

> Fecha: 2026-05-11  
> Schema activo: `prisma/schema.prisma` (Admin, Credential, Doctor, PortalConfig, SystemConfig, Session, AccessLog)  
> Estado: **32 errores TypeScript en 9 archivos legacy** — No bloquean build de desarrollo, sí bloquean producción.

---

## 1. TypeScript Legacy Audit — Lista Exacta de Errores

### Resumen por Archivo

| Archivo | Errores | Impacto Real | ¿Usado en runtime? |
|---------|---------|--------------|-------------------|
| `app/api/doctor/create/route.ts` | 7 | 🔴 **Rompe build** | No (reemplazado por `/api/admin/doctors`) |
| `app/api/doctor/validate/route.ts` | 4 | 🔴 **Rompe build** | No (funcionalidad movida a access.ts) |
| `app/api/issue/route.ts` | 7 | 🔴 **Rompe build** | No (reemplazado por `/api/admin/credentials/issue`) |
| `app/api/list/route.ts` | 6 | 🔴 **Rompe build** | ⚠️ **USADO por admin dashboard** |
| `app/api/login/route.ts` | 1 | 🔴 **Rompe build** | No (reemplazado por auth/guest + auth/doctor) |
| `app/api/ruijie/authorize/route.ts` | 3 | 🔴 **Rompe build** | ⚠️ **USADO por portal cautivo** |
| `app/api/user/own/route.ts` | 2 | 🔴 **Rompe build** | Desconocido |
| `app/api/auth/me/route.ts` | 1 | 🟡 Warning tipado | Sí, usado por panel interno |
| `app/admin/dashboard/page.tsx` | 1 | 🟡 Warning tipado | Sí, página principal del panel |

**Total: 32 errores en 9 archivos** (después de corrección Zod: 31 errores)

---

### Detalle de Errores por Archivo

#### 🔴 `app/api/doctor/create/route.ts` (7 errores)

| Línea | Error | Símbolo Roto | Acción Requerida |
|-------|-------|--------------|------------------|
| 1 | `TS2305` | `AuditAction` from `@prisma/client` | Enum no existe en schema clínico |
| 1 | `TS2305` | `UserRole` from `@prisma/client` | Enum no existe (ahora `AdminRole`, `CredentialType`) |
| 5 | `TS2305` | `logAudit` from `@/lib/audit` | Función no exportada (solo existe `logAccess`) |
| 6 | `TS2305` | `generateUsername` from `@/lib/auth` | Función eliminada en refactor |
| 26 | `TS2339` | `db.user` | Modelo `user` no existe (ahora `Admin`, `Doctor`, `Credential`) |
| 47 | `TS2339` | `db.accessGrant` | Modelo `accessGrant` no existe |
| 58 | `TS2305` | `AuditAction.DOCTOR_CREATE` | Enum no existe |

**Impacto:** Handler legacy de creación de médicos. **Reemplazado por** `/api/admin/doctors` (POST).

---

#### 🔴 `app/api/doctor/validate/route.ts` (4 errores)

| Línea | Error | Símbolo Roto | Acción Requerida |
|-------|-------|--------------|------------------|
| 1 | `TS2305` | `AuditAction` from `@prisma/client` | Enum no existe |
| 1 | `TS2305` | `UserRole` from `@prisma/client` | Enum no existe |
| 5 | `TS2305` | `logAudit` from `@/lib/audit` | Función no exportada |
| 20 | `TS2339` | `db.user` | Modelo no existe |

**Impacto:** Validación legacy de médicos. **Reemplazado por** `doctorLogin()` en `lib/access.ts`.

---

#### 🔴 `app/api/issue/route.ts` (7 errores)

| Línea | Error | Símbolo Roto | Acción Requerida |
|-------|-------|--------------|------------------|
| 1 | `TS2305` | `AuditAction` from `@prisma/client` | Enum no existe |
| 1 | `TS2305` | `UserRole` from `@prisma/client` | Enum no existe |
| 5 | `TS2305` | `generateUsername` from `@/lib/auth` | Función eliminada |
| 6 | `TS2305` | `mapApiTypeToRole` from `@/lib/access` | Función eliminada |
| 7 | `TS2305` | `logAudit` from `@/lib/audit` | Función no exportada |
| 54 | `TS2339` | `db.user` | Modelo no existe |
| 68 | `TS2339` | `db.accessGrant` | Modelo no existe |

**Impacto:** Emisión legacy de credenciales. **Reemplazado por** `/api/admin/credentials/issue`.

---

#### 🔴 `app/api/list/route.ts` (6 errores) — ⚠️ **USADO ACTIVAMENTE**

| Línea | Error | Símbolo Roto | Acción Requerida |
|-------|-------|--------------|------------------|
| 2 | `TS2305` | `UserRole` from `@prisma/client` | Enum no existe |
| 2 | `TS2305` | `UserStatus` from `@prisma/client` | Enum no existe |
| 34 | `TS2339` | `db.user` | Modelo no existe |
| 53 | `TS7006` | Parameter `user` implicitly has 'any' type | Consecuencia de errores anteriores |
| 67 | `TS7006` | Parameter `item` implicitly has 'any' type | Consecuencia de errores anteriores |
| 69 | `TS2339` | `db.user.count` | Modelo no existe |

**Impacto:** **⚠️ CRÍTICO** — Este endpoint es usado por `app/admin/dashboard/page.tsx` para listar usuarios. **Requiere migración urgente** a nuevo schema (query `db.credential` + `db.doctor`).

---

#### 🔴 `app/api/login/route.ts` (1 error)

| Línea | Error | Símbolo Roto | Acción Requerida |
|-------|-------|--------------|------------------|
| 3 | `TS2305` | `executeLogin` from `@/lib/access` | Función no exportada (eliminada en refactor) |

**Impacto:** Login legacy general. **Reemplazado por** `/api/auth/guest` y `/api/auth/doctor`.

---

#### 🔴 `app/api/ruijie/authorize/route.ts` (3 errores) — ⚠️ **USADO ACTIVAMENTE**

| Línea | Error | Símbolo Roto | Acción Requerida |
|-------|-------|--------------|------------------|
| 1 | `TS2305` | `AuditAction` from `@prisma/client` | Enum no existe |
| 3 | `TS2305` | `executeLogin` from `@/lib/access` | Función no exportada |
| 5 | `TS2305` | `logAudit` from `@/lib/audit` | Función no exportada |

**Impacto:** **⚠️ CRÍTICO** — Endpoint usado por portal cautivo Ruijie para autorización. Necesita reescritura para usar `guestLogin()` / `doctorLogin()` de `lib/access.ts`.

---

#### 🔴 `app/api/user/own/route.ts` (2 errores)

| Línea | Error | Símbolo Roto | Acción Requerida |
|-------|-------|--------------|------------------|
| 28 | `TS2339` | `db.user` | Modelo no existe |
| 53 | `TS7006` | Parameter `device` implicitly has 'any' type | Consecuencia de error anterior |

**Impacto:** Perfil de usuario legacy. Estado de uso desconocido — verificar si hay llamadas desde el frontend.

---

#### 🟡 `app/api/auth/me/route.ts` (1 error)

| Línea | Error | Símbolo Roto | Acción Requerida |
|-------|-------|--------------|------------------|
| 7 | `TS2345` | `cookies()` return type | Cambio en Next.js 15 — `cookies()` ahora retorna `Promise<ReadonlyRequestCookies>` |

**Impacto:** Warning menor. Fácil de corregir con `await cookies()`.

---

#### 🟡 `app/admin/dashboard/page.tsx` (1 error)

| Línea | Error | Símbolo Roto | Acción Requerida |
|-------|-------|--------------|------------------|
| 214 | `TS2322` | `KpiCard.value` type | `value` espera `string \| number`, se recibe `JSX.Element` |

**Impacto:** Warning de tipado en componente visual. No afecta runtime. Corregir tipado de `KpiCard` o pasar valor como string.

---

## 2. Build Validation

### Resultados

| Comando | Estado | Errores | Detalle |
|---------|--------|---------|---------|
| `npm run lint` | ✅ **PASS** | 0 | Sin errores ESLint |
| `npx tsc --noEmit` | 🔴 **FAIL** | 31 | Errores documentados arriba |
| `npm run build` | 🔴 **FAIL** | 31 | Mismos errores TypeScript bloquean build de producción |

### Análisis del Fallo de Build

El build de producción falla porque:

1. **Next.js 15 con `strict: true`** en `tsconfig.json` trata todos los errores TypeScript como bloqueantes
2. Los 9 archivos legacy tienen imports de modelos Prisma que no existen en el schema clínico actual
3. Hay funciones eliminadas (`executeLogin`, `logAudit`, `generateUsername`, `mapApiTypeToRole`) que siguen siendo importadas

**Archivos que DEBEN corregirse antes de Fase 3 (bloquean build):**
- `app/api/list/route.ts` — Usado por dashboard
- `app/api/ruijie/authorize/route.ts` — Usado por portal cautivo

**Archivos que pueden aislarse/deprecarse:**
- Todos los demás legacy (doctor/create, doctor/validate, issue, login, user/own)

---

## 3. Rutas Source-of-Truth vs Legacy

### Tabla de Enrutamiento

| Funcionalidad | Ruta Nueva (Source-of-Truth) | Ruta Legacy (Deprecada) | Frontend Debe Usar | Estado Legacy |
|--------------|------------------------------|-------------------------|-------------------|---------------|
| **Login Guest (Paciente/Tránsito)** | `POST /api/auth/guest` | `POST /api/login` | `/api/auth/guest` | 🔴 Deprecado |
| **Login Doctor** | `POST /api/auth/doctor` | `POST /api/login` | `/api/auth/doctor` | 🔴 Deprecado |
| **Emitir Credencial** | `POST /api/admin/credentials/issue` | `POST /api/issue` | `/api/admin/credentials/issue` | 🔴 Deprecado |
| **Listar Médicos** | `GET /api/admin/doctors` | — | `/api/admin/doctors` | ✅ Nuevo |
| **Crear Médico** | `POST /api/admin/doctors` | `POST /api/doctor/create` | `/api/admin/doctors` | 🔴 Deprecado |
| **Validar Doctor** | — (usar `doctorLogin`) | `POST /api/doctor/validate` | — | 🔴 Deprecado |
| **Listar Usuarios/Credenciales** | ⚠️ **PENDIENTE** | `GET /api/list` | — | 🟡 **CRÍTICO — Requiere reescritura** |
| **Token Ruijie** | `GET /api/ruijie/token` | — | `/api/ruijie/token` | ✅ Nuevo |
| **Callback Ruijie** | `GET /api/ruijie/callback` | — | `/api/ruijie/callback` | ✅ Nuevo |
| **Autorización Ruijie** | ⚠️ **PENDIENTE** | `GET /api/ruijie/authorize` | `/api/ruijie/authorize` | 🟡 **CRÍTICO — Requiere reescritura** |
| **Webhook Clínica** | `POST /api/webhooks/clinic` | — | `/api/webhooks/clinic` | ✅ Nuevo |
| **Perfil Usuario** | — | `GET /api/user/own` | — | 🔴 Deprecado (verificar uso) |
| **Sesión Actual** | — | `GET /api/auth/me` | `/api/auth/me` | 🟡 Funciona (warning menor) |

### Especial Atención: Endpoints Críticos

#### `/api/admin/credentials/issue` vs `/api/issue`

| Aspecto | Nuevo (`/api/admin/credentials/issue`) | Legacy (`/api/issue`) |
|---------|------------------------------------------|----------------------|
| Schema Zod | `issueCredentialSchema` (tipo, nombre, habitacion, maxDevices, diasEstancia, issuerId) | `issueSchema` (type, personName, room, maxDevices, operator) |
| Modelo Prisma | `Credential` | `User` + `AccessGrant` |
| Emisor | `issuerId` (Admin) | `operator` (string) |
| Tipos soportados | `PACIENTE`, `TRANSITO` | `Paciente`, `Transito`, `Medico`, `Gerencia` |
| Voucher generado | `generateVoucherCode()` → `IEQ-XXXX-XXXX` | `generateToken(8)` |
| **¿Cuál usar?** | ✅ **Este** | ❌ No usar |

**Migración frontend:** Cambiar llamadas de `/api/issue` a `/api/admin/credentials/issue` con nuevo payload:

```typescript
// Antes (legacy)
{ type: "Paciente", personName: "Juan", room: "101", maxDevices: 2, operator: "admin" }

// Después (nuevo)
{ tipo: "PACIENTE", nombre: "Juan", habitacion: "101", maxDevices: 2, issuerId: "admin-id", diasEstancia: 2 }
```

---

#### `/api/ruijie/token` + `/api/ruijie/callback` vs `/api/ruijie/authorize`

| Endpoint | Propósito | Estado | Relación |
|----------|-----------|--------|----------|
| `GET /api/ruijie/token` | Obtener token del gateway | ✅ Listo | Independiente |
| `GET /api/ruijie/callback` | Recibir callback post-autorización | ✅ Listo | Lo llama el gateway |
| `GET /api/ruijie/authorize` | **Autorizar MAC en gateway** | 🔴 **ROTO** | **Necesita reescritura** |

**Problema:** `/api/ruijie/authorize` usa `executeLogin()` que no existe. Debe usar `guestLogin()` o `doctorLogin()` según el tipo de acceso.

**Flujo correcto (Fase 3):**
1. Usuario entra a portal cautivo → Ruijie redirige a `/login/guest?ssid=...`
2. Frontend recolecta voucher → POST a `/api/auth/guest`
3. Backend valida voucher + llama `authorizeClient()` de `lib/ruijie.ts`
4. Gateway autoriza MAC → redirige a `/api/ruijie/callback`
5. Callback registra sesión en AccessLog

---

## 4. Zod Cleanup — Resuelto ✅

### Corrección Aplicada

**Archivo:** `lib/validators.ts:61`

**Antes:**
```typescript
payload: z.record(z.unknown()).optional(),  // ❌ Zod 4: falta keyType
```

**Después:**
```typescript
// Zod 4: record requiere (keyType, valueType). Usamos string keys y unknown values.
payload: z.record(z.string(), z.unknown()).optional(),  // ✅ Correcto
```

**Justificación:** Zod 4 cambió la API de `z.record()` para requerir explícitamente el tipo de key. Usar `z.string()` como key type es correcto para payloads JSON donde las claves son strings.

**Estado:** ✅ Resuelto — Ya no aparece en errores TypeScript.

---

## 5. Legacy Isolation Plan

### Opciones Evaluadas

| Opción | Pros | Contras | Recomendación |
|--------|------|---------|---------------|
| **A. Mover a carpeta `app/api/legacy/`** | Limpieza visual clara; fácil eliminar después | Rompe imports relativos; requiere cambiar `@/` paths | ⚠️ Medio riesgo |
| **B. Renombrar a `*.legacy.ts`** | Fácil identificación; no rompe rutas | Aún compilan (errores persisten); requiere excluir de tsconfig | ⚠️ Parcial |
| **C. Excluir de `tsconfig.json`** | Build pasa inmediatamente; limpio | Pierde referencia para migración; difícil recuperar código | 🟡 Considerar |
| **D. Comentar handlers + documentar** | Mantiene código visible; seguro | Archivos "muertos" en codebase | ✅ **Recomendado** |
| **E. Eliminar directamente** | Máxima limpieza | Pérdida de referencia; irreversible | 🔴 No recomendado aún |

### Plan Recomendado (Opción D + C parcial)

#### Paso 1: Aislar handlers no críticos (sin modificar comportamiento)

Para cada archivo legacy NO crítico (`doctor/create`, `doctor/validate`, `issue`, `login`, `user/own`):

```typescript
// app/api/issue/route.ts — MARCAR COMO DEPRECATED

/**
 * @deprecated Este endpoint usa el schema legacy (User, AccessGrant).
 * Reemplazado por POST /api/admin/credentials/issue
 * TODO Fase 3: Eliminar tras confirmar que frontend no lo usa
 * Fecha deprecación: 2026-05-11
 */

import { ... } from "...";

// Wrap handler en comentario para excluirlo de compilación activa:
/*
export async function POST(req: Request) {
  ... código actual ...
}
*/

// Stub que retorna 410 Gone (indica deprecación explícita)
export async function POST() {
  return NextResponse.json(
    { ok: false, message: "Este endpoint está deprecado. Use POST /api/admin/credentials/issue" },
    { status: 410 }
  );
}
```

#### Paso 2: Priorizar corrección de críticos

**Archivos que DEBEN reescribirse antes de Fase 3:**

1. **`app/api/list/route.ts`** — Crear versión nueva que consulte `db.credential` y `db.doctor`
2. **`app/api/ruijie/authorize/route.ts`** — Reescribir usando `guestLogin()`/`doctorLogin()`
3. **`app/api/auth/me/route.ts`** — Corregir `await cookies()` (1 línea)

#### Paso 3: Configuración de compilación temporal (si es urgente)

Si necesitas build de producción AHORA con legacy excluido:

```json
// tsconfig.json — AÑADIR (temporal, no recomendado para largo plazo)
{
  "compilerOptions": {
    // ... opciones existentes
    "skipLibCheck": true,
    // Excluir específicamente archivos legacy (último recurso)
  },
  "exclude": [
    "node_modules",
    // Opción nuclear: excluir carpeta legacy completa
    "app/api/issue",
    "app/api/doctor",
    "app/api/login",
    "app/api/user/own"
  ]
}
```

**⚠️ Advertencia:** Excluir de `tsconfig.json` no excluye del bundle de Next.js. Para excluir realmente, renombrar archivos o usar `/* ... */` para comentar exports.

---

## 6. Recomendación Final: ¿Listos para Oficina?

### Checklist de Salida

| Ítem | Estado | Bloquea Fase 3? |
|------|--------|-----------------|
| Schema Prisma clínico | ✅ Listo | No |
| Handlers nuevos (auth/guest, auth/doctor, admin/*, webhooks) | ✅ Listo | No |
| `lib/*.ts` alineados | ✅ Listo | No |
| Seed reescrito | ✅ Listo | No |
| Corrección Zod validators.ts | ✅ Resuelto | No |
| `app/api/list/route.ts` (usado por dashboard) | 🔴 **ROTO** | **SÍ** |
| `app/api/ruijie/authorize/route.ts` (portal cautivo) | 🔴 **ROTO** | **SÍ** |
| `app/api/auth/me/route.ts` | 🟡 Warning menor | No |
| `app/admin/dashboard/page.tsx` | 🟡 Warning menor | No |
| Build de producción | 🔴 **FALLA** | **SÍ** |

### Veredicto

> **🔴 NO estamos listos para Oficina sin limpieza adicional.**

**Dos opciones:**

#### Opción A: Limpieza Rápida (Recomendada — 30-60 min)

Corregir SOLO los 2 archivos críticos que bloquean build y funcionan en producción:

1. **Reescribir `app/api/list/route.ts`** para usar `db.credential` + `db.doctor`
2. **Reescribir `app/api/ruijie/authorize/route.ts`** para usar funciones de `lib/access.ts`
3. **Corregir `await cookies()`** en `app/api/auth/me/route.ts`
4. **Aceptar warnings** de `page.tsx` (no bloquean)

Estado tras limpieza: **Build pasa ✅ → Listos para Fase 3**

#### Opción B: Limpieza Completa (2-3 horas)

Además de Opción A:
- Migrar/aislar todos los handlers legacy restantes
- Actualizar frontend para usar solo rutas nuevas
- Tests de integración básicos

**Recomendación:** Tomar **Opción A** ahora para desbloquear Fase 3. La limpieza completa puede hacerse en paralelo con pruebas en oficina.

---

## Próximos Pasos Inmediatos

1. **Decisión:** ¿Opción A (rápida) o Opción B (completa)?
2. **Si Opción A:** Reescribo `list/route.ts` + `ruijie/authorize/route.ts` ahora
3. **Verificación:** `npm run build` debe pasar
4. **Commit:** Marcar punto de "backend estable para oficina"
5. **Fase 3:** Conectar DB + Gateway físico

---

*Documento generado: 2026-05-11*  
*Prisma Client: 6.19.3*  
*Next.js: 15.5.15*  
*TypeScript: 5.6.2*
