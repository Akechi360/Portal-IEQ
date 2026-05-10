import { InputField, ToggleRow } from "../components";

export default function WifiSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* SSIDs gestionados */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-5 text-sm font-semibold text-neutral-800">SSIDs gestionados</h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <InputField label="SSID principal" defaultValue="IEQ-STAFF" />
          <InputField label="SSID invitados" defaultValue="IEQ-GUEST" />
          <InputField label="SSID médicos" defaultValue="IEQ-MEDICOS" />
          <InputField label="SSID gerencia" defaultValue="IEQ-MGMT" />
        </div>
      </div>

      {/* Capacidad y rendimiento */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-5 text-sm font-semibold text-neutral-800">Capacidad y rendimiento</h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <InputField label="Capacidad máx. de usuarios" defaultValue="200" />
          <InputField label="Ancho de banda total (Mbps)" defaultValue="500" />
          <InputField label="Umbral de alerta de uso de banda (%)" defaultValue="85" />
        </div>
      </div>

      {/* Comportamiento de red */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-5 text-sm font-semibold text-neutral-800">Comportamiento de red</h3>
        <div className="flex flex-col gap-4">
          <ToggleRow label="Forzar DNS seguro (HTTPS)" subLabel="Redirige consultas DNS al resolver seguro" defaultEnabled={true} />
          <div className="h-px w-full bg-neutral-100" />
          <ToggleRow label="Aislar clientes entre sí" subLabel="Impide que dispositivos del mismo SSID se vean" defaultEnabled={false} />
          <div className="h-px w-full bg-neutral-100" />
          <ToggleRow label="Portal activo en SSID invitados" subLabel="Habilita el portal cautivo en IEQ-GUEST" defaultEnabled={true} />
          <div className="h-px w-full bg-neutral-100" />
          <ToggleRow label="Portal activo en SSID médicos" subLabel="Habilita el portal cautivo en IEQ-MEDICOS" defaultEnabled={false} />
        </div>
      </div>

      {/* Gateway */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-5 text-sm font-semibold text-neutral-800">Gateway</h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <InputField label="IP del gateway principal" defaultValue="192.168.1.1" />
          <InputField label="Puerto de callback del portal" defaultValue="8080" />
          <InputField label="ID del gateway (Ruijie)" defaultValue="GW-RUIJIE-9988X" readOnly={true} />
        </div>
      </div>
    </div>
  );
}
