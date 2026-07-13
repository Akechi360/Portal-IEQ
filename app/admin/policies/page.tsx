"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { ShieldAlert, Users, Moon, Save, Check, Loader2 } from "lucide-react";
import { InputField, MockNotice } from "@/app/admin/settings/components";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/* ── Umbral card ───────────────────────────────────────────── */
function ThresholdCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50">
          <Icon className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
          <p className="mt-0.5 text-xs text-neutral-400">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ── Página ───────────────────────────────────────────────── */
export default function PoliciesPage() {
  const { data: sysData, isLoading: sysLoading, mutate } = useSWR("/api/admin/config/system", fetcher);
  const { data: logsData, isLoading: logsLoading } = useSWR("/api/admin/logs?event=BLOCKED", fetcher, {
    refreshInterval: 15000,
  });

  const configs: { key: string; value: string }[] = sysData?.data || [];
  function getVal(key: string, fallback = "") {
    return configs.find((c) => c.key === key)?.value ?? fallback;
  }

  const [form, setForm] = useState<{
    policy_max_shared_mac: string;
    policy_max_transito_sessions: string;
    policy_night_start_hour: string;
    policy_night_end_hour: string;
  } | null>(null);

  useEffect(() => {
    if (form === null && sysData) {
      setForm({
        policy_max_shared_mac: getVal("policy_max_shared_mac", "4"),
        policy_max_transito_sessions: getVal("policy_max_transito_sessions", "1"),
        policy_night_start_hour: getVal("policy_night_start_hour", "23"),
        policy_night_end_hour: getVal("policy_night_end_hour", "5"),
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
      const entries = Object.entries(form);
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
      alert("Error de red al guardar los umbrales.");
    } finally {
      setSaving(false);
    }
  }

  const events: { id: string; user: string; action: string; mac: string; time: string }[] = logsData?.logs || [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Políticas de seguridad</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Umbrales del motor de detección de anomalías, ya activo en producción sobre cada
          autenticación (ver <code className="font-mono text-xs">lib/policy.ts</code>).
        </p>
      </div>

      <MockNotice>
        Bloqueo de streaming/gaming, DNS forzado y límites de velocidad por sitio no están aquí:
        no existe hoy ninguna superficie real en RADIUS ni en Ruijie Cloud para aplicarlos. Lo que
        sí es real y editable abajo es el motor de anomalías que ya corre en cada login.
      </MockNotice>

      {/* Umbrales */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <ThresholdCard
          icon={ShieldAlert}
          title="Reventa de voucher"
          description="Bloquea si un mismo dispositivo (MAC) usó más vouchers distintos que este número"
        >
          {sysLoading || !form ? (
            <p className="text-sm text-neutral-400">Cargando…</p>
          ) : (
            <InputField
              label="Máx. vouchers distintos por MAC"
              type="number"
              value={form.policy_max_shared_mac}
              onChange={(v) => setForm({ ...form, policy_max_shared_mac: v })}
            />
          )}
        </ThresholdCard>

        <ThresholdCard
          icon={Users}
          title="Tránsito simultáneo"
          description="Bloquea y cierra sesiones si un mismo dispositivo excede este número de sesiones activas"
        >
          {sysLoading || !form ? (
            <p className="text-sm text-neutral-400">Cargando…</p>
          ) : (
            <InputField
              label="Máx. sesiones activas por MAC"
              type="number"
              value={form.policy_max_transito_sessions}
              onChange={(v) => setForm({ ...form, policy_max_transito_sessions: v })}
            />
          )}
        </ThresholdCard>

        <ThresholdCard
          icon={Moon}
          title="Acceso nocturno inusual"
          description="Marca como anomalía el acceso de médicos/staff fuera de este rango horario"
        >
          {sysLoading || !form ? (
            <p className="text-sm text-neutral-400">Cargando…</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Desde (hora)"
                type="number"
                value={form.policy_night_start_hour}
                onChange={(v) => setForm({ ...form, policy_night_start_hour: v })}
              />
              <InputField
                label="Hasta (hora)"
                type="number"
                value={form.policy_night_end_hour}
                onChange={(v) => setForm({ ...form, policy_night_end_hour: v })}
              />
            </div>
          )}
        </ThresholdCard>
      </div>

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
          Guardar umbrales
        </button>
      </div>

      {/* Eventos bloqueados reales */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h2 className="text-base font-semibold text-neutral-800">Anomalías detectadas recientemente</h2>
          <span className="text-xs text-neutral-400">Actualiza cada 15s</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-50 bg-neutral-50/50">
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Usuario / Actor</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">MAC</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Detalle</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {logsLoading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-neutral-400">
                    Cargando eventos…
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-neutral-400">
                    Sin anomalías detectadas — la red está limpia.
                  </td>
                </tr>
              ) : (
                events.map((e) => (
                  <tr key={e.id} className="hover:bg-neutral-50">
                    <td className="px-5 py-3 font-medium text-neutral-800">{e.user}</td>
                    <td className="px-4 py-3 font-mono text-xs text-neutral-500">{e.mac || "—"}</td>
                    <td className="px-4 py-3 text-neutral-600">{e.action}</td>
                    <td className="px-4 py-3 text-neutral-400 text-xs">{e.time}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
