import { InputField, SelectField, ToggleRow, MockNotice } from "../components";

export default function NotificationsSettingsPage() {
  const events = [
    { label: "Dispositivo bloqueado por exceder límite", enabled: true },
    { label: "Usuario nuevo registrado", enabled: true },
    { label: "Intento de acceso rechazado (5+ veces)", enabled: true },
    { label: "Ancho de banda supera umbral configurado", enabled: true },
    { label: "AP / Gateway desconectado", enabled: true },
    { label: "Sesión de médico expirada", enabled: false },
    { label: "Nuevo dispositivo desconocido detectado", enabled: false },
  ];

  return (
    <div className="flex flex-col gap-6">
      <MockNotice>
        Esta sección es una maqueta — no hay envío real de correos ni webhooks conectado todavía.
      </MockNotice>

      {/* Canales de notificación */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-5 text-sm font-semibold text-neutral-800">Canales de notificación</h3>
        <div className="flex flex-col gap-5">
          <ToggleRow label="Notificaciones por correo electrónico" defaultEnabled={true} />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <InputField label="Correo del administrador principal" defaultValue="admin@ieq.com" />
            <InputField label="Correo del área de Sistemas" defaultValue="it@ieq.com" />
          </div>
          <div className="h-px w-full bg-neutral-100 my-1" />
          <ToggleRow label="Notificaciones por webhook" subLabel="Para integrar con n8n, Slack, Teams, etc." defaultEnabled={true} />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <InputField label="URL del webhook" defaultValue="https://hook.n8n.cloud/webhook/ieq" />
            <SelectField 
              label="Formato del payload" 
              defaultValue="JSON" 
              options={["JSON", "Form-encoded"]}
            />
          </div>
        </div>
      </div>

      {/* Eventos que generan notificación */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-5 text-sm font-semibold text-neutral-800">Eventos que generan notificación</h3>
        <div className="flex flex-col gap-4">
          {events.map((evt, idx) => (
            <div key={idx}>
              <ToggleRow label={evt.label} defaultEnabled={evt.enabled} />
              {idx < events.length - 1 && <div className="h-px w-full bg-neutral-100 mt-4" />}
            </div>
          ))}
        </div>
      </div>

      {/* Resumen periódico */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-5 text-sm font-semibold text-neutral-800">Resumen periódico</h3>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <ToggleRow label="Enviar resumen diario por correo" defaultEnabled={true} />
            </div>
            <div className="w-full md:w-48">
              <SelectField 
                label="Hora de envío" 
                defaultValue="08:00" 
                options={["06:00", "07:00", "08:00", "09:00", "12:00", "18:00"]}
              />
            </div>
          </div>
          <div className="h-px w-full bg-neutral-100" />
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <ToggleRow label="Enviar resumen semanal" defaultEnabled={true} />
            </div>
            <div className="w-full md:w-48">
              <SelectField 
                label="Día de envío" 
                defaultValue="Lunes" 
                options={["Lunes", "Viernes", "Sábado", "Domingo"]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
