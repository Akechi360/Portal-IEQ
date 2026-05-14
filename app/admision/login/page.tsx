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
}
