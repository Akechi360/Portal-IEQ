# 🏥 Portal Cautivo IEQ (Instituto de Especialidades Quirúrgicas)

Bienvenido al repositorio del **Portal Cautivo WiFi** para el IEQ. Esta plataforma gestiona de forma centralizada y segura el acceso a internet para pacientes, visitantes y personal médico a través de una integración directa con la infraestructura de red (Gateways Ruijie).

---

## 🛠 Tech Stack (Pila Tecnológica)

El proyecto está construido sobre una arquitectura moderna, rápida y escalable:

- **Framework**: [Next.js](https://nextjs.org/) (App Router) + React
- **Base de Datos**: PostgreSQL
- **ORM**: [Prisma](https://www.prisma.io/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Gestor de Datos Cliente**: [SWR](https://swr.vercel.app/) para obtención de métricas en tiempo real.
- **Seguridad**: `bcryptjs` (Hashing) y `jose` (JWT)
- **Integración de Red**: API Gateway de Ruijie Cloud *(En desarrollo)*

---

## 👥 Casos de Uso y Roles

El portal atiende a distintos tipos de usuarios dentro del recinto hospitalario:

### 1. Panel de Admisión (Operadores)
Diseñado para el personal de recepción, admisión o caja.
- **Emisión Rápida**: Generación de credenciales para **Pacientes** (estancias extendidas) y personas en **Tránsito** (visitas cortas de ~30 minutos).
- **Monitoreo de Turno**: Visualización en tiempo real de los vouchers activos y las credenciales generadas en el día.

### 2. Panel de Sistemas (IT / SuperAdmin)
Diseñado para el equipo técnico encargado de la infraestructura.
- **Telemetría en Tiempo Real**: Monitoreo de usuarios conectados, dispositivos activos y consumo general de la red.
- **Auditoría y Seguridad**: Registro de eventos, bloqueos de usuarios y auditoría de accesos fallidos.
- **Gestión Médica**: Control de los vouchers permanentes de acceso irrestricto asignados a los médicos.

### 3. Portal de Autenticación (Público)
Es la "Splash Page" que intercepta a los usuarios al conectarse a la red WiFi.
- **Validación Automática**: Ingreso del código de voucher (pacientes) o email (médicos) y autorización transparente con el hardware de red.

---

## ⚙️ Funciones Principales

*   **Generación Dinámica de Vouchers**: Códigos alfanuméricos únicos atados a reglas de negocio (tiempo, límite de dispositivos, expiración).
*   **Dashboards Reactivos**: Tableros de métricas para IT y Admisión que se actualizan sin recargar la página.
*   **Expiración Inteligente**: Desconexión y caducidad automática de accesos basada en la estancia del paciente.
*   **Arquitectura Modular**: Separación de las capas de Base de Datos (`lib/db`), Lógica de Acceso (`lib/access.ts`) y Controladores HTTP (`app/api/*`).


Abre [http://localhost:3000](http://localhost:3000) en tu navegador para interactuar con la aplicación.

---
*Desarrollado para el IEQ.*
