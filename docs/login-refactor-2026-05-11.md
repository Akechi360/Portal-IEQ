# Refactorización Integral del Flujo de Login

**Fecha:** 2026-05-11  
**Tipo:** Refactorización arquitectónica  
**Estado:** ✅ Completada

---

## Resumen Ejecutivo

Se completó la refactorización integral del flujo de login para consolidar la arquitectura en 2 puntos de entrada claros:

1. **Portal cautivo público único:** `/login`
2. **Login interno único:** `/staff/login`

Con solo 2 dashboards activos:
- `/admision` — Panel de Admisión
- `/admin` — Panel de Sistemas

---

## Nueva Arquitectura de Rutas

### Rutas Activas (Nuevas)

| Ruta | Descripción | Rol |
|------|-------------|-----|
| `/login` | Portal cautivo público único | PACIENTE, TRANSITO, MEDICO |
| `/login/success` | Confirmación de acceso WiFi | Todos los públicos |
| `/staff/login` | Login interno unificado | ADMISION, OPERADOR, SISTEMAS, ADMIN |
| `/admision` | Dashboard de Admisión | ADMISION, OPERADOR |
| `/admin` | Dashboard de Sistemas | SISTEMAS, ADMIN, SUPERADMIN |

### Rutas Legacy (Deprecated)

| Ruta | Estado | Redirección |
|------|--------|-------------|
| `/login/guest` | ⚠️ Deprecated | → `/login` |
| `/login/medicos` | ⚠️ Deprecated | → `/login` |
| `/admision/login` | ⚠️ Deprecated | → `/staff/login` |
| `/admin/login` | ⚠️ Deprecated | → `/staff/login` |

---

## Archivos Modificados/Creados

### Nuevos Archivos

```
app/
├── login/
│   ├── page.tsx              # Reescrito: Portal único con selector
│   └── LoginClient.tsx       # Nuevo: Componente client-side del portal
├── staff/
│   └── login/
│       └── page.tsx          # Nuevo: Login interno unificado
```

### Archivos Modificados (Legacy → Redirect)

```
app/
├── login/
│   ├── guest/page.tsx        # Legacy: Ahora redirige a /login
│   ├── medicos/page.tsx      # Legacy: Ahora redirige a /login
│   └── success/page.tsx      # Actualizado: Nuevo SSID WiFi-ClinicaIEQ
├── admision/
│   └── login/page.tsx        # Legacy: Ahora redirige a /staff/login
└── admin/
    └── login/page.tsx        # Legacy: Ahora redirige a /staff/login
```

---

## Flujo Técnico Detallado

### 1. Portal Público `/login`

**Server-side (`page.tsx`):**
- Lee query params del gateway: `mac`, `ip`, `redirect`, `ssid`, `gateway`
- Guarda en cookies httpOnly: `portal_mac`, `portal_ip`, `portal_redirect`, `portal_ssid`
- Renderiza `LoginClient` con props iniciales

**Client-side (`LoginClient.tsx`):**
- Estado `activeTab`: `"code"` | `"doctor"`
- Tab "Acceso con código":
  - Llama a `POST /api/auth/guest`
  - Envía: `{ voucherCode, mac }`
  - En éxito: redirige a `/login/success?plan=Paciente|Transito`
- Tab "Soy médico":
  - Llama a `POST /api/auth/doctor`
  - Envía: `{ voucherCode: email, mac }`
  - En éxito: redirige a `/login/success?plan=Medico`

### 2. Login Interno `/staff/login`

- Formulario: `usuario`, `contraseña`
- Llama a `POST /api/auth/admin`
- Backend resuelve rol y devuelve `redirect`:
  - `ADMISION` | `OPERADOR` → `/admision`
  - `ADMIN` | `SISTEMAS` | `SUPERADMIN` → `/admin`
- En error: muestra mensaje genérico de credenciales

### 3. Página de Éxito `/login/success`

- Lee `plan` de query params
- Muestra detalles según tipo:
  - **Paciente:** nombre, habitación, tiempo, dispositivos
  - **Médico:** nombre, "Permanente", SSID
  - **Tránsito:** nombre, tiempo (30min default), 1 dispositivo
- Badge final: "Conectado a WiFi-ClinicaIEQ"

---

## Backend Endpoints (Sin Cambios)

| Endpoint | Uso | Estado |
|----------|-----|--------|
| `POST /api/auth/guest` | Valida voucher PACIENTE/TRANSITO | ✅ Activo |
| `POST /api/auth/doctor` | Valida email médico | ✅ Activo |
| `POST /api/auth/admin` | Login staff interno | ✅ Activo |

---

## Modelo de Datos (Sin Cambios)

El backend mantiene la distinción entre:
- `PACIENTE` — voucher con habitación, tiempo de estancia
- `TRANSITO` — voucher corto (ej. 30 min), 1 dispositivo
- `MEDICO` — email registrado, acceso permanente
- `ADMISION`/`OPERADOR`/`SISTEMAS`/`ADMIN` — staff con dashboard

La UI pública (`/login`) **no muestra** la distinción PACIENTE/TRANSITO — ambos usan "Acceso con código".

---

## Decisiones de Diseño

### Por qué tabs y no rutas separadas
- **Simplicidad:** Una sola URL para el portal cautivo
- **Compatibilidad:** Los gateways Ruijie pueden apuntar siempre a `/login`
- **UX:** El usuario elige su método de acceso en el momento

### Por qué un solo `/staff/login`
- **Mantenibilidad:** Un solo formulario de login interno
- **Seguridad:** El backend decide el destino, no el frontend
- **Escalabilidad:** Fácil agregar nuevos roles de staff

### Por qué mantener `/login/guest` y `/login/medicos` como redirects
- **Compatibilidad:** URLs antiguas no rompen (bookmarks, documentación)
- **Deprecación gradual:** Se pueden eliminar en el futuro
- **Debugging:** Fácil rastrear si alguien aún usa las rutas viejas

---

## Checklist de Verificación

- [x] `/login` muestra selector con dos tabs
- [x] "Acceso con código" llama a `/api/auth/guest`
- [x] "Soy médico" llama a `/api/auth/doctor`
- [x] Query params `mac`, `ip`, `redirect` se guardan en cookies
- [x] `/login/success` muestra confirmación correcta
- [x] `/staff/login` tiene formulario usuario/contraseña
- [x] `/staff/login` llama a `/api/auth/admin`
- [x] Rutas legacy redirigen correctamente
- [x] No se modificaron dashboards (`/admision`, `/admin`)
- [x] Backend endpoints no se modificaron

---

## Próximos Pasos (Fuera de este scope)

1. **Integración Ruijie física:** Probar `/api/ruijie/authorize` con gateway real
2. **Eliminación de legacy:** Cuando se confirme estabilidad, remover carpetas:
   - `app/login/guest/`
   - `app/login/medicos/`
   - `app/admision/login/`
   - `app/admin/login/`
3. **Dashboard de Gerencia:** Implementar cuando sea requerido
4. **Tests E2E:** Crear suite de pruebas para los flujos de login

---

## Notas para Desarrollo Futuro

```typescript
// Para agregar un nuevo rol de staff:
// 1. Agregar al enum en schema.prisma
// 2. Actualizar /api/auth/admin para retornar redirect apropiado
// 3. Crear dashboard si es necesario
// 4. No modificar /staff/login (la UI es agnóstica al rol)

// Para modificar el portal público:
// 1. Editar app/login/LoginClient.tsx
// 2. El server-side (page.tsx) solo maneja cookies, seguro de modificar
```
