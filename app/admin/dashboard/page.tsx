"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/* ── Types ───────────────────────────────────────────────── */
type UserStatus = "Activo" | "Limitado" | "Autenticando" | "Bloqueado";

interface ActiveUser {
  id: string;
  initials: string;
  color: string;
  name: string;
  mac: string;
  ip: string;
  signal: number; // 1-4
  time: string;
  status: UserStatus;
}

/* ── Status badge ─────────────────────────────────────────── */
const statusConfig: Record<UserStatus, { bg: string; text: string; dot: string }> = {
  Activo: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  Limitado: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  Autenticando: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  Bloqueado: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" }
};

function StatusBadge({ status }: { status: UserStatus }) {
  const cfg = statusConfig[status] || statusConfig["Activo"];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

/* ── Signal bars ──────────────────────────────────────────── */
function SignalBars({ level }: { level: number }) {
  const bars = [1, 2, 3, 4];
  const color =
    level >= 4 ? "#3B82F6" : level >= 3 ? "#3B82F6" : level >= 2 ? "#F59E0B" : "#EF4444";
  return (
    <div className="flex items-end gap-[2px]">
      {bars.map((b) => (
        <div
          key={b}
          style={{
            height: `${b * 4}px`,
            width: "4px",
            borderRadius: "1px",
            backgroundColor: b <= level ? color : "#E2E8F0"
          }}
        />
      ))}
    </div>
  );
}

/* ── KPI Card ─────────────────────────────────────────────── */
function KpiCard({
  label,
  value,
  sub,
  subColor
}: {
  label: string;
  value: React.ReactNode;
  sub: string;
  subColor?: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-100 bg-white px-5 py-4 shadow-sm">
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-neutral-900">{value}</p>
      <p className={`mt-1 text-xs font-medium ${subColor ?? "text-neutral-400"}`}>{sub}</p>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */
export default function AdminDashboardPage() {
  const [search, setSearch] = useState("");
  
  // SWR para credenciales y médicos
  const { data, isLoading } = useSWR("/api/list", fetcher, { refreshInterval: 8000 });
  // SWR para logs de auditoría reales
  const { data: logsData } = useSWR("/api/admin/logs", fetcher, { refreshInterval: 6000 });
  // SWR para sesiones reales de red
  const { data: sessionsData } = useSWR("/api/admin/sessions", fetcher, { refreshInterval: 7000 });
  // SWR para tráfico real de Ruijie
  const { data: trafficData } = useSWR("/api/admin/traffic", fetcher, { refreshInterval: 15000 });

  const items = data?.items || [];
  const logs = logsData?.logs || [];
  const sessions = sessionsData?.sessions || [];

  const activeSessionsCount = trafficData?.activeClients ?? sessions.filter((s: any) => s.status === "Activo").length;
  const totalDownBytes: number = trafficData?.totalDownBytes ?? 0;
  const totalUpBytes: number = trafficData?.totalUpBytes ?? 0;

  function fmtBytes(bytes: number) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  }

  const totalBytes = totalDownBytes + totalUpBytes;

  // Mapear eventos recientes basados en logs reales de la base de datos Supabase
  const recentEvents = logs.slice(0, 4).map((log: any) => {
    let color = "#3B82F6"; // azul conexión
    if (log.type === "Rechazado" || log.type === "Bloqueo") color = "#EF4444";
    else if (log.type === "Éxito") color = "#10B981";
    
    return {
      id: log.id,
      color,
      text: `${log.user}: ${log.action}`,
      time: log.time,
    };
  });

  const activeUsers: ActiveUser[] = items.map((item: any) => {
    let status: UserStatus = "Activo";
    if (item.status === "Blocked" || item.status === "Expired") status = "Bloqueado";
    if (item.status === "Pending") status = "Autenticando";
    
    const initials = item.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
    const color = item.type === "PACIENTE" ? "#3B82F6" : item.type === "TRANSITO" ? "#F59E0B" : "#10B981";

    // Asociar IP real si la credencial tiene una sesión activa correspondiente
    const activeSession = sessions.find((s: any) => s.name === item.name && s.status === "Activo");
    const ip = activeSession ? activeSession.ip : "---";

    return {
      id: item.id,
      initials,
      color,
      name: item.name,
      mac: item.identifier,
      ip,
      signal: activeSession ? activeSession.signal : 4,
      time: new Date(item.createdAt).toLocaleDateString(),
      status
    };
  });

  const filtered = activeUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.mac.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-neutral-800">Resumen de red</h1>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Usuarios Registrados"
          value={isLoading ? "-" : items.length}
          sub="Total en el sistema"
          subColor="text-neutral-400"
        />
        <KpiCard
          label="Usuarios Activos"
          value={isLoading ? "-" : items.filter((i: any) => i.status === 'Active').length}
          sub="Credenciales válidas"
          subColor="text-green-600"
        />
        <KpiCard
          label="Consumo total (Ruijie)"
          value={fmtBytes(totalBytes)}
          sub={`${activeSessionsCount} clientes activos`}
          subColor="text-primary-600"
        />
        <KpiCard
          label="Bloqueados / Expirados"
          value={isLoading ? "-" : items.filter((i: any) => i.status === 'Blocked' || i.status === 'Expired').length}
          sub="Acceso denegado"
          subColor="text-red-500"
        />
      </div>

      {/* Main grid: table + right panels */}
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Usuarios activos table */}
        <div className="min-w-0 flex-1 rounded-xl border border-neutral-100 bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="text-base font-semibold text-neutral-800">Usuarios activos</h2>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar usuario..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border border-neutral-200 bg-neutral-50 py-1.5 pl-8 pr-3 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-neutral-100">
                  <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Usuario
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Identificador / IP
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Señal
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Tiempo
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-neutral-50"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                          style={{ backgroundColor: user.color }}
                        >
                          {user.initials}
                        </div>
                        <span className="font-medium text-primary-600 hover:underline cursor-pointer">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-neutral-500">{user.mac}</p>
                      <p className="font-mono text-[10px] text-neutral-400">{user.ip}</p>
                    </td>
                    <td className="px-4 py-3">
                      <SignalBars level={user.signal} />
                    </td>
                    <td className="px-4 py-3 text-neutral-700">{user.time}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={user.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="flex w-full shrink-0 flex-col gap-4 lg:w-64">
          {/* Bandwidth usage */}
          <div className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-neutral-800">
              Uso de ancho de banda
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-neutral-500">
                  <span className="text-neutral-400">↓</span> Descarga
                </span>
                <span className="font-semibold text-neutral-800">{fmtBytes(totalDownBytes)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-neutral-500">
                  <span className="text-neutral-400">↑</span> Subida
                </span>
                <span className="font-semibold text-neutral-800">{fmtBytes(totalUpBytes)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-neutral-100 pt-2">
                <span className="text-neutral-500">Clientes activos</span>
                <span className="font-semibold text-primary-600">{activeSessionsCount}</span>
              </div>
            </div>
          </div>

          {/* Recent events */}
          <div className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-neutral-800">Eventos recientes</h3>
            <div className="space-y-3">
              {recentEvents.length === 0 ? (
                <p className="text-xs text-neutral-400">No hay eventos grabados en la base de datos.</p>
              ) : (
                recentEvents.map((event: any) => (
                  <div key={event.id} className="flex gap-2.5">
                    <div
                      className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: event.color }}
                    />
                    <div>
                      <p className="text-xs leading-snug text-neutral-700">{event.text}</p>
                      <p className="mt-0.5 text-[10px] text-neutral-400">{event.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
