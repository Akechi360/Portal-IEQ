---
name: ieq-frontend-design
description: Diseñar e implementar interfaces de grado producción para el Portal IEQ. Se enfoca en una estética clínica premium, profesional y altamente accesible para pacientes y personal médico. Evita diseños genéricos de salud y prioriza la telemetría reactiva (SWR) y la claridad de roles (Admin/Admisión).
---

Este skill guía la creación de interfaces para el ecosistema IEQ, asegurando que cada componente refleje la excelencia médica de la institución y sea tecnológicamente robusto.

## Pensamiento de Diseño IEQ

Antes de escribir código, se debe comprometer con una dirección estética que inspire confianza y eficiencia:

- **Propósito**: ¿Este componente es para que un paciente se conecte rápido al WiFi o para que un operador emita cientos de vouchers? La función dicta la forma.
- **Tono IEQ**: Elegir entre **Minimalismo Clínico** (blancos puros, sombras suaves, mucho aire) o **Telemetría Avanzada** (Modo oscuro para IT, gráficas vibrantes, indicadores de red vivos).
- **Consistencia**: Utilizar siempre la paleta de colores del IEQ (Sky-Blue #0EA5E9) y tipografías modernas como Inter o Montserrat (evitando Arial/System).
- **Diferenciación**: El portal no debe parecer una página de internet común; debe sentirse como una herramienta de hardware médico integrada.

## Guías de Estética Frontend (IEQ Standard)

- **Tipografía**: Emparejar fuentes sin-serif de alta legibilidad. Los números (IDs de vouchers, conteo de dispositivos) deben tener un peso visual importante y, si es posible, fuentes monoespaciadas para evitar confusiones en códigos alfanuméricos.
- **Color y Contraste**: El azul IEQ debe ser el acento dominante. Los estados (Activo, Expirado, Bloqueado) deben usar colores semánticos (Esmeralda, Ámbar, Carmesí) con sutiles gradientes, nunca colores planos "chillones".
- **Movimiento y Feedback**: Implementar micro-interacciones al emitir vouchers o validar sesiones. Usar transiciones de carga suaves (Skeletons) mientras SWR sincroniza con la base de datos de Prisma.
- **Composición Espacial**: Dashboards con cuadrículas limpias y asimétricas. El panel de IT puede permitirse mayor densidad de datos; el portal del paciente debe ser masivo, centralizado y simple.
- **Detalles Visuales**: Añadir profundidad con sombras "glassmorphism" en las tarjetas de KPIs y bordes redondeados (12px-16px) que transmitan suavidad y cuidado humano.

## Lo que se debe evitar (Anti-Patterns)
- **AI-Slop**: Nada de gradientes purpúreos genéricos o layouts de landing page de marketing.
- **Inconsistencia de Rol**: No mezclar la estética simplificada de Admisión con la técnica de Sistemas.
- **Mocks Residuales**: Nunca entregar UI que dependa de constantes fijas; siempre preparar el esquema para el `fetch` de API real.

**CRÍTICO**: El diseño debe ser accesible. Muchos pacientes pueden estar en situaciones de estrés o movilidad reducida; el portal WiFi debe ser el paso más fácil de su estancia en la clínica.
