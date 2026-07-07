"use client";

import { RefreshCw } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function fmtBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function KpiCard({ label, value, unit, sub, subColor }: { label: string; value: string; unit: string; sub: string; subColor: string }) {
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

export default function TrafficPage() {
  const { data, isLoading, mutate } = useSWR("/api/admin/traffic", fetcher, { refreshInterval: 15000 });

  const activeClients: number = data?.activeClients ?? 0;
  const totalDownBytes: number = data?.totalDownBytes ?? 0;
  const totalUpBytes: number = data?.totalUpBytes ?? 0;
  const totalBytes: number = data?.totalBytes ?? 0;
  const topUsers: any[] = data?.topUsers ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end gap-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-green-600">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green-500" />
          En vivo
        </div>
        <button
          onClick={() => mutate()}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-4 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Clientes activos"
          value={isLoading ? "—" : String(activeClients)}
          unit=""
          sub="Conectados ahora"
          subColor="text-emerald-600"
        />
        <KpiCard
          label="Descarga total"
          value={isLoading ? "—" : fmtBytes(totalDownBytes)}
          unit=""
          sub="Sesiones activas"
          subColor="text-sky-600"
        />
        <KpiCard
          label="Subida total"
          value={isLoading ? "—" : fmtBytes(totalUpBytes)}
          unit=""
          sub="Sesiones activas"
          subColor="text-neutral-400"
        />
        <KpiCard
          label="Consumo total"
          value={isLoading ? "—" : fmtBytes(totalBytes)}
          unit=""
          sub="Down + Up combinado"
          subColor="text-neutral-400"
        />
      </div>

      <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-neutral-800">
          Top usuarios por consumo
        </h3>
        {isLoading ? (
          <p className="py-8 text-center text-sm text-neutral-400">Consultando Ruijie Cloud…</p>
        ) : topUsers.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-400">No hay sesiones activas en este momento.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="pb-2 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">#</th>
                  <th className="pb-2 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Usuario</th>
                  <th className="pb-2 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">MAC</th>
                  <th className="pb-2 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">IP</th>
                  <th className="pb-2 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">SSID</th>
                  <th className="pb-2 text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-400">↓ Descarga</th>
                  <th className="pb-2 text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-400">↑ Subida</th>
                  <th className="pb-2 text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {topUsers.map((u, i) => (
                  <tr key={u.mac} className="hover:bg-neutral-50">
                    <td className="py-2.5 text-xs text-neutral-400">#{i + 1}</td>
                    <td className="py-2.5 font-medium text-neutral-800">{u.username}</td>
                    <td className="py-2.5 font-mono text-xs text-sky-600">{u.mac}</td>
                    <td className="py-2.5 font-mono text-xs text-neutral-500">{u.ip}</td>
                    <td className="py-2.5 text-xs text-neutral-500">{u.ssid}</td>
                    <td className="py-2.5 text-right text-xs font-medium text-sky-600">{fmtBytes(u.bytesDown)}</td>
                    <td className="py-2.5 text-right text-xs font-medium text-emerald-600">{fmtBytes(u.bytesUp)}</td>
                    <td className="py-2.5 text-right text-xs font-semibold text-neutral-800">{fmtBytes(u.totalBytes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
