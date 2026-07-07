"use client";

import useSWR from "swr";
import { ToggleRow } from "../components";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function ConfigRow({ label, value, description }: { label: string; value: string; description?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-neutral-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-neutral-800">{label}</p>
        {description && <p className="text-xs text-neutral-400 mt-0.5">{description}</p>}
      </div>
      <span className="shrink-0 rounded-md bg-neutral-50 border border-neutral-100 px-2.5 py-1 font-mono text-xs text-neutral-700">{value}</span>
    </div>
  );
}

export default function WifiSettingsPage() {
  const { data: sysData, isLoading: sysLoading } = useSWR("/api/admin/config/system", fetcher);
  const { data: trafficData } = useSWR("/api/admin/traffic", fetcher, { refreshInterval: 30000 });

  const configs: { key: string; value: string; description: string }[] = sysData?.data || [];

  function getVal(key: string, fallback = "—") {
    return configs.find((c) => c.key === key)?.value ?? fallback;
  }

  const activeClients: number = trafficData?.activeClients ?? 0;
  const ssids: string[] = [...new Set<string>((trafficData?.topUsers ?? []).map((u: any) => u.ssid as string).filter(Boolean))];

  return (
    <div className="flex flex-col gap-6">
      {/* SSIDs activos desde Ruijie */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-neutral-800">SSIDs activos (Ruijie Cloud)</h3>
          <span className="text-xs text-neutral-400">{activeClients} clientes conectados ahora</span>
        </div>
        {ssids.length === 0 ? (
          <p className="text-sm text-neutral-400">Sin datos de Ruijie Cloud en este momento.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {ssids.map((ssid) => (
              <span key={ssid} className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
                {ssid}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Configuración de sesiones */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-4 text-sm font-semibold text-neutral-800">Duración de sesiones</h3>
        {sysLoading ? (
          <p className="text-sm text-neutral-400">Cargando configuración…</p>
        ) : (
          <div>
            <ConfigRow
              label="Sesión de pacientes (horas)"
              value={getVal("guest_session_hours")}
              description="Incluye 2h de gracia tras el alta"
            />
            <ConfigRow
              label="Sesión de médicos (horas)"
              value={getVal("doctor_session_hours") === "null" ? "Permanente" : getVal("doctor_session_hours")}
              description="null = sin expiración"
            />
            <ConfigRow
              label="Máx. dispositivos por credencial de invitado"
              value={getVal("max_devices_guest")}
            />
            <ConfigRow
              label="Máx. dispositivos por médico"
              value={getVal("max_devices_doctor")}
            />
          </div>
        )}
      </div>

      {/* Gateway Ruijie */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-4 text-sm font-semibold text-neutral-800">Gateway Ruijie Cloud</h3>
        {sysLoading ? (
          <p className="text-sm text-neutral-400">Cargando configuración…</p>
        ) : (
          <div>
            <ConfigRow
              label="URL del gateway"
              value={getVal("ruijie_gateway_url")}
            />
            <ConfigRow
              label="Grupo de red — Invitados"
              value={getVal("ruijie_group_guest")}
            />
            <ConfigRow
              label="Grupo de red — Médicos"
              value={getVal("ruijie_group_medicos")}
            />
          </div>
        )}
      </div>

      {/* Comportamiento de red */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-5 text-sm font-semibold text-neutral-800">Comportamiento de red</h3>
        <div className="flex flex-col gap-4">
          <ToggleRow
            label="Webhook HIS/ADT habilitado"
            subLabel="Sincronización automática con el sistema hospitalario"
            defaultEnabled={getVal("webhook_clinic_enabled") === "true"}
          />
          <div className="h-px w-full bg-neutral-100" />
          <ToggleRow
            label="Portal cautivo activo"
            subLabel="Requiere autenticación para acceder a Internet"
            defaultEnabled={true}
          />
        </div>
      </div>
    </div>
  );
}
