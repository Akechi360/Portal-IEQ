"use client";

import { Wifi, Laptop, Smartphone, Tablet, Monitor, HelpCircle, RefreshCw, Plus } from "lucide-react";

/* ── Types ─────────────────────────────────────────────────── */
type DeviceStatus = "Activo" | "Sin registrar" | "Bloqueado";
type DeviceType   = "Access Point" | "Computadora" | "Smartphone" | "Tablet" | "Sin registrar";

interface Device {
  id: string;
  name: string;
  type: DeviceType;
  iconColor: string;         // bg color of the icon square
  iconTextColor: string;
  ip: string;
  mac: string;
  status: DeviceStatus;
}

/* ── Mock data ─────────────────────────────────────────────── */
const DEVICES: Device[] = [
  {
    id: "router",
    name: "Router Principal",
    type: "Access Point",
    iconColor: "bg-sky-100",
    iconTextColor: "text-sky-600",
    ip: "192.168.1.1",
    mac: "00:1A:2B:3C:4D:5E",
    status: "Activo"
  },
  {
    id: "laptop-juan",
    name: "Laptop-Juan",
    type: "Computadora",
    iconColor: "bg-emerald-100",
    iconTextColor: "text-emerald-600",
    ip: "192.168.1.42",
    mac: "A4:C3:F8:12:9E:01",
    status: "Activo"
  },
  {
    id: "iphone-maria",
    name: "iPhone-Maria",
    type: "Smartphone",
    iconColor: "bg-violet-100",
    iconTextColor: "text-violet-600",
    ip: "192.168.1.55",
    mac: "C1:30:88:FA:61:89",
    status: "Activo"
  },
  {
    id: "ipad-recepcion",
    name: "iPad-Recepción",
    type: "Tablet",
    iconColor: "bg-amber-100",
    iconTextColor: "text-amber-600",
    ip: "192.168.1.70",
    mac: "B8:2A:44:8C:90:F1",
    status: "Activo"
  },
  {
    id: "pc-desconocido",
    name: "PC-Desconocido",
    type: "Sin registrar",
    iconColor: "bg-neutral-100",
    iconTextColor: "text-neutral-400",
    ip: "192.168.1.199",
    mac: "??:??:??:??:??:??",
    status: "Sin registrar"
  },
  {
    id: "android-roberto",
    name: "Android-Roberto",
    type: "Smartphone",
    iconColor: "bg-rose-100",
    iconTextColor: "text-rose-500",
    ip: "—",
    mac: "F7:84:CC:12:3E:88",
    status: "Bloqueado"
  }
];

/* ── Helpers ───────────────────────────────────────────────── */
function DeviceIcon({ type, colorClass, textColor }: { type: DeviceType; colorClass: string; textColor: string }) {
  const cls = `h-5 w-5 ${textColor}`;
  const icon =
    type === "Access Point"   ? <Wifi className={cls} />
    : type === "Computadora"  ? <Laptop className={cls} />
    : type === "Smartphone"   ? <Smartphone className={cls} />
    : type === "Tablet"       ? <Tablet className={cls} />
    : <HelpCircle className={cls} />;

  return (
    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorClass}`}>
      {icon}
    </div>
  );
}

const statusCfg: Record<DeviceStatus, { bg: string; text: string; dot: string }> = {
  Activo:         { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500"  },
  "Sin registrar":{ bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-500"  },
  Bloqueado:      { bg: "bg-red-50",    text: "text-red-600",    dot: "bg-red-500"    }
};

function StatusBadge({ status }: { status: DeviceStatus }) {
  const c = statusCfg[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {status}
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

/* ── Device Card ───────────────────────────────────────────── */
function DeviceCard({ device }: { device: Device }) {
  const macIsUnknown = device.mac.includes("?");

  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="mb-4 flex items-start gap-3">
        <DeviceIcon
          type={device.type}
          colorClass={device.iconColor}
          textColor={device.iconTextColor}
        />
        <div>
          <p className="font-semibold text-neutral-800">{device.name}</p>
          <p className="text-xs text-neutral-400">{device.type}</p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-400">IP</span>
          <span className="font-mono text-xs text-neutral-700">{device.ip}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-400">MAC</span>
          <span
            className={`font-mono text-xs ${
              macIsUnknown ? "text-neutral-400" : "text-sky-600"
            }`}
          >
            {device.mac}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-neutral-400">Estado</span>
          <StatusBadge status={device.status} />
        </div>
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────── */
export default function DevicesPage() {
  return (
    <div className="space-y-5">
      {/* Top actions */}
      <div className="flex items-center justify-end gap-2">
        <button className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50">
          <RefreshCw className="h-4 w-4" />
          Escanear red
        </button>
        <button className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-sky-600">
          <Plus className="h-4 w-4" />
          Registrar
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Total dispositivos"
          value={89}
          sub="En la red"
          subColor="text-neutral-400"
        />
        <KpiCard
          label="Conectados"
          value={74}
          sub="Activos ahora"
          subColor="text-green-600"
        />
        <KpiCard
          label="Sin registrar"
          value={11}
          sub="Requieren revisión"
          subColor="text-amber-600"
        />
        <KpiCard
          label="Bloqueados"
          value={4}
          sub="Por política"
          subColor="text-red-500"
        />
      </div>

      {/* Device grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {DEVICES.map((device) => (
          <DeviceCard key={device.id} device={device} />
        ))}
      </div>
    </div>
  );
}
