"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Search,
  Eye,
  Download,
  UserPlus,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RotateCcw
} from "lucide-react";

// Predefined colors for avatars
const COLORS = ["#12aeb4", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899", "#14B8A6"];

function getInitials(name: string) {
  return name
    .replace("Dr. ", "")
    .replace("Dra. ", "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
}

// Role badge
function RoleBadge({ type }: { type: string }) {
  const label = type === "PACIENTE" ? "Paciente" : type === "TRANSITO" ? "Tránsito" : "Médico";
  const colorClass =
    type === "PACIENTE"
      ? "bg-blue-100 text-blue-700"
      : type === "TRANSITO"
      ? "bg-amber-100 text-amber-700"
      : "bg-purple-100 text-purple-700";
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  );
}

// Status badge
function StatusBadge({ status }: { status: string }) {
  const cfg = ({
    Active: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500", label: "Activo" },
    Expired: { bg: "bg-gray-50", text: "text-gray-500", dot: "bg-gray-400", label: "Expirado" },
    Blocked: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500", label: "Bloqueado" },
    Pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Pendiente" }
  } as Record<string, { bg: string; text: string; dot: string; label: string }>)[status] || {
    bg: "bg-gray-50",
    text: "text-gray-500",
    dot: "bg-gray-400",
    label: status
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/* ── Page ───────────────────────────────────────────────────── */
export default function AdminListPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"todos" | "activos" | "bloqueados">("todos");
  const [page, setPage] = useState(1);
  const limit = 10;

  const apiStatus = tab === "activos" ? "Active" : tab === "bloqueados" ? "Blocked" : undefined;

  const { data, error, isLoading, mutate } = useSWR(
    `/api/list?page=${page}&limit=${limit}${apiStatus ? `&status=${apiStatus}` : ""}${
      search ? `&search=${search}` : ""
    }`,
    (url) => fetch(url).then((res) => res.json())
  );

  const [resettingId, setResettingId] = useState<string | null>(null);

  async function handleResetBinding(id: string, name: string) {
    if (
      !confirm(
        `¿Liberar el dispositivo casado al voucher de ${name}?\nEl próximo equipo que use el voucher quedará casado en su lugar.`
      )
    )
      return;
    setResettingId(id);
    try {
      const res = await fetch(`/api/admin/credentials/${id}/bindings`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) {
        await mutate();
      } else {
        alert(json.message || "No se pudo liberar el dispositivo.");
      }
    } catch {
      alert("Error de red al liberar el dispositivo.");
    } finally {
      setResettingId(null);
    }
  }

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex items-center justify-end gap-2">
        <button className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50">
          <Download className="h-4 w-4" />
          Exportar
        </button>
      </div>

      {/* Main card */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm">
        {/* Search + filter row */}
        <div className="flex items-center gap-2 border-b border-neutral-100 px-5 py-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, código o habitación..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
            />
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-50">
            <SlidersHorizontal className="h-4 w-4" />
            Filtrar
          </button>

          {/* Tabs */}
          <div className="flex items-center rounded-lg border border-neutral-200 bg-neutral-50 p-0.5">
            {(["todos", "activos", "bloqueados"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setPage(1);
                }}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors capitalize ${
                  tab === t
                    ? "bg-white text-primary-600 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Usuario / Código
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Ubicación
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Dispositivos
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Fecha Registro
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-neutral-400">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                    Cargando usuarios de la red...
                  </div>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-neutral-400">
                  No se encontraron usuarios activos en la base de datos.
                </td>
              </tr>
            ) : (
              items.map((item: any) => {
                const initials = getInitials(item.name);
                const color = getColor(item.name);

                return (
                  <tr key={item.id} className="transition-colors hover:bg-neutral-50">
                    {/* USUARIO */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: color }}
                        >
                          {initials}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          <p className="text-xs font-mono text-neutral-400">{item.identifier}</p>
                        </div>
                      </div>
                    </td>

                    {/* TIPO */}
                    <td className="px-4 py-3">
                      <RoleBadge type={item.type} />
                    </td>

                    {/* UBICACION */}
                    <td className="px-4 py-3 text-neutral-700">{item.room || "—"}</td>

                    {/* DISPOSITIVOS */}
                    <td className="px-4 py-3 text-neutral-500">{item.devicesCount ?? 0} conectados</td>

                    {/* ESTADO */}
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>

                    {/* FECHA */}
                    <td className="px-4 py-3 text-neutral-400 text-xs">
                      {new Date(item.createdAt).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>

                    {/* ACCIONES */}
                    <td className="px-4 py-3 text-right">
                      {item.type !== "MEDICO" && (
                        <button
                          onClick={() => handleResetBinding(item.id, item.name)}
                          disabled={resettingId === item.id}
                          title="Liberar el dispositivo casado a este voucher"
                          className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-600 transition-colors hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-50"
                        >
                          {resettingId === item.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="h-3.5 w-3.5" />
                          )}
                          Liberar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Footer: count + pagination */}
        <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-3">
          <p className="text-xs text-neutral-400">
            Mostrando {items.length} de {total} registros en la red
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-500 transition-colors hover:bg-neutral-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex h-7 w-7 items-center justify-center rounded-md text-sm transition-colors ${
                  page === p
                    ? "bg-primary-500 font-semibold text-white"
                    : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-500 transition-colors hover:bg-neutral-50 disabled:opacity-40"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
