# Frontend Portal Cautivo - Clinica IEQ

## Descripcion general

Frontend en Next.js (App Router) + TypeScript + Tailwind CSS para representar los flujos de acceso WiFi de la clinica:

- Portal publico de invitados (`/guest`) para Paciente, Transito, Medico y referencia de Gerencia.
- Area interna (`/admin/*`) para Dashboard, emision de credenciales y listado de usuarios/sesiones.
- Vista medica dedicada (`/doctor`) y vista de credencial propia (`/user/own`).

Esta version es UI-only (SPA estatica), lista para conectar con backend Node/Next + Prisma + PostgreSQL.

## Estructura de carpetas

```txt
/app
  /admin
    /dashboard/page.tsx
    /issue/page.tsx
    /list/page.tsx
  /doctor/page.tsx
  /guest/page.tsx
  /user/own/page.tsx
  /lib/styles.ts
  globals.css
  layout.tsx
  page.tsx
/components
  /layout
    SiteHeader.tsx
    SiteFooter.tsx
  /ui
    Button.tsx
    Card.tsx
    Input.tsx
    Modal.tsx
    Select.tsx
    Table.tsx
/lib
  mock-data.ts
/types
  index.ts
/docs
  FRONTEND_README.md
```

## Rutas principales

- `/guest`: portal cautivo publico con formulario, selector de rol y placeholders de red (`client_mac`, `ap_mac`, `ssid`, `redirect`).
- `/admin/dashboard`: KPIs visuales, barras por rol y acciones rapidas.
- `/admin/issue`: formulario de emision de credenciales por tipo de usuario y tarjeta de resultado.
- `/admin/list`: tabla con filtros, badges de estado, accion bloquear/desbloquear y modal de dispositivos.
- `/doctor`: flujo visual para validacion de medico existente/nuevo.
- `/user/own`: panel de credencial propia y dispositivos asociados.

## Componentes principales

- `Button`: variantes `primary`, `secondary`, `danger`, `ghost`, con soporte `loading`.
- `Input`: label + input + mensaje de error.
- `Select`: select reutilizable con label, opciones y error.
- `Card`: contenedor visual base para formularios, KPIs y paneles.
- `Table`: tabla generica con encabezados y cuerpo custom.
- `Modal`: modal basico para detalles de dispositivos.
- `SiteHeader` / `SiteFooter`: navegacion y pie global.

## Contrato API propuesto (backend futuro)

### 1) Login de portal cautivo

- **Endpoint**: `POST /api/login`
- **Entrada**:
  - `username: string`
  - `password?: string`
  - `role: "paciente" | "transito" | "medico" | "gerencia"`
  - `client_mac: string`
  - `ap_mac: string`
  - `ssid: string`
  - `redirect: string`
- **Salida (200)**:
  - `ok: true`
  - `nextUrl: string`
  - `sessionId: string`
- **Salida (401/403)**:
  - `ok: false`
  - `message: "Acceso denegado: credencial invalida o expirada"`

### 2) Emision de credenciales

- **Endpoint**: `POST /api/issue`
- **Entrada**:
  - `role`
  - `name`
  - `roomOrArea?: string`
  - `maxDevices: number`
  - `durationPreset: string`
  - `doctorData?: { email, specialty, phone }`
- **Salida (201)**:
  - `ok: true`
  - `username: string`
  - `token: string`
  - `role: string`
  - `durationText: string`
  - `maxDevices: number`

### 3) Listado de usuarios/sesiones

- **Endpoint**: `GET /api/list`
- **Query**:
  - `role?: string`
  - `status?: string`
  - `search?: string`
  - `page?: number`
  - `limit?: number`
- **Salida (200)**:
  - `ok: true`
  - `items: User[]`
  - `total: number`

### 4) Bloqueo / desbloqueo

- **Endpoint**: `PATCH /api/list/:id/status`
- **Entrada**:
  - `status: "Activo" | "Bloqueado"`
- **Salida (200)**:
  - `ok: true`
  - `item: User`

### 5) Validacion de medico

- **Endpoint**: `POST /api/doctor/validate`
- **Entrada**:
  - `email: string`
  - `isNewDoctor: boolean`
  - `name?: string`
  - `specialty?: string`
  - `phone?: string`
- **Salida (200)**:
  - `ok: true`
  - `doctorExists: boolean`
  - `doctorName: string`
  - `accessType: "Permanente"`
