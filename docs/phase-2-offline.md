# Phase 2 Offline — Estado del Backend

> Documento actualizado: 2026-05-11  
> Stack: Next.js 15 App Router · TypeScript · Tailwind · Prisma · bcryptjs · Zod  
> Estado: **✅ COMPLETADO OFFLINE** — Compila sin errores nuevos. Sin DB real, sin Docker, sin Ruijie físico.

---

## Estado Actual

El backend está preparado para compilar y funcionar en modo offline.  
Todos los handlers responden con mock data. Ninguna llamada real a DB ni gateway se ejecuta.

### ¿Qué funciona ahora?

| Componente | Estado | Notas |
|---|---|---|
| `lib/ruijie.ts` | ✅ Mock | 6 stubs tipados. Funciones existentes intactas. |
| `lib/auth.ts` | ✅ Alineado | hashPassword, comparePassword, generateVoucherCode, generateToken |
| `lib/audit.ts` | ✅ Alineado | logAccess → AccessLog. Falla silencioso sin DB. |
| `lib/access.ts` | ✅ Alineado | adminLogin, guestLogin, doctorLogin — todos mock offline |
| `lib/policy.ts` | ✅ Stub | evaluatePolicy → siempre `{ anomalies: [], blocked: false }` |
| `lib/config.ts` | ✅ Nuevo | getPortalConfig, getSystemConfig, getAllSystemConfig — valores hardcoded |
| `lib/validators.ts` | ✅ Nuevo | Schemas Zod centralizados para todos los handlers |
| `lib/prisma.ts` | ✅ Nuevo | Re-export de `lib/db.ts` para unificar import path |
| `prisma/schema.prisma` | ✅ Fuente de verdad | Admin, Credential, Doctor, PortalConfig, SystemConfig, Session, AccessLog |
| `prisma/seed.ts` | ✅ Listo | Reescrito para schema clínico. Requiere DB para ejecutar. |
| Visual / Middleware | ✅ Intacto | No modificado en esta fase. |

---

## Mapa de Endpoints

### ✅ Implementados (Fase 2 Offline)

| Método | Ruta | Estado | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/guest` | Mock | Login voucher paciente/tránsito |
| `POST` | `/api/auth/doctor` | Mock | Login voucher permanente médico |
| `GET` | `/api/ruijie/token` | Mock | Token del gateway (`MOCK_TOKEN_OFFLINE`) |
| `GET` | `/api/ruijie/callback` | Mock | Callback del gateway tras redirección |
| `POST` | `/api/admin/credentials/issue` | Mock | Emitir credencial WiFi (PACIENTE/TRANSITO) |
| `GET` | `/api/admin/doctors` | Mock | Listar médicos registrados |
| `POST` | `/api/admin/doctors` | Mock | Registrar nuevo médico + generar voucher |
| `POST` | `/api/webhooks/clinic` | Mock | Webhook HIS/ADT → 202 Accepted |

### ⚠️ Existentes (no tocados en Fase 2)

| Método | Ruta | Estado | Notas |
|---|---|---|---|
| `GET` | `/api/ruijie/authorize` | Legacy | Usa schema viejo. No modificar hasta Fase 3. |
| `POST` | `/api/issue` | Legacy | Usa schema viejo. No modificar hasta Fase 3. |
| `GET/POST` | `/api/auth/admin/*` | Existente | Handlers de login del panel interno |
| `GET` | `/api/auth/me` | Existente | Sesión actual del panel |
| `POST` | `/api/auth/logout` | Existente | Cerrar sesión del panel |

### 🔴 Pendientes (Fase 3 — Oficina)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/admin/credentials` | Listar credenciales emitidas con filtros |
| `PATCH` | `/api/admin/credentials/[id]` | Revocar / extender credencial |
| `GET` | `/api/admin/sessions` | Sesiones WiFi activas (desde Ruijie real) |
| `GET` | `/api/admin/logs` | Historial de AccessLog |
| `GET/PUT` | `/api/admin/config/portal` | Leer/actualizar PortalConfig |
| `GET/PUT` | `/api/admin/config/system` | Leer/actualizar SystemConfig |
| `PATCH` | `/api/admin/doctors/[id]` | Activar / desactivar médico |
| `DELETE` | `/api/admin/doctors/[id]` | Eliminar médico y revocar voucher |

---

## Conexiones Pendientes — Fase 3

### 1. Base de Datos (Supabase / PostgreSQL + Docker)

- [ ] Definir `DATABASE_URL` y `DIRECT_URL` en `.env`
- [ ] Ejecutar: `npm run prisma:generate`
- [ ] Ejecutar: `npm run prisma:migrate:dev -- --name init`
- [ ] Ejecutar: `npm run prisma:seed`
- [ ] En cada función marcada `TODO Fase 3`: descomentar el bloque `db.*` y eliminar el bloque `MOCK OFFLINE`

**Archivos con TODOs de DB:**

| Archivo | Función | Qué conectar |
|---|---|---|
| `lib/access.ts` | `adminLogin()` | `db.admin.findUnique()` |
| `lib/access.ts` | `guestLogin()` | `db.credential.findUnique()` + `db.session.create()` |
| `lib/access.ts` | `doctorLogin()` | `db.doctor.findUnique()` + `db.session.create()` |
| `lib/config.ts` | `getPortalConfig()` | `db.portalConfig.findFirst()` |
| `lib/config.ts` | `getSystemConfig()` | `db.systemConfig.findUnique()` |
| `lib/policy.ts` | `evaluatePolicy()` | `db.session.count()` + `db.session.groupBy()` |
| `app/api/admin/credentials/issue/route.ts` | `POST` | `db.credential.create()` |
| `app/api/admin/doctors/route.ts` | `GET` / `POST` | `db.doctor.findMany()` / `db.doctor.create()` |

### 2. Gateway Ruijie (Red local de la clínica)

- [ ] Definir en `.env`:
  ```
  RUIJIE_GATEWAY_URL=http://<ip-gateway>:<puerto>
  RUIJIE_GATEWAY_USER=<usuario>
  RUIJIE_GATEWAY_PASS=<password>
  RUIJIE_GROUP_GUEST=<id-grupo-invitados>
  RUIJIE_GROUP_MEDICOS=<id-grupo-medicos>
  ```
- [ ] En `lib/ruijie.ts`: reemplazar el cuerpo de cada stub con la llamada HTTP real al gateway
- [ ] Verificar protocolo del gateway (WISPr / WiFiDog / REST API propia)
- [ ] Probar `getRuijieToken()` y que devuelva un token válido con TTL

**Stubs a conectar:**

| Función | TODO |
|---|---|
| `getRuijieToken()` | `POST RUIJIE_GATEWAY_URL/token` |
| `authorizeClient()` | `POST RUIJIE_GATEWAY_URL/authorize` |
| `createVoucher()` | `POST RUIJIE_GATEWAY_URL/vouchers` |
| `getDevices()` | `GET RUIJIE_GATEWAY_URL/devices` |
| `getSessions()` | `GET RUIJIE_GATEWAY_URL/sessions` |
| `getUserGroups()` | `GET RUIJIE_GATEWAY_URL/usergroups` |

### 3. Webhooks de la Clínica (HIS/ADT)

- [ ] Definir `WEBHOOK_CLINIC_SECRET` en `.env` para verificación HMAC
- [ ] En `app/api/webhooks/clinic/route.ts`: implementar `verifyHmac()` y el switch de eventos
- [ ] Eventos a procesar: `PATIENT_ADMITTED`, `PATIENT_DISCHARGED`, `ROOM_CHANGE`

---

## Checklist para Oficina

### Entorno

- [ ] Levantar PostgreSQL con Docker: `docker-compose up -d db`
- [ ] Verificar que `.env` tiene `DATABASE_URL` correcta
- [ ] Verificar conectividad de red al gateway Ruijie (ping a IP del gateway)
- [ ] Verificar que el gateway responde en el puerto configurado

### Base de Datos

- [ ] `npm run prisma:generate` — regenerar cliente Prisma
- [ ] `npm run prisma:migrate:dev -- --name init` — crear tablas
- [ ] `npm run prisma:seed` — cargar datos base
- [ ] Verificar en DB que existen: 2 Admins, 1 PortalConfig, 5 SystemConfig, 2 Doctors, 2 Credentials

### Backend

- [ ] Quitar bloques `MOCK OFFLINE` en `lib/access.ts`
- [ ] Quitar bloques mock en `app/api/admin/credentials/issue/route.ts`
- [ ] Quitar bloques mock en `app/api/admin/doctors/route.ts`
- [ ] Activar política de seguridad real en `lib/policy.ts`
- [ ] Activar `getPortalConfig()` y `getSystemConfig()` contra DB en `lib/config.ts`

### Ruijie

- [ ] Conectar `getRuijieToken()` al gateway real
- [ ] Probar `authorizeClient()` con un MAC de prueba
- [ ] Verificar que el portal cautivo redirige correctamente tras autorización
- [ ] Probar callback en `/api/ruijie/callback` con el gateway real

### Verificación Final

- [ ] `npm run lint` — sin errores
- [ ] `npm run build` — compila sin errores
- [ ] `POST /api/auth/guest` con voucher real → acceso concedido
- [ ] `POST /api/auth/doctor` con voucher real → acceso médico concedido
- [ ] Portal cautivo Ruijie redirige a `/login/guest?ssid=...`
- [ ] Panel de admisión emite credencial y aparece en DB

---

## Estructura de Archivos Creados / Modificados en Fase 2

```
lib/
  auth.ts          ← REESCRITO  (schema clínico: no Prisma models)
  audit.ts         ← REESCRITO  (AccessLog + LogEvent)
  access.ts        ← REESCRITO  (Admin / Credential / Doctor)
  policy.ts        ← SIMPLIFICADO (stub offline)
  ruijie.ts        ← AMPLIADO   (6 stubs nuevos + funciones existentes)
  config.ts        ← NUEVO      (PortalConfig + SystemConfig offline)
  validators.ts    ← NUEVO      (Zod schemas centralizados)
  prisma.ts        ← NUEVO      (re-export de lib/db.ts)

app/api/
  auth/
    guest/route.ts         ← NUEVO
    doctor/route.ts        ← NUEVO
  ruijie/
    token/route.ts         ← NUEVO
    callback/route.ts      ← NUEVO
    authorize/route.ts     ← INTACTO (legacy)
  admin/
    credentials/issue/route.ts  ← NUEVO
    doctors/route.ts            ← NUEVO
  webhooks/
    clinic/route.ts        ← NUEVO

prisma/
  schema.prisma    ← INTACTO (fuente de verdad)
  seed.ts          ← REESCRITO (Admin / Doctor / Credential / PortalConfig / SystemConfig)

docs/
  phase-2-offline.md  ← NUEVO (este archivo)
```

---

## Credenciales de Demo

> [!IMPORTANT]  
> Estas credenciales son solo para desarrollo offline.  
> Cambiar antes de cualquier despliegue real.

| Rol | Usuario | Password |
|---|---|---|
| SUPERADMIN | `admin_sistemas` | `Sistemas#2026` |
| OPERADOR | `admin_operador` | `Admision#2026` |

| Tipo | Voucher WiFi |
|---|---|
| Paciente (demo) | `IEQ-DEMO-PAC1` |
| Tránsito (demo) | `IEQ-DEMO-TRN1` |
| Médico 1 (demo) | `IEQ-AA11-BB22` |
| Médico 2 (demo) | `IEQ-CC33-DD44` |
