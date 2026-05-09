"use client";

import { useState } from "react";
import { Search } from "lucide-react";

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

/* ── Mock data ───────────────────────────────────────────── */
const activeUsers: ActiveUser[] = [
  {
    id: "jm",
    initials: "JM",
    color: "#3B82F6",
    name: "Juan Méndez",
    mac: "192.168.1.42",
    ip: "192.168.1.42",
    signal: 4,
    time: "2h 14m",
    status: "Activo"
  },
  {
    id: "lc",
    initials: "LC",
    color: "#10B981",
    name: "Laura Castro",
    mac: "192.168.1.87",
    ip: "192.168.1.87",
    signal: 3,
    time: "45m",
    status: "Activo"
  },
  {
    id: "pr",
    initials: "PR",
    color: "#8B5CF6",
    name: "Pedro Rojas",
    mac: "192.168.1.163",
    ip: "192.168.1.163",
    signal: 3,
    time: "1h 02m",
    status: "Limitado"
  },
  {
    id: "mv",
    initials: "MV",
    color: "#F59E0B",
    name: "María Vega",
    mac: "192.168.1.55",
    ip: "192.168.1.55",
    signal: 4,
    time: "3h 30m",
    status: "Activo"
  },
  {
    id: "kl",
    initials: "KL",
    color: "#EC4899",
    name: "Karen Lara",
    mac: "192.168.1.201",
    ip: "192.168.1.201",
    signal: 2,
    time: "12m",
    status: "Autenticando"
  },
  {
    id: "rt",
    initials: "RT",
    color: "#EF4444",
    name: "Roberto Torres",
    mac: "192.168.1.178",
    ip: "192.168.1.178",
    signal: 1,
    time: "—",
    status: "Bloqueado"
  }
];

const recentEvents = [
  {
    id: 1,
    color: "#EF4444",
    text: "Roberto Torres bloqueado por exceder límite",
    time: "Hace 3 min"
  },
  {
    id: 2,
    color: "#3B82F6",
    text: "Nueva sesión: Karen Lara autenticando",
    time: "Hace 12 min"
  },
  {
    id: 3,
    color: "#F59E0B",
    text: "Pedro Rojas en modo limitado (plan básico)",
    time: "Hace 28 min"
  },
  {
    id: 4,
    color: "#10B981",
    text: "Red operativa — sin incidencias",
    time: "Hace 1h"
  }
];

/* ── Status badge ─────────────────────────────────────────── */
const statusConfig: Record<UserStatus, { bg: string; text: string; dot: string }> = {
  Activo: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  Limitado: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  Autenticando: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  Bloqueado: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" }
};

function StatusBadge({ status }: { status: UserStatus }) {
  const cfg = statusConfig[status];
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
  value: string | number;
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

  const filtered = activeUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.mac.includes(search)
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
          label="Usuarios conectados"
          value={47}
          sub="+8 vs ayer"
          subColor="text-green-600"
        />
        <KpiCard
          label="Sesiones hoy"
          value={213}
          sub="Desde las 00:00"
          subColor="text-neutral-400"
        />
        <KpiCard
          label="Ancho de banda"
          value={
            <span>
              68 <span className="text-lg font-semibold text-neutral-500">%</span>
            </span>
          }
          sub="340 Mbps en uso"
          subColor="text-neutral-400"
        />
        <KpiCard
          label="Bloqueados hoy"
          value={5}
          sub="2 por política"
          subColor="text-red-500"
        />
      </div>

      {/* Main grid: table + right panels */}
      <div className="flex gap-4">
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
                className="rounded-lg border border-neutral-200 bg-neutral-50 py-1.5 pl-8 pr-3 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-neutral-100">
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Usuario
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  MAC / IP
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
                      <span className="font-medium text-sky-600 hover:underline cursor-pointer">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-500">
                    {user.mac}
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

        {/* Right column */}
        <div className="flex w-64 shrink-0 flex-col gap-4">
          {/* Bandwidth usage */}
          <div className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-neutral-800">
              Uso de ancho de banda
            </h3>
            {/* Progress bar */}
            <div className="mb-3">
              <div className="mb-1 flex justify-between text-[10px] text-neutral-400">
                <span>0</span>
                <span>68%</span>
                <span>500 Mbps</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-sky-500"
                  style={{ width: "68%" }}
                />
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-neutral-500">
                  <span className="text-neutral-400">↓</span> Descarga
                </span>
                <span className="font-semibold text-neutral-800">220 Mbps</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-neutral-500">
                  <span className="text-neutral-400">↑</span> Subida
                </span>
                <span className="font-semibold text-neutral-800">120 Mbps</span>
              </div>
              <div className="flex items-center justify-between border-t border-neutral-100 pt-2">
                <span className="text-neutral-500">Pico hoy</span>
                <span className="font-semibold text-neutral-800">410 Mbps</span>
              </div>
            </div>
          </div>

          {/* Recent events */}
          <div className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-neutral-800">Eventos recientes</h3>
            <div className="space-y-3">
              {recentEvents.map((event) => (
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
