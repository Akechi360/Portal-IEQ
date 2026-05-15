import { LoginLayout } from "@/components/login/LoginLayout";
import { LoginClientInternal } from "@/components/auth/LoginClientInternal";

export default function StaffLoginPage() {
  return (
    <LoginLayout
      leftColor="#0F172A"
      leftTitle="Portal\nAdministrativo"
      leftDescription="Acceso centralizado para el personal de Sistemas y Admisión de Clínica IEQ."
      badgeSSID="Acceso Interno"
      badgeTheme="slate"
      leftFeatures={[]}
    >
      <LoginClientInternal
        title="Acceso Staff"
        description="Ingresa tus credenciales para acceder al panel correspondiente."
        usernamePlaceholder="usuario"
        endpoint="/api/auth/staff/login"
      />
    </LoginLayout>
  );
}
