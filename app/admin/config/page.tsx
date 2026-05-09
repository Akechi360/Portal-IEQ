"use client";

import { useState } from "react";

/* ── Components ────────────────────────────────────────────── */

function Switch({ enabled }: { enabled: boolean }) {
  return (
    <div
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

function InputField({ label, defaultValue, colSpan = false }: { label: string; defaultValue: string; colSpan?: boolean }) {
  return (
    <div className={`flex flex-col gap-1.5 ${colSpan ? "md:col-span-2" : ""}`}>
      <label className="text-xs font-medium text-neutral-500">{label}</label>
      <input
        type="text"
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
      />
    </div>
  );
}

function SelectField({ label, defaultValue }: { label: string; defaultValue: string }) {
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
        <option value={defaultValue}>{defaultValue}</option>
        <option value="America/New_York">América/New_York</option>
        <option value="Europe/Madrid">Europa/Madrid</option>
      </select>
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
        <div className="flex flex-1 flex-col gap-6">
          
          {/* Section 1: Información general */}
          <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
            <h3 className="mb-5 text-sm font-semibold text-neutral-800">
              Información general
            </h3>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <InputField label="Nombre del portal" defaultValue="Portal IEQ" />
              <InputField label="Organización" defaultValue="IEQ Clínica" />
              <InputField label="Dominio" defaultValue="portal.ieq.com" />
              <SelectField label="Zona horaria" defaultValue="América/México_Ciudad" />
              <InputField 
                label="URL de redirección post-login" 
                defaultValue="https://www.ieq.com/bienvenida" 
                colSpan={true} 
              />
            </div>
          </div>

          {/* Section 2: Red WiFi */}
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
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-800">
                  Registro automático de nuevos usuarios
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  Permite que usuarios se registren sin aprobación manual
                </p>
              </div>
              <Switch enabled={true} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
