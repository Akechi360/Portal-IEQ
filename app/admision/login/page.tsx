<<<<<<< HEAD
import { LoginLayout } from "@/components/login/LoginLayout";
import { LoginClientInternal } from "@/components/auth/LoginClientInternal";

export default function AdmisionLoginPage() {
  return (
    <LoginLayout
      leftColor="#0F172A"
      leftTitle="Panel de\nAdmisión"
      leftDescription="Emisión y gestión de credenciales WiFi para pacientes y tránsito."
      badgeSSID="Acceso Interno"
      badgeTheme="slate"
      leftFeatures={[]}
    >
      <LoginClientInternal
        title="Acceso a Admisión"
        description="Ingresa tus credenciales de operador."
        usernamePlaceholder="operador.username"
        endpoint="/api/auth/admision/login"
      />
    </LoginLayout>
  );
=======
// ⚠️ LEGACY — DEPRECATED
// Esta ruta está obsoleta. El portal público consolidado ahora vive en /login
// Fecha de deprecación: 2026-05-11
// TODO: Eliminar en una versión futura cuando se confirme que no hay dependencias

import { redirect } from "next/navigation";

export default function AdmisionLoginPageLegacy() {
  // Redirigir al nuevo login unificado para staff
  redirect("/staff/login");
>>>>>>> 122e5623a76acc8320884b73a0c20152eceade21
}
