"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";

/* ── Types ─────────────────────────────────────────────────── */
type SessionStatus = "Activo" | "Limitado" | "Autenticando" | "Bloqueado";

interface Session {
  id: string;
  name: string;
  ip: string;
  mac: string;
  ssid: "IEQ-STAFF" | "IEQ-GUEST";
  signal: number; // 1–4
  duration: string;
  download: number; // Mbps
  upload: number;   // Mbps
  status: SessionStatus;
}

/* ── Mock data ─────────────────────────────────────────────── */
const SESSIONS: Session[] = [
  {
    id: "jm",
    name: "Juan Méndez",
    ip: "192.168.1.42",
    mac: "AA:C1:F8:32:9B:85",
    ssid: "IEQ-STAFF",
    signal: 4,
    duration: "2h 14m",
    download: 220,
    upload: 85,
    status: "Activo"
  },
  {
    id: "lc",
    name: "Laura Castro",
    ip: "192.168.1.87",
    mac: "8E:22:A4:CC:74:22",
    ssid: "IEQ-GUEST",
    signal: 3,
    duration: "45m",
    download: 18,
    upload: 4,
    status: "Activo"
  },
  {
    id: "pr",
    name: "Pedro Rojas",
    ip: "192.168.1.103",
    mac: "D9:4F:2B:E4:83:55",
    ssid: "IEQ-GUEST",
    signal: 2,
    duration: "1h 02m",
    download: 5,
    upload: 1,
    status: "Limitado"
  },
  {
    id: "mv",
    name: "María Vega",
    ip: "192.168.1.55",
    mac: "C1:30:88:F4:6A:35",
    ssid: "IEQ-STAFF",
    signal: 4,
    duration: "3h 30m",
    download: 95,
    upload: 32,
    status: "Activo"
  },
  {
    id: "kl",
    name: "Karen Lara",
    ip: "192.168.1.201",
    mac: "F7:44:CC:51:38:77",
    ssid: "IEQ-GUEST",
    signal: 1,
    duration: "12m",
    download: 2,
    upload: 0.5,
    status: "Autenticando"
  }
];

/* ── Helpers ───────────────────────────────────────────────── */
const statusCfg: Record<SessionStatus, { bg: string; text: string; dot: string }> = {
  Activo:       { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500"  },
  Limitado:     { bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-500"  },
  Autenticando: { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500"   },
  Bloqueado:    { bg: "bg-red-50",    text: "text-red-600",    dot: "bg-red-500"    }
};

function StatusBadge({ status }: { status: SessionStatus }) {
  const c = statusCfg[status];
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
function SpeedCell({ mbps, max }: { mbps: number; max: number }) {
  const pct = Math.min(100, Math.round((mbps / max) * 100));
  const color = pct > 60 ? "#3B82F6" : pct > 30 ? "#10B981" : "#F59E0B";
  return (
    <div>
      <span className="text-sm font-medium text-neutral-800">
        {mbps < 1 ? mbps.toFixed(1) : mbps} Mbps
      </span>
      <div className="mt-0.5 h-[3px] w-16 overflow-hidden rounded-full bg-neutral-100">
        <div style={{ width: `${pct}%`, backgroundColor: color, height: "100%", borderRadius: "999px" }} />
      </div>
    </div>
  );
}

function SsidBadge({ ssid }: { ssid: Session["ssid"] }) {
  if (ssid === "IEQ-STAFF") {
    return (
      <span className="inline-flex items-center rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">
        IEQ-STAFF
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
      IEQ-GUEST
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
  const [tick, setTick] = useState(0);

  // Simulate live update pulse every 5 s
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-5">
      {/* Top action row */}
      <div className="flex items-center justify-end gap-2">
        <div className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
          47 sesiones activas
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
          value={47}
          sub="En este momento"
          subColor="text-neutral-400"
        />
        <KpiCard
          label="Duración promedio"
          value="1h 22m"
          sub="Sesión de hoy"
          subColor="text-neutral-400"
        />
        <KpiCard
          label="Total hoy"
          value={213}
          sub="Sesiones iniciadas"
          subColor="text-neutral-400"
        />
        <KpiCard
          label="Datos transferidos"
          value={<>1.4 <span className="text-xl font-semibold text-neutral-500">TB</span></>}
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
            <span
              key={tick}
              className="h-2 w-2 rounded-full bg-green-500 inline-block animate-pulse"
            />
            Actualizando en vivo
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-50">
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Usuario
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
              {SESSIONS.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-neutral-50">
                  {/* USUARIO */}
                  <td className="px-4 py-3 font-medium text-neutral-800 whitespace-nowrap">
                    {s.name}
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
                    <button className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
