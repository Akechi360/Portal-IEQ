<<<<<<< HEAD
import { LoginLayout } from "@/components/login/LoginLayout";
import { LoginClientInternal } from "@/components/auth/LoginClientInternal";

export default function AdminLoginPage() {
  return (
    <LoginLayout
      leftColor="#0F172A"
      leftTitle="Panel de\nSistemas"
      leftDescription="Gestión centralizada de la infraestructura y usuarios del portal."
      badgeSSID="Acceso Interno"
      badgeTheme="slate"
      leftFeatures={[]}
    >
      <LoginClientInternal
        title="Acceso a Sistemas"
        description="Ingresa tus credenciales de administrador."
        usernamePlaceholder="admin.username"
        endpoint="/api/auth/admin/login"
      />
    </LoginLayout>
  );
=======
// ⚠️ LEGACY — DEPRECATED
// Esta ruta está obsoleta. El login interno unificado ahora vive en /staff/login
// Fecha de deprecación: 2026-05-11
// TODO: Eliminar en una versión futura cuando se confirme que no hay dependencias

import { redirect } from "next/navigation";

export default function AdminLoginPageLegacy() {
  // Redirigir al nuevo login unificado para staff
  redirect("/staff/login");
>>>>>>> 122e5623a76acc8320884b73a0c20152eceade21
}
