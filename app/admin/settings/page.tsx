import { InputField, SelectField, ToggleRow, MockNotice } from "./components";

export default function GeneralSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <MockNotice>
        Esta sección es una maqueta — para ajustes con efecto real sobre RADIUS/Ruijie ve a{" "}
        <b>Configuración → Red WiFi</b>.
      </MockNotice>

      {/* Section 1: Información general */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-5 text-sm font-semibold text-neutral-800">
          Información general
        </h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <InputField label="Nombre del portal" defaultValue="Portal IEQ" />
          <InputField label="Organización" defaultValue="IEQ Clínica" />
          <InputField label="Dominio" defaultValue="portal.ieq.com" />
          <SelectField 
            label="Zona horaria" 
            defaultValue="América/México_Ciudad" 
            options={["América/México_Ciudad", "América/New_York", "Europa/Madrid"]}
          />
          <InputField 
            label="URL de redirección post-login" 
            defaultValue="https://www.ieq.com/bienvenida" 
            colSpan={true} 
          />
        </div>
      </div>

      {/* Section 2: Red WiFi (Resumen) */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-5 text-sm font-semibold text-neutral-800">
          Red WiFi
        </h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <InputField label="SSID principal" defaultValue="IEQ-STAFF" />
          <InputField label="SSID Invitados" defaultValue="IEQ-GUEST" />
          <InputField label="Capacidad máx. (usuarios)" defaultValue="200" />
          <InputField label="Ancho de banda total" defaultValue="500 Mbps" />
        </div>
      </div>

      {/* Section 3: Opciones del sistema */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-5 text-sm font-semibold text-neutral-800">
          Opciones del sistema
        </h3>
        <ToggleRow 
          label="Registro automático de nuevos usuarios" 
          subLabel="Permite que usuarios se registren sin aprobación manual"
          defaultEnabled={true}
        />
      </div>
    </div>
  );
}
