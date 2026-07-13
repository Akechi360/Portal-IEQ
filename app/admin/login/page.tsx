import { LoginLayout } from "@/components/login/LoginLayout";
import { LoginClientInternal } from "@/components/auth/LoginClientInternal";

export default function AdminLoginPage() {
  return (
    <LoginLayout
      leftTitle="Panel de\nSistemas"
      leftDescription="Gestión centralizada de la infraestructura y usuarios del portal."
      badgeSSID="Acceso Interno"
      leftFeatures={[
        { icon: "shield", bold: "Acceso protegido", text: "solo personal autorizado" },
        { icon: "zap", bold: "Control en vivo", text: "sesiones y dispositivos en tiempo real" },
      ]}
    >
      <LoginClientInternal
        title="Acceso a Sistemas"
        description="Ingresa tus credenciales de administrador."
        usernamePlaceholder="admin.username"
        endpoint="/api/auth/admin/login"
      />
    </LoginLayout>
  );
}
