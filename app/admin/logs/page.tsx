"use client";

import { useState } from "react";
import { Search } from "lucide-react";

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

/* ── Mock Data ─────────────────────────────────────────────── */
const LOGS: LogEntry[] = [
  {
    id: "1",
    type: "Bloqueo",
    user: "Roberto Torres",
    action: "sesión bloqueada por exceder límite de datos",
    ip: "192.168.1.178",
    mac: "F7:8A:CC:12:3E:88",
    ssid: "IEQ-GUEST",
    time: "10:47:23",
  },
  {
    id: "2",
    type: "Conexión",
    user: "Karen Lara",
    action: "nueva sesión iniciada correctamente",
    ip: "192.168.1.201",
    mac: "F7:8A:CC:12:3E:77",
    ssid: "IEQ-GUEST",
    time: "10:38:11",
  },
  {
    id: "3",
    type: "Advertencia",
    user: "Pedro Rojas",
    action: "límite de velocidad aplicado (plan básico)",
    ip: "192.168.1.103",
    mac: "D5:9F:2B:EA:03:55",
    ssid: "IEQ-GUEST",
    time: "09:58:44",
  },
  {
    id: "4",
    type: "Éxito",
    user: "María Vega",
    action: "autenticación exitosa",
    ip: "192.168.1.55",
    mac: "C1:3D:88:FA:61:89",
    ssid: "IEQ-STAFF",
    time: "07:30:05",
  },
  {
    id: "5",
    type: "Éxito",
    user: "Juan Méndez",
    action: "autenticación exitosa",
    ip: "192.168.1.42",
    mac: "A4:C3:F8:12:9E:01",
    ssid: "IEQ-STAFF",
    time: "07:14:38",
  },
  {
    id: "6",
    type: "Rechazado",
    user: "Dispositivo desconocido",
    action: "intento de acceso rechazado",
    ip: "—",
    mac: "B8:22:99:FF:01:A3",
    ssid: "IEQ-STAFF",
    time: "06:52:17",
  },
  {
    id: "7",
    type: "Desconexión",
    user: "Laura Castro",
    action: "sesión cerrada por inactividad",
    ip: "192.168.1.87",
    mac: "82:11:44:CC:7A:22",
    ssid: "IEQ-GUEST",
    time: "06:40:00",
  },
];

/* ── Helpers ───────────────────────────────────────────────── */
const TYPE_STYLES: Record<LogType, { bg: string; text: string; iconBg: string }> = {
  Bloqueo: { bg: "bg-red-50", text: "text-red-600", iconBg: "bg-red-100" },
  Rechazado: { bg: "bg-red-50", text: "text-red-600", iconBg: "bg-red-100" },
  Conexión: { bg: "bg-sky-50", text: "text-sky-600", iconBg: "bg-sky-100" },
  Advertencia: { bg: "bg-amber-50", text: "text-amber-600", iconBg: "bg-amber-100" },
  Éxito: { bg: "bg-green-50", text: "text-green-600", iconBg: "bg-green-100" },
  Desconexión: { bg: "bg-neutral-100", text: "text-neutral-500", iconBg: "bg-neutral-100" },
};

function LogRow({ log }: { log: LogEntry }) {
  const styles = TYPE_STYLES[log.type];

  return (
    <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 last:border-0 hover:bg-neutral-50 transition-colors">
      <div className="flex items-start gap-4">
        {/* Icon Square */}
        <div className={`mt-0.5 h-8 w-8 shrink-0 rounded-lg ${styles.iconBg}`} />
        
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
        <span className="w-16 text-right text-xs text-neutral-400 font-mono">
          {log.time}
        </span>
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────── */
export default function LogsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Éxito" | "Bloqueo" | "Alerta" | "">("Éxito");

  const TOTAL_EVENTS = "1,284";

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
              placeholder="Buscar por usuario, IP o evento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>

          {/* Filter Toggles */}
          <div className="flex items-center rounded-lg border border-neutral-200 bg-white p-0.5 shadow-sm">
            {(["Éxito", "Bloqueo", "Alerta"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  filter === f
                    ? "bg-sky-50 text-sky-600"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Logs List */}
        <div className="flex flex-col">
          {LOGS.map((log) => (
            <LogRow key={log.id} log={log} />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-3">
          <p className="text-xs text-neutral-400">
            Mostrando 1–7 de {TOTAL_EVENTS} eventos hoy
          </p>

          <div className="flex items-center gap-1">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={`flex h-7 w-7 items-center justify-center rounded-md text-sm transition-colors ${
                  p === 1
                    ? "bg-sky-500 font-semibold text-white"
                    : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}
