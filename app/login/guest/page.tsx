// app/login/guest/page.tsx
// ⚠️ LEGACY — DEPRECATED
// Esta ruta está obsoleta. El portal público consolidado ahora vive en /login
// Fecha de deprecación: 2026-05-11
// TODO: Eliminar en una versión futura cuando se confirme que no hay dependencias

import { redirect } from "next/navigation";

export default function GuestLoginPageLegacy() {
  // Redirigir permanentemente al nuevo portal único
  redirect("/login");
}
