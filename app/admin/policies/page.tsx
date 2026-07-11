"use client";

import { Plus } from "lucide-react";

/* ── Mock Data ─────────────────────────────────────────────── */
const PLANS = [
  {
    id: "basico",
    name: "Básico",
    users: 174,
    color: "bg-primary-100",
    badge: "text-primary-600 bg-primary-50",
    active: false,
    details: [
      { label: "Descarga", value: "10 Mbps" },
      { label: "Datos/día", value: "2 GB" },
      { label: "Tiempo máx", value: "4h" },
      { label: "Dispositivos", value: "1" },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    users: 94,
    color: "bg-emerald-100",
    badge: "text-emerald-600 bg-emerald-50",
    active: true, // Selected/highlighted
    details: [
      { label: "Descarga", value: "50 Mbps" },
      { label: "Datos/día", value: "20 GB" },
      { label: "Tiempo máx", value: "12h" },
      { label: "Dispositivos", value: "3" },
    ],
  },
  {
    id: "ilimitado",
    name: "Ilimitado",
    users: 44,
    color: "bg-violet-100",
    badge: "text-violet-600 bg-violet-50",
    active: false,
    details: [
      { label: "Descarga", value: "Sin límite" },
      { label: "Datos/día", value: "Sin límite" },
      { label: "Tiempo máx", value: "Sin límite" },
      { label: "Dispositivos", value: "10" },
    ],
  },
];

const RULES = [
  {
    id: "streaming",
    label: "Bloquear streaming en horario laboral",
    color: "bg-red-100",
    enabled: true,
  },
  {
    id: "gaming",
    label: "Bloquear plataformas de gaming",
    color: "bg-red-100",
    enabled: true,
  },
  {
    id: "dns",
    label: "Forzar DNS seguro (HTTPS)",
    color: "bg-emerald-100",
    enabled: true,
  },
  {
    id: "throttle",
    label: "Limitar velocidad en horario pico",
    color: "bg-amber-100",
    enabled: false,
  },
];

const SCHEDULE_DAYS = [
  { label: "Lun", status: "full" },
  { label: "Mar", status: "full" },
  { label: "Mié", status: "full" },
  { label: "Jue", status: "full" },
  { label: "Vie", status: "full" },
  { label: "Sáb", status: "partial" },
  { label: "Dom", status: "none" },
];

/* ── Components ────────────────────────────────────────────── */

function Switch({ enabled }: { enabled: boolean }) {
  return (
    <div
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out ${
        enabled ? "bg-primary-500" : "bg-neutral-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </div>
  );
}

function PlanCard({ plan }: { plan: typeof PLANS[0] }) {
  return (
    <div
      className={`flex flex-col rounded-xl border bg-white p-5 transition-all ${
        plan.active
          ? "border-primary-400 shadow-md ring-1 ring-primary-400"
          : "border-neutral-100 shadow-sm hover:shadow-md hover:border-neutral-200"
      }`}
    >
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 shrink-0 rounded-xl ${plan.color}`} />
          <div>
            <h3 className="font-semibold text-neutral-800">{plan.name}</h3>
            <p className="text-xs text-neutral-400">{plan.users} usuarios</p>
          </div>
        </div>
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${plan.badge}`}>
          Activo
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {plan.details.map((d) => (
          <div key={d.label} className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">{d.label}</span>
            <span className="font-medium text-neutral-800">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PoliciesPage() {
  return (
    <div className="space-y-5">
      {/* Top action row */}
      <div className="flex items-center justify-end">
        <button className="flex items-center gap-1.5 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600">
          Nueva política
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        
        {/* Reglas de contenido (takes 2 columns roughly, or split 50/50? The screenshot looks like 50/50 or maybe 3/5 and 2/5) */}
        <div className="flex flex-col rounded-xl border border-neutral-100 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-6 text-sm font-semibold text-neutral-800">
            Reglas de contenido
          </h3>
          <div className="flex flex-col gap-2">
            {RULES.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between rounded-lg border border-neutral-50 bg-neutral-50/50 px-4 py-3"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-8 w-8 shrink-0 rounded-lg ${rule.color}`} />
                  <span className="text-sm font-medium text-neutral-700">
                    {rule.label}
                  </span>
                </div>
                <Switch enabled={rule.enabled} />
              </div>
            ))}
          </div>
        </div>

        {/* Horario de acceso */}
        <div className="flex flex-col rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
          <h3 className="mb-6 text-sm font-semibold text-neutral-800">
            Horario de acceso
          </h3>
          
          {/* Days visualizer */}
          <div className="mb-6 flex w-full justify-between gap-1">
            {SCHEDULE_DAYS.map((day) => {
              let bg = "bg-neutral-100";
              if (day.status === "full") bg = "bg-primary-100";
              if (day.status === "partial") bg = "bg-amber-100";
              
              return (
                <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[10px] font-medium text-neutral-400">
                    {day.label}
                  </span>
                  <div className={`h-8 w-full rounded-md ${bg}`} />
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mb-6 flex items-center gap-4 text-[11px] font-medium text-neutral-500">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary-100" />
              Acceso completo
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-amber-100" />
              Acceso parcial
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-neutral-100" />
              Sin acceso
            </div>
          </div>

          {/* Details Box */}
          <div className="mt-auto flex flex-col rounded-lg bg-neutral-50 p-4">
            <span className="mb-2 text-sm font-semibold text-neutral-800">
              Horario laboral
            </span>
            <div className="flex flex-col gap-1 text-xs text-neutral-600">
              <p>Lun–Vie: 06:00 – 22:00</p>
              <p>Sáb: 08:00 – 14:00</p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
