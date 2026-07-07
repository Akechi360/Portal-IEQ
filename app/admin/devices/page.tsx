"use client";

import { Wifi, Laptop, Smartphone, Monitor, HelpCircle, RefreshCw } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function fmtBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function guessDeviceType(mac: string): string {
  const oui = mac.replace(/[^a-fA-F0-9]/g, "").substring(0, 6).toUpperCase();
  const apOUIs = ["00D0F8", "0026CB", "EC1D72", "48BF6B"];
  if (apOUIs.includes(oui)) return "Access Point";
  return "Dispositivo";
}

function DeviceIcon({ type }: { type: string }) {
  const cls = "h-5 w-5";
  if (type === "Access Point") return <Wifi className={`${cls} text-sky-600`} />;
  if (type === "Computadora") return <Laptop className={`${cls} text-emerald-600`} />;
  if (type === "Smartphone") return <Smartphone className={`${cls} text-violet-600`} />;
  if (type === "Monitor") return <Monitor className={`${cls} text-amber-600`} />;
  return <HelpCircle className={`${cls} text-neutral-400`} />;
}

function KpiCard({ label, value, sub, subColor = "text-neutral-400" }: { label: string; value: React.ReactNode; sub: string; subColor?: string }) {
  return (
    <div className="rounded-xl border border-neutral-100 bg-white px-5 py-4 shadow-sm">
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-neutral-900">{value}</p>
      <p className={`mt-1 text-xs font-medium ${subColor}`}>{sub}</p>
    </div>
  );
}

function ClientCard({ client }: { client: any }) {
  const deviceType = guessDeviceType(client.mac);
  const durationMin = Math.floor(client.durationSeconds / 60);
  const durationStr = durationMin < 60 ? `${durationMin}m` : `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`;

  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50">
          <DeviceIcon type={deviceType} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-neutral-800">{client.username}</p>
          <p className="text-xs text-neutral-400">{client.ssid}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Activo
        </span>
      </div>
      <div className="space-y-1.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-400">IP</span>
          <span className="font-mono text-xs text-neutral-700">{client.ip}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-400">MAC</span>
          <span className="font-mono text-xs text-sky-600">{client.mac}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-400">Tiempo</span>
          <span className="text-xs text-neutral-700">{durationStr}</span>
        </div>
        <div className="flex items-center justify-between border-t border-neutral-50 pt-1.5">
          <span className="text-xs text-neutral-400">↓ {fmtBytes(client.bytesDown)}</span>
          <span className="text-xs text-neutral-400">↑ {fmtBytes(client.bytesUp)}</span>
        </div>
      </div>
    </div>
  );
}

function ApCard({ ap }: { ap: any }) {
  return (
    <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100">
          <Wifi className="h-5 w-5 text-sky-600" />
        </div>
        <div>
          <p className="font-semibold text-neutral-800">Access Point</p>
          <p className="text-xs text-neutral-400">{ap.ssid}</p>
        </div>
      </div>
      <div className="space-y-1.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-400">IP</span>
          <span className="font-mono text-xs text-neutral-700">{ap.ip}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-400">MAC</span>
          <span className="font-mono text-xs text-sky-600">{ap.mac}</span>
        </div>
        <div className="flex items-center justify-between border-t border-sky-100 pt-1.5">
          <span className="text-xs text-neutral-400">↓ {fmtBytes(ap.bytesDown)}</span>
          <span className="text-xs text-neutral-400">↑ {fmtBytes(ap.bytesUp)}</span>
        </div>
      </div>
    </div>
  );
}

export default function DevicesPage() {
  const { data, isLoading, mutate } = useSWR("/api/admin/devices", fetcher, { refreshInterval: 15000 });

  const clients: any[] = data?.clients || [];
  const aps: any[] = data?.aps || [];
  const kpis = data?.kpis || { totalClients: 0, activeClients: 0, totalAps: 0, totalDownBytes: 0, totalUpBytes: 0 };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => mutate()}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Clientes conectados" value={isLoading ? "—" : kpis.activeClients} sub="En este momento" subColor="text-green-600" />
        <KpiCard label="Access Points" value={isLoading ? "—" : kpis.totalAps} sub="Activos en la red" />
        <KpiCard label="Descarga total" value={isLoading ? "—" : fmtBytes(kpis.totalDownBytes)} sub="Sesiones activas" subColor="text-sky-600" />
        <KpiCard label="Subida total" value={isLoading ? "—" : fmtBytes(kpis.totalUpBytes)} sub="Sesiones activas" subColor="text-emerald-600" />
      </div>

      {aps.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-neutral-500 uppercase tracking-wider">Access Points</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {aps.map((ap) => <ApCard key={ap.mac} ap={ap} />)}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-neutral-500 uppercase tracking-wider">
          Clientes conectados {isLoading ? "" : `(${clients.length})`}
        </h2>
        {isLoading ? (
          <div className="rounded-xl border border-neutral-100 bg-white p-10 text-center text-sm text-neutral-400 shadow-sm">
            Consultando Ruijie Cloud…
          </div>
        ) : clients.length === 0 ? (
          <div className="rounded-xl border border-neutral-100 bg-white p-10 text-center text-sm text-neutral-400 shadow-sm">
            No hay clientes conectados en este momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((c) => <ClientCard key={c.mac} client={c} />)}
          </div>
        )}
      </div>
    </div>
  );
}
