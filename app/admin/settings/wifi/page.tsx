"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Loader2, Save, Check } from "lucide-react";
import { InputField, SelectField, ToggleRow } from "../components";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface RuijieGroup {
  id: string;
  name: string;
  maxBandwidthMbps: number;
  description?: string;
}

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
  const { data: sysData, isLoading: sysLoading, mutate } = useSWR("/api/admin/config/system", fetcher);
  const { data: trafficData } = useSWR("/api/admin/traffic", fetcher, { refreshInterval: 30000 });
  const { data: groupsData, isLoading: groupsLoading } = useSWR("/api/admin/ruijie/groups", fetcher);

  const configs: { key: string; value: string }[] = sysData?.data || [];
  const groups: RuijieGroup[] = groupsData?.data || [];

  function getVal(key: string, fallback = "") {
    return configs.find((c) => c.key === key)?.value ?? fallback;
  }

  // Formulario editable — se inicializa una sola vez cuando llega la config real.
  const [form, setForm] = useState<{
    guest_session_hours: string;
    max_devices_guest: string;
    max_devices_doctor: string;
    ruijie_group_guest: string;
    ruijie_group_medicos: string;
    webhook_clinic_enabled: boolean;
  } | null>(null);

  useEffect(() => {
    if (form === null && sysData) {
      setForm({
        guest_session_hours: getVal("guest_session_hours", "48"),
        max_devices_guest: getVal("max_devices_guest", "2"),
        max_devices_doctor: getVal("max_devices_doctor", "3"),
        ruijie_group_guest: getVal("ruijie_group_guest"),
        ruijie_group_medicos: getVal("ruijie_group_medicos"),
        webhook_clinic_enabled: getVal("webhook_clinic_enabled") === "true",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sysData]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    setSaved(false);
    try {
      const entries: [string, string][] = [
        ["guest_session_hours", form.guest_session_hours],
        ["max_devices_guest", form.max_devices_guest],
        ["max_devices_doctor", form.max_devices_doctor],
        ["ruijie_group_guest", form.ruijie_group_guest],
        ["ruijie_group_medicos", form.ruijie_group_medicos],
        ["webhook_clinic_enabled", String(form.webhook_clinic_enabled)],
      ];
      for (const [key, value] of entries) {
        await fetch("/api/admin/config/system", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value }),
        });
      }
      await mutate();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error(e);
      alert("Error de red al guardar la configuración.");
    } finally {
      setSaving(false);
    }
  }

  const activeClients: number = trafficData?.activeClients ?? 0;
  const ssids: string[] = [...new Set<string>((trafficData?.topUsers ?? []).map((u: any) => u.ssid as string).filter(Boolean))];

  const groupOptions = groups.map((g) => ({
    label: `${g.name} — ${g.maxBandwidthMbps} Mbps`,
    value: g.id,
  }));

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
              <span key={ssid} className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 border border-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse" />
                {ssid}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Duración de sesiones (editable) */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-1 text-sm font-semibold text-neutral-800">Duración de sesiones</h3>
        <p className="mb-4 text-xs text-neutral-400">
          Horas de estancia por defecto cuando Admisión no especifica días manualmente.
        </p>
        {sysLoading || !form ? (
          <p className="text-sm text-neutral-400">Cargando configuración…</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <InputField
              label="Sesión de pacientes (horas)"
              type="number"
              value={form.guest_session_hours}
              onChange={(v) => setForm({ ...form, guest_session_hours: v })}
            />
            <InputField
              label="Máx. dispositivos por credencial de invitado"
              type="number"
              value={form.max_devices_guest}
              onChange={(v) => setForm({ ...form, max_devices_guest: v })}
            />
            <InputField
              label="Máx. dispositivos por médico"
              type="number"
              value={form.max_devices_doctor}
              onChange={(v) => setForm({ ...form, max_devices_doctor: v })}
            />
            <ConfigRow
              label="Sesión de médicos"
              value={getVal("doctor_session_hours") === "null" || !getVal("doctor_session_hours") ? "Permanente" : `${getVal("doctor_session_hours")}h`}
              description="Los médicos siempre son permanentes hoy — aún no configurable"
            />
          </div>
        )}
      </div>

      {/* Gateway Ruijie */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-1 text-sm font-semibold text-neutral-800">Perfil de ancho de banda (Ruijie Cloud)</h3>
        <p className="mb-4 text-xs text-neutral-400">
          Asigna el grupo real configurado en Ruijie Cloud que se usará al emitir vouchers de cada tipo.
        </p>
        {sysLoading || groupsLoading || !form ? (
          <p className="text-sm text-neutral-400">Cargando configuración…</p>
        ) : groups.length === 0 ? (
          <p className="text-sm text-amber-600">
            No se pudieron obtener los grupos de Ruijie Cloud (¿credenciales offline?). Verifica RUIJIE_APP_ID/SECRET.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <SelectField
              label="Grupo — Pacientes / Tránsito"
              value={form.ruijie_group_guest}
              onChange={(v) => setForm({ ...form, ruijie_group_guest: v })}
              options={groupOptions}
            />
            <SelectField
              label="Grupo — Médicos"
              value={form.ruijie_group_medicos}
              onChange={(v) => setForm({ ...form, ruijie_group_medicos: v })}
              options={groupOptions}
            />
          </div>
        )}
        <div className="mt-4 border-t border-neutral-100 pt-4">
          <ConfigRow label="URL del gateway" value={getVal("ruijie_gateway_url", "—")} />
        </div>
      </div>

      {/* Comportamiento de red */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-5 text-sm font-semibold text-neutral-800">Comportamiento de red</h3>
        {form && (
          <div className="flex flex-col gap-4">
            <ToggleRow
              label="Webhook HIS/ADT habilitado"
              subLabel="Sincronización automática con el sistema hospitalario"
              enabled={form.webhook_clinic_enabled}
              onChange={(v) => setForm({ ...form, webhook_clinic_enabled: v })}
            />
          </div>
        )}
      </div>

      {/* Guardar */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
            <Check className="h-4 w-4" /> Guardado
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving || !form}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar cambios
        </button>
      </div>
    </div>
  );
}
