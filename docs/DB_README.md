# DB README - Portal Cautivo

## Resumen

Este modelo en Prisma/PostgreSQL cubre identidad de usuarios, concesiones de acceso WiFi, dispositivos asociados y trazabilidad operativa/auditoría.

## Tablas

- `User`
  - Identidad principal del portal (`username`, `personName`, `role`, `status`, `passwordHash`).
  - Control de vigencia por `expiresAt`.
  - Origen de creación con `createdByRole`.
  - Índices: `role + status`, `expiresAt`.

- `Device`
  - Dispositivos por usuario y MAC.
  - Huella temporal con `firstSeen` y `lastSeen`.
  - Anomalías por dispositivo en `anomalies`.
  - Restricción única: `@@unique([userId, mac])`.
  - Índices: `mac`, `lastSeen`.

- `AccessProfile`
  - Plantillas reutilizables de acceso.
  - Campos clave: `code`, `maxDevices`, `sessionMinutes`, `permanent`, `canIssue`, `canBrowse`.
  - `sessionMinutes = null` implica perfil permanente.
  - Relación 1:N con `AccessGrant`.

- `AccessGrant`
  - Concesión concreta de acceso para un usuario.
  - Incluye `profileCode`, `room`, `token`, `startsAt`, `endsAt`, `active`, `createdBy`.
  - Índices para consultas operativas: `userId + active`, `profileCode`, `endsAt`.

- `AuditLog`
  - Bitácora de seguridad y operaciones.
  - Guarda `actor`, `action`, `target`, `metadata(JSON)`.
  - También enlaza actor/objetivo a `User` cuando existe (`actorUserId`, `targetUserId`).
  - Índices: `action + createdAt`, `actor + createdAt`, `target + createdAt`.

## Relaciones principales

- `User 1:N Device`
- `User 1:N AccessGrant`
- `AccessProfile 1:N AccessGrant` (vía `profileCode -> code`)
- `User 1:N AuditLog` como actor (`AuditActor`)
- `User 1:N AuditLog` como objetivo (`AuditTarget`)

## Enums

- `UserRole`:
  - `PACIENTE`, `TRANSITO`, `MEDICO`, `GERENCIA`
  - `ADMISSION_OPERATOR`, `SYSTEMS`
  - Compatibilidad histórica: `ADMISION_OPERATOR`, `SISTEMAS`
  - Estado de bloqueo por rol legado: `BLOQUEADO`

- `UserStatus`:
  - `ACTIVE`, `BLOCKED`, `EXPIRED`
  - Compatibilidad: `INACTIVE`

- `GrantType`: `TOKEN`, `PASSWORD`, `MIXED`
- `AuditAction`: eventos de login, emisión, médico, policy, Ruijie

## Auditoría y detección de abuso (Admisión)

Para detectar abuso del rol operador de admisión:

- **Patrón 1:** emisión masiva desde un mismo actor
  - Consultar `AuditLog` con `action = ISSUE_ACCESS` y agrupar por `actor` en ventanas cortas.
- **Patrón 2:** muchos pacientes vinculados a la misma MAC
  - Cruce `Device.mac` + `User.role = PACIENTE` + eventos de emisión.
- **Patrón 3:** tokens de tránsito usados fuera de ventana
  - Verificar `AccessGrant.endsAt` vencido pero con actividad en `Device.lastSeen`.
- **Patrón 4:** operador de admisión emitiendo perfiles de gerencia/médico sin autorización
  - Revisar `AuditLog.metadata` (`role`, `profileCode`) y comparar contra `createdByRole`.

Recomendación de uso:

1. Registrar en `AuditLog.metadata` el contexto completo (`clientMac`, `ssid`, `room`, `maxDevices`, `operatorRole`).
2. Ejecutar jobs periódicos para generar alertas por volumen/anomalía.
3. Marcar dispositivos comprometidos en `Device.anomalies`.
4. Escalar a bloqueo (`User.status = BLOCKED`) cuando se confirme abuso.
