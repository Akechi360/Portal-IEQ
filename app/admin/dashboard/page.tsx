"use client";

import { useState } from "react";
import { Search, Users, ShieldAlert, Wifi } from "lucide-react";
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

/* ── Status → color (reutilizado en badge Y franja de fila) ── */
const statusConfig: Record<UserStatus, { bg: string; text: string; dot: string; hex: string }> = {
  Activo: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500", hex: "#22c55e" },
  Limitado: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", hex: "#f59e0b" },
  Autenticando: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", hex: "#3b82f6" },
  Bloqueado: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500", hex: "#ef4444" }
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
    level >= 4 ? "#12aeb4" : level >= 3 ? "#12aeb4" : level >= 2 ? "#F59E0B" : "#EF4444";
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

/* ── Hero: la métrica que de verdad importa en un panel de red
   en vivo — cuántos dispositivos están conectados AHORA, con el
   pulso de marca teal y el reparto real de tráfico. ──────────── */
function NetworkHero({
  activeCount,
  isLoading,
  downBytes,
  upBytes,
  fmtBytes
}: {
  activeCount: number;
  isLoading: boolean;
  downBytes: number;
  upBytes: number;
  fmtBytes: (n: number) => string;
}) {
  const total = downBytes + upBytes || 1;
  const downPct = Math.round((downBytes / total) * 100);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-800 via-primary-700 to-primary-500 p-6 text-white shadow-[0_24px_50px_-20px_rgba(13,111,120,0.55)]">
      <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-primary-300/20 blur-3xl" aria-hidden="true" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-medium text-primary-50/85">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
            </span>
            Red operativa en vivo
          </p>
          <p className="mt-3 text-[44px] font-bold leading-none tracking-tight tabular-nums">
            {isLoading ? "–" : activeCount}
          </p>
          <p className="mt-1.5 text-sm text-primary-50/80">clientes conectados ahora mismo</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/12 backdrop-blur-sm">
          <Wifi className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Reparto de tráfico: dato real, no decorativo */}
      <div className="relative mt-7">
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-primary-50/80">
          <span>↓ Descarga · {fmtBytes(downBytes)}</span>
          <span>↑ Subida · {fmtBytes(upBytes)}</span>
        </div>
        <div className="flex h-1.5 overflow-hidden rounded-full bg-white/15">
          <div
            className="bg-white transition-[width] duration-500 ease-out"
            style={{ width: `${downPct}%` }}
          />
          <div
            className="bg-primary-200/80 transition-[width] duration-500 ease-out"
            style={{ width: `${100 - downPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Stat secundaria compacta (franja de icono, sin ser otra
   caja idéntica flotando junto a las demás) ─────────────────── */
function CompactStat({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor
}: {
  label: string;
  value: React.ReactNode;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_20px_-14px_rgba(15,23,42,0.14)]">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className={`h-[18px] w-[18px] ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-neutral-500">{label}</p>
        <p className="text-xl font-bold leading-tight text-neutral-900 tabular-nums">{value}</p>
        <p className="text-[10.5px] text-neutral-400">{sub}</p>
      </div>
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

  // Mapear eventos recientes basados en logs reales de la base de datos Supabase
  const recentEvents = logs.slice(0, 4).map((log: any) => {
    let color = "#12aeb4"; // teal conexión
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
    const color = item.type === "PACIENTE" ? "#12aeb4" : item.type === "TRANSITO" ? "#F59E0B" : "#10B981";

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

  const blockedCount = items.filter((i: any) => i.status === "Blocked" || i.status === "Expired").length;

  return (
    <div className="space-y-5">
      {/* Eyebrow + título (eco del login: mismo lenguaje de marca) */}
      <div>
        <p className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-primary-600">
          <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
          Panel de Sistemas
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Resumen de red</h1>
      </div>

      {/* Hero de red + stats secundarias */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <NetworkHero
          activeCount={activeSessionsCount}
          isLoading={isLoading}
          downBytes={totalDownBytes}
          upBytes={totalUpBytes}
          fmtBytes={fmtBytes}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <CompactStat
            label="Usuarios registrados"
            value={isLoading ? "-" : items.length}
            sub="Total en el sistema"
            icon={Users}
            iconBg="bg-neutral-100"
            iconColor="text-neutral-600"
          />
          <CompactStat
            label="Credenciales activas"
            value={isLoading ? "-" : items.filter((i: any) => i.status === "Active").length}
            sub="Válidas ahora mismo"
            icon={Wifi}
            iconBg="bg-green-50"
            iconColor="text-green-600"
          />
          <CompactStat
            label="Bloqueados / expirados"
            value={isLoading ? "-" : blockedCount}
            sub="Acceso denegado"
            icon={ShieldAlert}
            iconBg="bg-red-50"
            iconColor="text-red-500"
          />
        </div>
      </div>

      {/* Main grid: table + right panels */}
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Usuarios activos table */}
        <div className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_-14px_rgba(15,23,42,0.16)]">
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
                <tr className="border-y border-neutral-100 bg-neutral-50/70">
                  <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    Usuario
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    Identificador / IP
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    Señal
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    Tiempo
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-primary-50/40"
                  >
                    {/* Franja de estado en el borde: se escanea de un vistazo,
                        sin depender solo del badge de texto al final de la fila. */}
                    <td
                      className="px-5 py-3"
                      style={{ boxShadow: `inset 3px 0 0 0 ${statusConfig[user.status].hex}` }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                          style={{ backgroundColor: user.color }}
                        >
                          {user.initials}
                        </div>
                        <span className="font-medium text-primary-700 hover:underline cursor-pointer">
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
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_-14px_rgba(15,23,42,0.16)]">
            <h3 className="mb-3 text-sm font-semibold text-neutral-800">
              Uso de ancho de banda
            </h3>
            <div className="flex h-2 overflow-hidden rounded-full bg-neutral-100">
              <div
                className="bg-primary-500 transition-[width] duration-500 ease-out"
                style={{ width: `${Math.round((totalDownBytes / (totalDownBytes + totalUpBytes || 1)) * 100)}%` }}
              />
              <div className="flex-1 bg-neutral-300" />
            </div>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-neutral-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-500" /> Descarga
                </span>
                <span className="font-semibold text-neutral-800 tabular-nums">{fmtBytes(totalDownBytes)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-neutral-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" /> Subida
                </span>
                <span className="font-semibold text-neutral-800 tabular-nums">{fmtBytes(totalUpBytes)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-neutral-100 pt-2">
                <span className="text-neutral-500">Clientes activos</span>
                <span className="font-semibold text-primary-600 tabular-nums">{activeSessionsCount}</span>
              </div>
            </div>
          </div>

          {/* Recent events — timeline: los eventos SÍ son cronológicos,
              la línea conectora encierra esa secuencia real. */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_-14px_rgba(15,23,42,0.16)]">
            <h3 className="mb-3 text-sm font-semibold text-neutral-800">Eventos recientes</h3>
            {recentEvents.length === 0 ? (
              <p className="text-xs text-neutral-400">No hay eventos grabados en la base de datos.</p>
            ) : (
              <div className="relative space-y-4">
                <div className="absolute bottom-1 left-[5px] top-1 w-px bg-neutral-200" aria-hidden="true" />
                {recentEvents.map((event: any) => (
                  <div key={event.id} className="relative flex gap-2.5">
                    <span
                      className="relative z-10 mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-white"
                      style={{ backgroundColor: event.color }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs leading-snug text-neutral-700">{event.text}</p>
                      <p className="mt-0.5 text-[10px] text-neutral-400">{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
