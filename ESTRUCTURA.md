# Estructura de Archivos - Portal IEQ

```
PortalIEQ/
├── .env
├── .env.example
├── .eslintrc.json
├── .git/
├── .gitignore
├── .idea/
├── .next/
├── .vscode/
│   └── settings.json
├── app/
│   ├── admin/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── devices/
│   │   │   └── page.tsx
│   │   ├── issue/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── list/
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── logs/
│   │   │   └── page.tsx
│   │   ├── medicos/
│   │   │   └── page.tsx
│   │   ├── policies/
│   │   │   └── page.tsx
│   │   ├── reports/
│   │   │   └── page.tsx
│   │   ├── sessions/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   ├── admins/
│   │   │   │   └── page.tsx
│   │   │   ├── appearance/
│   │   │   │   └── page.tsx
│   │   │   ├── auth/
│   │   │   │   └── page.tsx
│   │   │   ├── components.tsx
│   │   │   ├── database/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx
│   │   │   ├── page.tsx
│   │   │   └── wifi/
│   │   │       └── page.tsx
│   │   ├── traffic/
│   │   │   └── page.tsx
│   │   └── users/
│   │       └── page.tsx
│   ├── admision/
│   │   ├── (panel)/
│   │   │   ├── credenciales/
│   │   │   │   └── page.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── emitir/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   └── login/
│   │       └── page.tsx
│   ├── api/
│   │   ├── admin/
│   │   │   ├── credentials/
│   │   │   │   └── issue/
│   │   │   │       └── route.ts
│   │   │   └── doctors/
│   │   │       └── route.ts
│   │   ├── auth/
│   │   │   ├── admin/
│   │   │   │   └── login/
│   │   │   │       └── route.ts
│   │   │   ├── admision/
│   │   │   │   └── login/
│   │   │   │       └── route.ts
│   │   │   ├── doctor/
│   │   │   │   └── route.ts
│   │   │   ├── guest/
│   │   │   │   └── route.ts
│   │   │   ├── logout/
│   │   │   │   └── route.ts
│   │   │   ├── me/
│   │   │   │   └── route.ts
│   │   │   └── staff/
│   │   │       └── login/
│   │   │           └── route.ts
│   │   ├── doctor/
│   │   │   ├── create/
│   │   │   │   └── route.ts
│   │   │   └── validate/
│   │   │       └── route.ts
│   │   ├── issue/
│   │   │   └── route.ts
│   │   ├── list/
│   │   │   └── route.ts
│   │   ├── login/
│   │   │   └── route.ts
│   │   ├── ruijie/
│   │   │   ├── authorize/
│   │   │   │   └── route.ts
│   │   │   ├── callback/
│   │   │   │   └── route.ts
│   │   │   └── token/
│   │   │       └── route.ts
│   │   ├── user/
│   │   │   └── own/
│   │   │       └── route.ts
│   │   └── webhooks/
│   │       └── clinic/
│   │           └── route.ts
│   ├── doctor/
│   │   └── page.tsx
│   ├── globals.css
│   ├── guest/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── prisma.ts
│   │   └── styles.ts
│   ├── login/
│   │   ├── LoginClient.tsx
│   │   ├── guest/
│   │   │   └── page.tsx
│   │   ├── medicos/
│   │   │   └── page.tsx
│   │   ├── page.tsx
│   │   └── success/
│   │       └── page.tsx
│   ├── page.tsx
│   ├── staff/
│   │   └── login/
│   │       └── page.tsx
│   └── user/
│       └── own/
│           └── page.tsx
├── components/
│   ├── admision/
│   │   └── LogoutButton.tsx
│   ├── auth/
│   │   └── LoginScreenIEQ.tsx
│   ├── guest/
│   │   └── GuestPortalClient.tsx
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── SiteFooter.tsx
│   │   └── SiteHeader.tsx
│   ├── login/
│   │   └── LoginLayout.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── LoginBackgroundFX.tsx
│       ├── Modal.tsx
│       ├── Select.tsx
│       └── Table.tsx
├── docs/
│   ├── BACKEND_README.md
│   ├── DB_README.md
│   ├── FRONTEND_README.md
│   ├── login-refactor-2026-05-11.md
│   ├── phase-2-offline.md
│   └── technical-audit-2026-05-11.md
├── lib/
│   ├── access.ts
│   ├── audit.ts
│   ├── auth.ts
│   ├── config.ts
│   ├── db.ts
│   ├── jwt.ts
│   ├── mock-data.ts
│   ├── policy.ts
│   ├── prisma.ts
│   ├── ruijie.ts
│   └── validators.ts
├── middleware.ts
├── next-env.d.ts
├── next.config.ts
├── node_modules/
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── prisma/
│   ├── migrations/
│   │   ├── 20260513152158_init/
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   ├── schema.prisma
│   └── seed.ts
├── public/
├── scratch/
├── scratch_test_prisma.ts
├── scripts/
│   └── seed-admins.ts
├── tailwind.config.ts
├── tsconfig.json
└── types/
    ├── api.ts
    └── index.ts
```

## Resumen de Directorios

### /app
- **admin/**: Panel de administración (SUPERADMIN/ADMIN)
- **admision/**: Panel de admisión (OPERADOR)
- **api/**: Endpoints API REST
- **doctor/**: Página de médicos
- **guest/**: Página de invitados
- **login/**: Portal público de login
- **staff/**: Login unificado de staff
- **user/**: Páginas de usuario
- **lib/**: Librerías específicas de app (auth, prisma, styles)

### /components
- **ui/**: Componentes UI reutilizables
- **layout/**: Componentes de layout (AppShell, Header, Footer)
- **auth/**: Componentes de autenticación
- **login/**: Componentes de login
- **guest/**: Componentes de portal de invitados
- **admision/**: Componentes específicos de admisión

### /lib
- **access.ts**: Lógica de acceso (login admin, guest, doctor)
- **audit.ts**: Registro de eventos en AccessLog
- **auth.ts**: Utilidades de autenticación (hash, compare, generateVoucherCode)
- **config.ts**: Configuración del portal (PortalConfig, SystemConfig)
- **db.ts**: Cliente Prisma
- **jwt.ts**: Manejo de JWT
- **mock-data.ts**: Datos mock para desarrollo
- **policy.ts**: Motor de políticas de seguridad
- **prisma.ts**: Re-exportación de db
- **ruijie.ts**: Integración con API Ruijie
- **validators.ts**: Validadores Zod

### /prisma
- **schema.prisma**: Esquema de base de datos
- **seed.ts**: Seed de datos iniciales
- **migrations/**: Migraciones de base de datos

### /scripts
- **seed-admins.ts**: Script para crear admins iniciales

### /docs
- Documentación del proyecto (BACKEND, DB, FRONTEND, auditorías técnicas)

### /types
- **api.ts**: Tipos para API
- **index.ts**: Exportación de tipos

### Archivos de configuración
- **.env**: Variables de entorno
- **.env.example**: Ejemplo de variables de entorno
- **.eslintrc.json**: Configuración de ESLint
- **.gitignore**: Archivos ignorados por Git
- **middleware.ts**: Middleware de Next.js para protección de rutas
- **next.config.ts**: Configuración de Next.js
- **package.json**: Dependencias del proyecto
- **postcss.config.mjs**: Configuración de PostCSS
- **tailwind.config.ts**: Configuración de Tailwind CSS
- **tsconfig.json**: Configuración de TypeScript
