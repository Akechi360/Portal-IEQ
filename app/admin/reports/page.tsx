"use client";

import { useState } from "react";
import { Download, TrendingUp } from "lucide-react";

/* ── KPI Data ──────────────────────────────────────────────── */
const KPIS = [
  {
    label: "Sesiones totales",
    value: "4,821",
    sub: "▲ 12% vs mes anterior",
    subColor: "text-emerald-600",
  },
  {
    label: "Usuarios únicos",
    value: "312",
    sub: "▲ 8% vs mes anterior",
    subColor: "text-emerald-600",
  },
  {
    label: "Datos transferidos",
    value: "38 TB",
    sub: "Este mes",
    subColor: "text-neutral-400",
  },
  {
    label: "Tiempo promedio",
    value: "1h 18m",
    sub: "Por sesión",
    subColor: "text-neutral-400",
  },
];

/* ── Chart Data ────────────────────────────────────────────── */
const DAYS = [
  { day: 1, val: 142 },
  { day: 2, val: 168 },
  { day: 3, val: 110 },
  { day: 4, val: 95 },
  { day: 5, val: 201 },
  { day: 6, val: 213, active: true },
  { day: 7, val: 187 },
  { day: 8, val: 155 },
  { day: 9, val: 220 },
  { day: 10, val: 198 },
  { day: 11, val: 174 },
  { day: 12, val: 88 },
];

const PLAN_STATS = [
  { label: "Básico", value: 174, color: "bg-sky-500", stroke: "#0ea5e9" },
  { label: "Pro", value: 94, color: "bg-emerald-500", stroke: "#10b981" },
  { label: "Ilimitado", value: 44, color: "bg-amber-500", stroke: "#f59e0b" },
];

/* ── Sub-components ────────────────────────────────────────── */

function KpiCard({
  label,
  value,
  sub,
  subColor,
}: {
  label: string;
  value: React.ReactNode;
  sub: string;
  subColor: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-100 bg-white px-5 py-4 shadow-sm">
      <p className="text-xs text-neutral-400">{label}</p>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-neutral-900">
          {typeof value === "string" && value.includes(" ") ? (
            <>
              {value.split(" ")[0]} <span className="text-lg font-medium text-neutral-500">{value.split(" ")[1]}</span>
            </>
          ) : (
            value
          )}
        </span>
      </div>
      <p className={`mt-1 text-[11px] font-medium ${subColor}`}>{sub}</p>
    </div>
  );
}

function DonutChart() {
  // SVG Donut Chart with stroke-dasharray
  // Circumference = 100 for r=15.9155
  return (
    <div className="relative h-40 w-40">
      <svg viewBox="0 0 42 42" className="h-full w-full rotate-[-90deg]">
        {/* Ilimitado: 14% (starts at 0, offset 0 -> 14) */}
        <circle
          cx="21"
          cy="21"
          r="15.9155"
          fill="transparent"
          stroke="#f59e0b"
          strokeWidth="6"
          strokeDasharray="14.1 85.9"
          strokeDashoffset="0"
        />
        {/* Pro: 30% (starts at 14, offset -14 -> 44) */}
        <circle
          cx="21"
          cy="21"
          r="15.9155"
          fill="transparent"
          stroke="#10b981"
          strokeWidth="6"
          strokeDasharray="30.1 69.9"
          strokeDashoffset="-14.1"
        />
        {/* Básico: 56% (starts at 44, offset -44 -> 100) */}
        <circle
          cx="21"
          cy="21"
          r="15.9155"
          fill="transparent"
          stroke="#0ea5e9"
          strokeWidth="6"
          strokeDasharray="55.8 44.2"
          strokeDashoffset="-44.2"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-neutral-800">312</span>
        <span className="text-[10px] text-neutral-400">usuarios</span>
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────── */

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("Mes");

  const tabs = ["Hoy", "Semana", "Mes", "Año"];

  return (
    <div className="space-y-5">
      {/* Top action row */}
      <div className="flex items-center justify-between">
        {/* Left: Time Range Tabs */}
        <div className="flex items-center rounded-lg border border-neutral-200 bg-neutral-50 p-0.5">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                timeRange === t
                  ? "bg-white text-neutral-800 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Right: Export buttons */}
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50">
            Mayo 2026
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50">
            Exportar PDF
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((kpi, i) => (
          <KpiCard key={i} {...kpi} />
        ))}
      </div>

      {/* Charts area */}
      <div className="flex flex-col gap-4 lg:flex-row">
        
        {/* Left Chart: Sesiones por día */}
        <div className="flex flex-1 flex-col rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
          <h3 className="mb-8 text-sm font-semibold text-neutral-800">
            Sesiones por día — Mayo 2026
          </h3>
          
          <div className="mt-auto flex w-full items-end justify-between px-2 pt-10">
            {DAYS.map((d) => (
              <div key={d.day} className="flex flex-col items-center gap-2">
                <span className={`text-xs ${d.active ? "font-bold text-neutral-800" : "font-medium text-neutral-800"}`}>
                  {d.val}
                </span>
                <div 
                  className={`w-8 rounded-full ${d.active ? "h-1 bg-sky-500" : "h-0.5 bg-sky-300"}`} 
                />
                <span className={`text-xs ${d.active ? "font-semibold text-neutral-600" : "text-neutral-400"}`}>
                  {d.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Chart: Usuarios por tipo de plan */}
        <div className="flex w-full flex-col rounded-xl border border-neutral-100 bg-white p-5 shadow-sm lg:w-[400px]">
          <h3 className="mb-8 text-sm font-semibold text-neutral-800">
            Usuarios por tipo de plan
          </h3>

          <div className="flex flex-1 items-center justify-between gap-6 px-2">
            <DonutChart />
            <div className="flex flex-col justify-center gap-4 text-sm">
              {PLAN_STATS.map((plan) => (
                <div key={plan.label} className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-sm ${plan.color}`} />
                    <span className="text-neutral-600">{plan.label}</span>
                  </div>
                  <span className="font-semibold text-neutral-800">{plan.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
