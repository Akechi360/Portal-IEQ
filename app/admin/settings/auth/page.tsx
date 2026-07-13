import { InputField, SelectField, ToggleRow, MockNotice } from "../components";

export default function AuthSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <MockNotice>
        Esta sección es una maqueta — la autenticación real hoy corre por RADIUS/FreeRADIUS
        (ver Configuración → Red WiFi) y no lee ninguno de estos valores todavía.
      </MockNotice>

      {/* Modo de autenticación */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-5 text-sm font-semibold text-neutral-800">Modo de autenticación</h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <SelectField 
            label="Método principal" 
            defaultValue="Voucher/Token" 
            options={["Voucher/Token", "Usuario + Contraseña", "Solo MAC (bypass)", "Mixto (Token o MAC)"]}
          />
        </div>
      </div>

      {/* Configuración de sesión */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-5 text-sm font-semibold text-neutral-800">Configuración de sesión</h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mb-6">
          <InputField label="Tiempo de expiración de sesión inactiva (min)" defaultValue="30" />
          <InputField label="Tiempo máximo de sesión absoluta (horas)" defaultValue="24" />
        </div>
        <div className="flex flex-col gap-4">
          <ToggleRow label="Permitir reconexión automática por MAC" subLabel="No muestra portal al reconectar si ya fue autenticado" defaultEnabled={true} />
          <div className="h-px w-full bg-neutral-100" />
          <ToggleRow label="Requerir reautenticación al cambiar de SSID" defaultEnabled={false} />
        </div>
      </div>

      {/* Vouchers / Tokens */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-5 text-sm font-semibold text-neutral-800">Vouchers / Tokens</h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mb-6">
          <InputField label="Longitud del código de voucher" defaultValue="8" />
          <SelectField 
            label="Formato del código" 
            defaultValue="Alfanumérico" 
            options={["Solo números", "Alfanumérico", "Personalizado"]}
          />
        </div>
        <div className="flex flex-col gap-4">
          <ToggleRow label="Mostrar código en pantalla al crearlo" subLabel="Admisión lo ve y puede copiarlo" defaultEnabled={true} />
          <div className="h-px w-full bg-neutral-100" />
          <ToggleRow label="Enviar código por correo al médico al crearse" defaultEnabled={true} />
        </div>
      </div>

      {/* Seguridad */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-5 text-sm font-semibold text-neutral-800">Seguridad</h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mb-6">
          <InputField label="Máximo de intentos fallidos antes de bloqueo temporal" defaultValue="5" />
          <InputField label="Tiempo de bloqueo tras intentos fallidos (min)" defaultValue="10" />
        </div>
        <div className="flex flex-col gap-4">
          <ToggleRow label="Registrar MAC de dispositivos autenticados" defaultEnabled={true} />
          <div className="h-px w-full bg-neutral-100" />
          <ToggleRow label="Bloquear dispositivos no registrados en SSID-STAFF" defaultEnabled={false} />
        </div>
      </div>
    </div>
  );
}
