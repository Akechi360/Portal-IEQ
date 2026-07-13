import { LoginLayout } from "@/components/login/LoginLayout";
import { LoginClientInternal } from "@/components/auth/LoginClientInternal";

export default function AdmisionLoginPage() {
  return (
    <LoginLayout
      leftTitle="Panel de\nAdmisión"
      leftDescription="Emisión y gestión de credenciales WiFi para pacientes y tránsito."
      badgeSSID="Acceso Interno"
      leftFeatures={[
        { icon: "clock", bold: "Emisión rápida", text: "vouchers para pacientes y tránsito" },
        { icon: "shield", bold: "Control de dispositivos", text: "un voucher, un equipo casado" },
      ]}
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
