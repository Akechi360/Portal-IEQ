"use client";

import { useState } from "react";

/* ── UI Components ─────────────────────────────────────────── */

function Switch({ enabled, onChange }: { enabled: boolean; onChange?: () => void }) {
  return (
    <div
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out ${
        enabled ? "bg-sky-500" : "bg-neutral-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </div>
  );
}

function InputField({ 
  label, 
  defaultValue, 
  colSpan = false, 
  readOnly = false 
}: { 
  label: string; 
  defaultValue: string; 
  colSpan?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${colSpan ? "md:col-span-2" : ""}`}>
      <label className="text-xs font-medium text-neutral-500">{label}</label>
      <input
        type="text"
        defaultValue={defaultValue}
        readOnly={readOnly}
        className={`w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400 ${
          readOnly ? "bg-neutral-50 text-neutral-500 cursor-not-allowed" : "bg-white"
        }`}
      />
    </div>
  );
}

function SelectField({ label, defaultValue, options = [] }: { label: string; defaultValue: string; options?: string[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-neutral-500">{label}</label>
      <select
        defaultValue={defaultValue}
        className="w-full appearance-none rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: `right 0.5rem center`,
          backgroundRepeat: `no-repeat`,
          backgroundSize: `1.5em 1.5em`,
          paddingRight: `2.5rem`,
        }}
      >
        {options.length > 0 ? (
          options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))
        ) : (
          <option value={defaultValue}>{defaultValue}</option>
        )}
      </select>
    </div>
  );
}

function ToggleRow({ label, subLabel, defaultEnabled }: { label: string; subLabel?: string; defaultEnabled: boolean }) {
  const [enabled, setEnabled] = useState(defaultEnabled);
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm font-medium text-neutral-800">{label}</p>
        {subLabel && <p className="mt-1 text-xs text-neutral-400">{subLabel}</p>}
      </div>
      <Switch enabled={enabled} onChange={() => setEnabled(!enabled)} />
    </div>
  );
}

/* ── Tabs Content ──────────────────────────────────────────── */

function GeneralTab() {
  return (
    <div className="flex flex-col gap-6">
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

function WifiTab() {
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

function AuthTab() {
  return (
    <div className="flex flex-col gap-6">
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

function NotificationsTab() {
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

/* ── Page ──────────────────────────────────────────────────── */

export default function ConfigPage() {
  const [activeTab, setActiveTab] = useState("General");

  const tabs = [
    "General",
    "Red WiFi",
    "Autenticación",
    "Notificaciones",
    "Administradores",
    "Base de datos",
    "Apariencia",
  ];

  return (
    <div className="flex flex-col space-y-6">
      {/* Top action row */}
      <div className="flex items-center justify-end gap-3">
        <button className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50">
          Restaurar
        </button>
        <button className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-600">
          Guardar cambios
        </button>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Left Sidebar (Sub-navigation) */}
        <div className="w-full shrink-0 md:w-56">
          <nav className="flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab
                    ? "bg-sky-50 text-sky-600"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Content Area */}
        <div className="flex flex-1 flex-col">
          {activeTab === "General" && <GeneralTab />}
          {activeTab === "Red WiFi" && <WifiTab />}
          {activeTab === "Autenticación" && <AuthTab />}
          {activeTab === "Notificaciones" && <NotificationsTab />}
          
          {/* Placeholders para las siguientes pestañas */}
          {activeTab !== "General" && activeTab !== "Red WiFi" && activeTab !== "Autenticación" && activeTab !== "Notificaciones" && (
            <div className="flex h-64 items-center justify-center rounded-xl border border-neutral-100 bg-white shadow-sm">
              <p className="text-sm font-medium text-neutral-400">
                Contenido para la sección {activeTab}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
