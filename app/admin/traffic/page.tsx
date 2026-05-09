"use client";

import { RefreshCw } from "lucide-react";

/* ── KPI Data ──────────────────────────────────────────────── */
const KPIS = [
  {
    label: "Descarga actual",
    value: "220",
    unit: "Mbps",
    sub: "Pico: 410 Mbps",
    subColor: "text-neutral-400",
  },
  {
    label: "Subida actual",
    value: "120",
    unit: "Mbps",
    sub: "Pico: 185 Mbps",
    subColor: "text-neutral-400",
  },
  {
    label: "Uso del canal",
    value: "68",
    unit: "%",
    sub: "De 500 Mbps total",
    subColor: "text-neutral-400",
  },
  {
    label: "Latencia",
    value: "12",
    unit: "ms",
    sub: "Excelente",
    subColor: "text-emerald-600",
  },
];

/* ── Protocol Data ─────────────────────────────────────────── */
const PROTOCOLS = [
  { label: "HTTPS", percent: 74, color: "bg-sky-500" },
  { label: "HTTP", percent: 12, color: "bg-sky-300" },
  { label: "Streaming", percent: 8, color: "bg-emerald-500" },
  { label: "Gaming", percent: 4, color: "bg-amber-500" },
  { label: "Otro", percent: 2, color: "bg-neutral-200" },
];

/* ── Top Users Data ────────────────────────────────────────── */
const TOP_USERS = [
  { rank: 1, name: "María Vega", usage: "42 GB" },
  { rank: 2, name: "Juan Méndez", usage: "38 GB" },
  { rank: 3, name: "Carlos Mora", usage: "27 GB" },
  { rank: 4, name: "Laura Castro", usage: "19 GB" },
  { rank: 5, name: "Pedro Rojas", usage: "14 GB" },
];

/* ── Sub-components ────────────────────────────────────────── */
function KpiCard({
  label,
  value,
  unit,
  sub,
  subColor,
}: {
  label: string;
  value: string;
  unit: string;
  sub: string;
  subColor: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-100 bg-white px-5 py-4 shadow-sm">
      <p className="text-xs text-neutral-400">{label}</p>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-neutral-900">{value}</span>
        <span className="text-lg font-medium text-neutral-500">{unit}</span>
      </div>
      <p className={`mt-1 text-[11px] font-medium ${subColor}`}>{sub}</p>
    </div>
  );
}

function AreaChart() {
  return (
    <div className="relative h-[220px] w-full pt-4">
      <svg
        viewBox="0 0 1000 200"
        preserveAspectRatio="none"
        className="absolute bottom-6 left-0 h-[160px] w-full"
      >
        <defs>
          <linearGradient id="grad-blue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="grad-green" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Green Area (Subida) */}
        <path
          d="M0,140 C150,140 250,110 350,130 C450,150 550,160 650,120 C750,80 850,100 1000,90 L1000,200 L0,200 Z"
          fill="url(#grad-green)"
        />
        <path
          d="M0,140 C150,140 250,110 350,130 C450,150 550,160 650,120 C750,80 850,100 1000,90"
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
        />

        {/* Blue Area (Descarga) */}
        <path
          d="M0,100 C150,100 250,60 350,100 C450,140 550,140 650,60 C750,-20 850,60 1000,50 L1000,200 L0,200 Z"
          fill="url(#grad-blue)"
        />
        <path
          d="M0,100 C150,100 250,60 350,100 C450,140 550,140 650,60 C750,-20 850,60 1000,50"
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="2"
        />
      </svg>
      
      {/* X-axis labels */}
      <div className="absolute bottom-0 left-0 flex w-full justify-between text-[10px] text-neutral-400 px-1">
        <span>-60m</span>
        <span>-50m</span>
        <span>-40m</span>
        <span>-30m</span>
        <span>-20m</span>
        <span>-10m</span>
        <span>Ahora</span>
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────── */
export default function TrafficPage() {
  return (
    <div className="space-y-5">
      {/* Top action row */}
      <div className="flex items-center justify-end gap-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-green-600">
          <span className="h-2 w-2 rounded-full bg-green-500 inline-block animate-pulse" />
          En vivo
        </div>
        <button className="rounded-lg border border-neutral-200 bg-white px-4 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50">
          Actualizar
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((kpi, i) => (
          <KpiCard key={i} {...kpi} />
        ))}
      </div>

      {/* Main Chart */}
      <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-800">
            Ancho de banda — última hora
          </h3>
          <div className="flex items-center gap-4 text-xs font-medium text-neutral-600">
            <div className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 bg-sky-500 rounded-full" />
              Descarga
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 bg-emerald-500 rounded-full" />
              Subida
            </div>
          </div>
        </div>
        <AreaChart />
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Tráfico por protocolo */}
        <div className="flex flex-col rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
          <h3 className="mb-6 text-sm font-semibold text-neutral-800">
            Tráfico por protocolo
          </h3>
          <div className="flex flex-col gap-4 text-sm">
            {PROTOCOLS.map((p) => (
              <div key={p.label} className="flex items-center gap-4">
                <span className="w-20 shrink-0 text-neutral-600">{p.label}</span>
                <div className="h-1.5 flex-1 rounded-full bg-neutral-50">
                  <div
                    className={`h-full rounded-full ${p.color}`}
                    style={{ width: `${p.percent}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right font-medium text-neutral-800">
                  {p.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top usuarios */}
        <div className="flex flex-col rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-neutral-800">
            Top usuarios por consumo
          </h3>
          <div className="flex flex-col">
            {TOP_USERS.map((u) => (
              <div
                key={u.rank}
                className="flex items-center justify-between border-b border-neutral-50 py-3 last:border-0"
              >
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-xs text-neutral-400">#{u.rank}</span>
                  <span className="font-medium text-neutral-700">{u.name}</span>
                </div>
                <span className="text-sm font-medium text-sky-500">{u.usage}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
