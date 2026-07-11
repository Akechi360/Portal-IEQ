"use client";

import { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function fmtBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function KpiCard({ label, value, sub, subColor }: { label: string; value: React.ReactNode; sub: string; subColor: string }) {
  return (
    <div className="rounded-xl border border-neutral-100 bg-white px-5 py-4 shadow-sm">
      <p className="text-xs text-neutral-400">{label}</p>
      <div className="mt-1 text-2xl font-bold text-neutral-900">{value}</div>
      <p className={`mt-1 text-[11px] font-medium ${subColor}`}>{sub}</p>
    </div>
  );
}

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("Mes");
  const tabs = ["Hoy", "Semana", "Mes", "Año"];

  // Datos reales de sesiones desde la DB
  const { data: sessionsData, isLoading: sessionsLoading } = useSWR("/api/admin/sessions", fetcher, { refreshInterval: 30000 });
  // Datos reales de tráfico desde Ruijie
  const { data: trafficData, isLoading: trafficLoading } = useSWR("/api/admin/traffic", fetcher, { refreshInterval: 30000 });
  // Credenciales desde la DB
  const { data: listData, isLoading: listLoading } = useSWR("/api/list", fetcher);

  const sessions: any[] = sessionsData?.sessions || [];
  const topUsers: any[] = trafficData?.topUsers || [];
  const items: any[] = listData?.items || [];

  const totalSessions = sessions.length;
  const activeSessions = sessions.filter((s) => s.status === "Activo").length;
  const uniqueUsers = new Set(sessions.map((s) => s.mac)).size;

  const totalDownBytes = trafficData?.totalDownBytes ?? 0;
  const totalUpBytes = trafficData?.totalUpBytes ?? 0;

  // Duración promedio de sesiones terminadas
  let avgDurationStr = "—";
  const endedSessions = sessions.filter((s) => s.status === "Desconectado" && s.duration && s.duration !== "—");
  if (endedSessions.length > 0) {
    avgDurationStr = endedSessions[0].duration; // Se muestra como ya está formateado
  }

  // Desglose por tipo de credencial
  const pacientes = items.filter((i: any) => i.type === "PACIENTE").length;
  const transito = items.filter((i: any) => i.type === "TRANSITO").length;
  const total = items.length || 1;
  const pctPacientes = Math.round((pacientes / total) * 100);
  const pctTransito = Math.round((transito / total) * 100);

  const isLoading = sessionsLoading || trafficLoading || listLoading;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center rounded-lg border border-neutral-200 bg-neutral-50 p-0.5">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                timeRange === t ? "bg-white text-neutral-800 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <p className="text-xs text-neutral-400">Datos en tiempo real desde la base de datos</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Sesiones registradas"
          value={isLoading ? "—" : totalSessions}
          sub={`${activeSessions} activas ahora`}
          subColor="text-emerald-600"
        />
        <KpiCard
          label="Usuarios únicos"
          value={isLoading ? "—" : uniqueUsers}
          sub="Distintos MACs en sesiones"
          subColor="text-neutral-400"
        />
        <KpiCard
          label="Descarga total"
          value={isLoading ? "—" : fmtBytes(totalDownBytes)}
          sub="Sesiones activas Ruijie"
          subColor="text-primary-600"
        />
        <KpiCard
          label="Subida total"
          value={isLoading ? "—" : fmtBytes(totalUpBytes)}
          sub="Sesiones activas Ruijie"
          subColor="text-neutral-400"
        />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Top usuarios por consumo */}
        <div className="flex flex-1 flex-col rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-neutral-800">Top usuarios por consumo (Ruijie)</h3>
          {trafficLoading ? (
            <p className="py-6 text-center text-sm text-neutral-400">Consultando…</p>
          ) : topUsers.length === 0 ? (
            <p className="py-6 text-center text-sm text-neutral-400">Sin sesiones activas.</p>
          ) : (
            <div className="flex flex-col">
              {topUsers.slice(0, 8).map((u, i) => (
                <div key={u.mac} className="flex items-center justify-between border-b border-neutral-50 py-2.5 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-400">#{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{u.username}</p>
                      <p className="font-mono text-[10px] text-neutral-400">{u.mac}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-primary-600">{fmtBytes(u.totalBytes)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Distribución por tipo de credencial */}
        <div className="flex w-full flex-col rounded-xl border border-neutral-100 bg-white p-5 shadow-sm lg:w-[360px]">
          <h3 className="mb-4 text-sm font-semibold text-neutral-800">Distribución de credenciales</h3>
          {listLoading ? (
            <p className="py-6 text-center text-sm text-neutral-400">Consultando…</p>
          ) : (
            <div className="flex flex-col gap-5 mt-2">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Pacientes</span>
                  <span className="font-semibold text-neutral-800">{pacientes} <span className="text-xs text-neutral-400">({pctPacientes}%)</span></span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-100">
                  <div className="h-full rounded-full bg-primary-500" style={{ width: `${pctPacientes}%` }} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Tránsito</span>
                  <span className="font-semibold text-neutral-800">{transito} <span className="text-xs text-neutral-400">({pctTransito}%)</span></span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-100">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${pctTransito}%` }} />
                </div>
              </div>
              <div className="mt-2 rounded-lg bg-neutral-50 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Total credenciales</span>
                  <span className="font-semibold text-neutral-800">{items.length}</span>
                </div>
                <div className="mt-1 flex justify-between">
                  <span className="text-neutral-500">Sesiones registradas en DB</span>
                  <span className="font-semibold text-neutral-800">{totalSessions}</span>
                </div>
                <div className="mt-1 flex justify-between">
                  <span className="text-neutral-500">Activas ahora (Ruijie)</span>
                  <span className="font-semibold text-emerald-600">{trafficData?.activeClients ?? "—"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
