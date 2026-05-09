# Backend Portal Cautivo - Clinica IEQ

## Descripcion general

Backend implementado con Next.js API Routes (App Router), TypeScript, Prisma ORM y PostgreSQL (modelo listo para siguiente etapa de conexion real).

Alcance de esta entrega:

- Endpoints en `app/api/*` para login, emision, listado, flujo medico, credencial propia y autorizacion Ruijie/WISPr/WiFiDog.
- Librerias reutilizables en `lib/*` para auth, acceso, auditoria, politicas y adaptador Ruijie.
- Modelo Prisma completo en `prisma/schema.prisma` y seed base en `prisma/seed.ts`.
- Contratos alineados con `docs/FRONTEND_README.md`.

## Estructura backend

```txt
/app/api
  /login/route.ts
  /issue/route.ts
  /list/route.ts
  /doctor/validate/route.ts
  /doctor/create/route.ts
  /user/own/route.ts
  /ruijie/authorize/route.ts
/lib
  auth.ts
  access.ts
  db.ts
  policy.ts
  ruijie.ts
  audit.ts
/prisma
  schema.prisma
  seed.ts
/types
  api.ts
```

## Endpoints implementados

### `POST /api/login`

- **Entrada**:
  - `username`
  - `passwordOrToken`
  - `clientMac`
  - `apMac`
  - `ssid`
  - `redirect`
- **Flujo**:
  - Busca usuario + grant activo.
  - Verifica password (`bcryptjs`) o token (`AccessGrant.token`).
  - Valida limite de dispositivos.
  - Registra/actualiza dispositivo por MAC (`lastSeen`).
  - Evalua politicas de seguridad y anomalias.
  - Registra auditoria (`LOGIN_TRY`, `LOGIN_OK`, `LOGIN_FAIL`).
- **Respuesta OK**:
  - `{ ok: true, nextUrl, sessionId }`
- **Respuesta error**:
  - `{ ok: false, message }`

### `POST /api/issue`

- **Entrada**:
  - `type: Paciente | Transito | Medico | Gerencia`
  - `personName`
  - `room?`
  - `operator`
  - `maxDevices`
  - `doctorInDatabase?`
  - `doctorData?`
- **Flujo**:
  - Determina ventana de acceso:
    - Paciente: `2 dias + 2h` (base configurable luego por policy).
    - Transito: `30 minutos`.
    - Medico/Gerencia: permanente.
  - Genera `username` y `token`.
  - Crea `User` y `AccessGrant`.
  - Audita `ISSUE_ACCESS` / `ISSUE_DOCTOR_ACCESS` / `ISSUE_MANAGEMENT_ACCESS`.
- **Respuesta**:
  - `{ ok: true, user, grant }`

### `GET /api/list`

- **Query**:
  - `role`, `status`, `search`, `page`, `limit`
- **Flujo**:
  - Lista usuarios con grants y dispositivos.
  - Calcula estado:
    - `Active`: grant vigente/permanente y usuario no bloqueado.
    - `Expired`: grant vencido.
    - `Blocked`: usuario bloqueado.
- **Respuesta**:
  - `{ ok: true, items, total, page, limit }`

### `POST /api/doctor/validate`

- **Entrada**:
  - `email`
- **Respuesta**:
  - Si existe: `{ ok: true, exists: true, detail }`
  - Si no existe: `{ ok: true, exists: false }`

### `POST /api/doctor/create`

- **Entrada**:
  - `nombre`, `especialidad`, `telefono`, `email`, `maxDevices`, `operator`
- **Flujo**:
  - Crea `User` rol MEDICO.
  - Crea grant permanente.
  - Audita `DOCTOR_CREATE`.
- **Respuesta**:
  - `{ ok: true, user, grant }`

### `GET /api/user/own?username=...`

- **Flujo**:
  - Carga usuario + grant mas reciente + dispositivos.
  - Calcula `sessionInfo` con estado y tiempo restante.
- **Respuesta**:
  - `{ ok: true, user, devices, sessionInfo }`

### `GET /api/ruijie/authorize`

- **Entrada (query adaptable)**:
  - `username`/`user`, `password`/`token`, `client_mac`, `ap_mac`, `ssid`, `redirect`
- **Flujo**:
  - Ejecuta login interno.
  - Detecta protocolo (`WISPr`, `WiFiDog`, `Unknown`).
  - Devuelve redirect 302 a URL permitida o denegada.
  - Audita `RUIJIE_AUTHORIZE`.

## Modelo Prisma (listo para DB real)

Modelos principales:

- `User`: identidad, rol, estado, datos de persona y credenciales.
- `AccessProfile`: plantilla de politicas por rol (duracion, maximo, permanencia).
- `AccessGrant`: concesion real de acceso (token/password, vigencia, max devices).
- `Device`: dispositivo por MAC con first/last seen, bloqueo y tags de anomalia.
- `AuditLog`: trazabilidad de acciones y metadata operacional.

Enums:

- `UserRole`: PACIENTE, TRANSITO, MEDICO, GERENCIA, ADMISION_OPERATOR, SISTEMAS.
- `UserStatus`: ACTIVE, INACTIVE, BLOCKED.
- `GrantType`: TOKEN, PASSWORD, MIXED.
- `AuditAction`: login, emision, doctor, policy, ruijie, etc.

## Politicas de seguridad aplicadas

En `lib/policy.ts`:

- Detecta `TRANSITO_TOO_MANY_DEVICES`.
- Detecta uso anomalo por volumen en `MEDICO/GERENCIA`.
- Detecta reutilizacion inusual de MAC en `PACIENTE`.
- Registra `POLICY_ANOMALY` en `AuditLog`.
- Puede bloquear usuario automaticamente (`USER_BLOCKED_BY_POLICY`) en casos criticos.

## Integracion con frontend actual

- El frontend puede reemplazar mocks por llamadas reales:
  - Login: `POST /api/login`
  - Emision: `POST /api/issue`
  - Listado: `GET /api/list`
  - Doctor validate/create: `POST /api/doctor/validate`, `POST /api/doctor/create`
  - Mi credencial: `GET /api/user/own?username=...`
- Los payloads estan tipados en `types/api.ts`.

## Comandos utiles

- `npm run prisma:generate`
- `npm run prisma:migrate:dev` (cuando se habilite DB real)
- `npm run prisma:seed`
- `npm run lint`
- `npm run build`

## Puesta en marcha rapida (DB real)

1. Copiar entorno:
   - `cp .env.example .env` (Linux/macOS)
   - `copy .env.example .env` (Windows)
2. Ajustar `DATABASE_URL` en `.env`.
3. Generar cliente Prisma:
   - `npm run prisma:generate`
4. Crear migracion inicial:
   - `npm run prisma:migrate:dev -- --name init`
5. Cargar datos base:
   - `npm run prisma:seed`
6. Levantar app:
   - `npm run dev`

## Notas operativas

- La migracion no se ejecuta automaticamente para evitar cambios no deseados en tu entorno.
- El seed crea perfiles de acceso y un usuario base de sistemas (`sistemas_admin`).
- Si usas Windows PowerShell, recuerda habilitar variables de entorno en sesion antes de comandos avanzados si aplica.

## Siguiente paso recomendado

1. Definir `DATABASE_URL` de PostgreSQL.
2. Ejecutar migracion inicial Prisma.
3. Sembrar perfiles/usuarios base.
4. Conectar frontend para reemplazar `mock-data` por estas APIs.
