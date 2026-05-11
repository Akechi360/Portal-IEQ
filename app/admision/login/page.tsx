// app/admision/login/page.tsx
// ⚠️ LEGACY — DEPRECATED
// Esta ruta está obsoleta. El login interno unificado ahora vive en /staff/login
// Fecha de deprecación: 2026-05-11
// TODO: Eliminar en una versión futura cuando se confirme que no hay dependencias

import { redirect } from "next/navigation";

export default function AdmisionLoginPageLegacy() {
  // Redirigir al nuevo login unificado para staff
  redirect("/staff/login");
}
