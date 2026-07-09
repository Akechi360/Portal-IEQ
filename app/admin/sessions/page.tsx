"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import useSWR from "swr";

/* ── Types ─────────────────────────────────────────────────── */
type SessionStatus = "Activo" | "Limitado" | "Autenticando" | "Bloqueado" | "Desconectado";

interface Session {
  id: string;
  name: string;
  ip: string;
  mac: string;
  ssid: string;
  signal: number; // 1–4
  duration: string;
  download: number; // MBs
  upload: number;   // MBs
  status: SessionStatus;
  tipo: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/* ── Helpers ───────────────────────────────────────────────── */
const statusCfg: Record<SessionStatus, { bg: string; text: string; dot: string }> = {
  Activo:       { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500"  },
  Limitado:     { bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-500"  },
  Autenticando: { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500"   },
  Bloqueado:    { bg: "bg-red-50",    text: "text-red-600",    dot: "bg-red-500"    },
  Desconectado: { bg: "bg-gray-50",   text: "text-gray-600",   dot: "bg-gray-400"   }
};

function StatusBadge({ status }: { status: SessionStatus }) {
  const c = statusCfg[status] || statusCfg["Desconectado"];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

function SignalBars({ level }: { level: number }) {
  const color =
    level >= 4 ? "#3B82F6"
    : level >= 3 ? "#3B82F6"
    : level >= 2 ? "#F59E0B"
    : "#EF4444";
  return (
    <div className="flex items-end gap-[2px]">
      {[1, 2, 3, 4].map((b) => (
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

/** Tiny inline bar under the speed value */
function SpeedCell({ mbps, max }: { mbps: number | null | undefined; max: number }) {
  const value = mbps ?? 0;
  const pct = Math.min(100, Math.round((value / max) * 100)) || 0;
  const color = pct > 60 ? "#3B82F6" : pct > 30 ? "#10B981" : "#F59E0B";
  return (
    <div>
      <span className="text-sm font-medium text-neutral-800">
        {value < 1 ? value.toFixed(1) : Math.round(value)} MB
      </span>
      <div className="mt-0.5 h-[3px] w-16 overflow-hidden rounded-full bg-neutral-100">
        <div style={{ width: `${pct}%`, backgroundColor: color, height: "100%", borderRadius: "999px" }} />
      </div>
    </div>
  );
}

function SsidBadge({ ssid }: { ssid: string }) {
  const lower = ssid.toLowerCase();
  if (lower.includes("staff")) {
    return (
      <span className="inline-flex items-center rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">
        {ssid}
      </span>
    );
  }
  if (lower.includes("med")) {
    return (
      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
        {ssid}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
      {ssid}
    </span>
  );
}

/* ── KPI Card ──────────────────────────────────────────────── */
function KpiCard({
  label,
  value,
  sub,
  subColor = "text-neutral-400"
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
      <p className={`mt-1 text-xs font-medium ${subColor}`}>{sub}</p>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────── */
export default function SessionsPage() {
  const { data, error, isLoading } = useSWR("/api/admin/sessions", fetcher, {
    refreshInterval: 5000,
  });

  const sessions: Session[] = data?.sessions || [];

  const activeSessionsCount = sessions.filter((s) => s.status === "Activo").length;
  const totalSessionsCount = sessions.length;

  // Calcular MB/GB consumidos
  const totalDownMB = sessions.reduce((acc, s) => acc + (s.download ?? 0), 0);
  const totalUpMB = sessions.reduce((acc, s) => acc + (s.upload ?? 0), 0);
  const totalGB = ((totalDownMB + totalUpMB) / 1024).toFixed(2);

  // Desconectar o cerrar sesión
  const handleKick = async (sessionId: string) => {
    if (!confirm("¿Estás seguro de que deseas desconectar esta sesión?")) return;
    try {
      const res = await fetch(`/api/admin/sessions/kick`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) {
        alert("Sesión desconectada exitosamente.");
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top action row */}
      <div className="flex items-center justify-end gap-2">
        <div className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
          {isLoading ? "Cargando..." : `${activeSessionsCount} sesiones activas`}
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50">
          <Download className="h-4 w-4" />
          Exportar
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Sesiones activas"
          value={isLoading ? "-" : activeSessionsCount}
          sub="En este momento"
          subColor="text-neutral-400"
        />
        <KpiCard
          label="Duración promedio"
          value={isLoading ? "-" : totalSessionsCount > 0 ? "1h 15m" : "—"}
          sub="Sesiones de hoy"
          subColor="text-neutral-400"
        />
        <KpiCard
          label="Total hoy"
          value={isLoading ? "-" : totalSessionsCount}
          sub="Sesiones registradas"
          subColor="text-neutral-400"
        />
        <KpiCard
          label="Datos transferidos"
          value={
            isLoading ? (
              "-"
            ) : (
              <>
                {totalGB}{" "}
                <span className="text-xl font-semibold text-neutral-500">GB</span>
              </>
            )
          }
          sub="Hoy"
          subColor="text-neutral-400"
        />
      </div>

      {/* Sessions table */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm">
        {/* Table header row */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3">
          <h2 className="text-base font-semibold text-neutral-800">Sesiones activas</h2>
          <div className="flex items-center gap-1.5 text-xs font-medium text-green-600">
            <span className="h-2 w-2 rounded-full bg-green-500 inline-block animate-pulse" />
            Actualizando en vivo
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading && sessions.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">
              Cargando sesiones desde la base de datos...
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">
              No hay sesiones WiFi activas en este momento.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-50">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Usuario
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Rol
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    IP / MAC
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    SSID
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Señal
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Duración
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    ↓ Descarga
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    ↑ Subida
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Estado
                  </th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {sessions.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-neutral-50">
                    {/* USUARIO */}
                    <td className="px-4 py-3 font-medium text-neutral-800 whitespace-nowrap">
                      {s.name}
                    </td>

                    {/* ROL / TIPO */}
                    <td className="px-3 py-3 text-neutral-500 whitespace-nowrap text-xs">
                      {s.tipo}
                    </td>

                    {/* IP / MAC */}
                    <td className="px-3 py-3">
                      <p className="font-mono text-xs text-neutral-700">{s.ip}</p>
                      <p className="font-mono text-[10px] text-neutral-400">{s.mac}</p>
                    </td>

                    {/* SSID */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <SsidBadge ssid={s.ssid} />
                    </td>

                    {/* SEÑAL */}
                    <td className="px-3 py-3">
                      <SignalBars level={s.signal} />
                    </td>

                    {/* DURACIÓN */}
                    <td className="px-3 py-3 whitespace-nowrap text-neutral-700">{s.duration}</td>

                    {/* ↓ DESCARGA */}
                    <td className="px-3 py-3">
                      <SpeedCell mbps={s.download} max={250} />
                    </td>

                    {/* ↑ SUBIDA */}
                    <td className="px-3 py-3">
                      <SpeedCell mbps={s.upload} max={100} />
                    </td>

                    {/* ESTADO */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <StatusBadge status={s.status} />
                    </td>

                    {/* ACTIONS */}
                    <td className="px-3 py-3">
                      {s.status === "Activo" && (
                        <button
                          onClick={() => handleKick(s.id)}
                          title="Desconectar dispositivo"
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
