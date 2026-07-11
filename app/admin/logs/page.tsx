"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import useSWR from "swr";

/* ── Types ─────────────────────────────────────────────────── */
type LogType = "Bloqueo" | "Conexión" | "Advertencia" | "Éxito" | "Rechazado" | "Desconexión";

interface LogEntry {
  id: string;
  type: LogType;
  user: string;
  action: string;
  ip: string;
  mac: string;
  ssid: string;
  time: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/* ── Helpers ───────────────────────────────────────────────── */
const TYPE_STYLES: Record<LogType, { bg: string; text: string; iconBg: string }> = {
  Bloqueo: { bg: "bg-red-50", text: "text-red-600", iconBg: "bg-red-100" },
  Rechazado: { bg: "bg-red-50", text: "text-red-600", iconBg: "bg-red-100" },
  Conexión: { bg: "bg-primary-50", text: "text-primary-600", iconBg: "bg-primary-100" },
  Advertencia: { bg: "bg-amber-50", text: "text-amber-600", iconBg: "bg-amber-100" },
  Éxito: { bg: "bg-green-50", text: "text-green-600", iconBg: "bg-green-100" },
  Desconexión: { bg: "bg-neutral-100", text: "text-neutral-500", iconBg: "bg-neutral-100" },
};

function LogRow({ log }: { log: LogEntry }) {
  const styles = TYPE_STYLES[log.type] || TYPE_STYLES["Conexión"];

  return (
    <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 last:border-0 hover:bg-neutral-50 transition-colors">
      <div className="flex items-start gap-4">
        {/* Icon Square */}
        <div className={`mt-0.5 h-8 w-8 shrink-0 rounded-lg flex items-center justify-center font-bold text-xs ${styles.iconBg} ${styles.text}`}>
          💡
        </div>
        
        {/* Text */}
        <div>
          <p className="text-sm text-neutral-800">
            <span className="font-semibold">{log.user}</span> — {log.action}
          </p>
          <div className="mt-1 flex items-center gap-2 text-[11px] font-mono text-neutral-400">
            <span>{log.ip}</span>
            <span>·</span>
            <span>{log.mac}</span>
            <span>·</span>
            <span className="font-sans font-medium text-neutral-500">{log.ssid}</span>
          </div>
        </div>
      </div>

      {/* Right side: Badge and Time */}
      <div className="flex items-center gap-4">
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${styles.bg} ${styles.text}`}>
          {log.type}
        </span>
        <span className="w-24 text-right text-xs text-neutral-400 font-mono">
          {log.time}
        </span>
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────── */
export default function LogsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "AUTH_SUCCESS" | "BLOCKED" | "AUTH_FAIL">("ALL");

  const queryUrl = `/api/admin/logs?search=${encodeURIComponent(search)}&event=${filter}`;
  const { data, error, isLoading } = useSWR(queryUrl, fetcher, {
    refreshInterval: 4000,
  });

  const logs: LogEntry[] = data?.logs || [];
  const TOTAL_EVENTS = data?.total || 0;

  const filtersMap = [
    { label: "Todos", value: "ALL" as const },
    { label: "Éxito", value: "AUTH_SUCCESS" as const },
    { label: "Bloqueos", value: "BLOCKED" as const },
    { label: "Rechazos", value: "AUTH_FAIL" as const },
  ];

  return (
    <div className="space-y-4">
      {/* Top action row */}
      <div className="flex items-center justify-end gap-2">
        <button className="rounded-lg border border-neutral-200 bg-white px-4 py-1.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50">
          Hoy
        </button>
        <button className="rounded-lg border border-neutral-200 bg-white px-4 py-1.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50">
          Exportar
        </button>
      </div>

      {/* Main Card */}
      <div className="flex flex-col rounded-xl border border-neutral-100 bg-white shadow-sm">
        
        {/* Header / Search row */}
        <div className="flex items-center gap-3 border-b border-neutral-100 p-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por usuario, MAC, IP o evento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
            />
          </div>

          {/* Filter Toggles */}
          <div className="flex items-center rounded-lg border border-neutral-200 bg-white p-0.5 shadow-sm">
            {filtersMap.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  filter === f.value
                    ? "bg-primary-50 text-primary-600"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Logs List */}
        <div className="flex flex-col">
          {isLoading && logs.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">
              Cargando logs de auditoría...
            </div>
          ) : logs.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">
              No se encontraron logs de auditoría para los filtros aplicados.
            </div>
          ) : (
            logs.map((log) => (
              <LogRow key={log.id} log={log} />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-3">
          <p className="text-xs text-neutral-400">
            Mostrando {logs.length} de {TOTAL_EVENTS} eventos hoy
          </p>

          <div className="flex items-center gap-1">
            <button className="flex h-7 w-7 items-center justify-center rounded-md text-sm bg-primary-500 font-semibold text-white">
              1
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
