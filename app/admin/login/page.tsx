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
}
