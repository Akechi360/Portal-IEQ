"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Eye,
  Edit2,
  Ban,
  Download,
  UserPlus,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────────── */
type UserStatus = "Activo" | "Limitado" | "Bloqueado";
type UserRole = "Admin" | "Usuario";
type UserPlan = "Ilimitado" | "Pro" | "Básico";

interface User {
  id: string;
  initials: string;
  color: string;
  name: string;
  email: string;
  role: UserRole;
  plan: UserPlan;
  lastAccess: string;
  status: UserStatus;
}

/* ── Mock data (124 total, showing page 1) ─────────────────── */
const MOCK_USERS: User[] = [
  {
    id: "jm",
    initials: "JM",
    color: "#3B82F6",
    name: "Juan Méndez",
    email: "jmendez@ieq.com",
    role: "Admin",
    plan: "Ilimitado",
    lastAccess: "Hace 2 min",
    status: "Activo"
  },
  {
    id: "lc",
    initials: "LC",
    color: "#10B981",
    name: "Laura Castro",
    email: "lcastro@gmail.com",
    role: "Usuario",
    plan: "Básico",
    lastAccess: "Hace 45 min",
    status: "Activo"
  },
  {
    id: "pr",
    initials: "PR",
    color: "#8B5CF6",
    name: "Pedro Rojas",
    email: "projas@hotmail.com",
    role: "Usuario",
    plan: "Pro",
    lastAccess: "Hace 1h",
    status: "Limitado"
  },
  {
    id: "mv",
    initials: "MV",
    color: "#F59E0B",
    name: "María Vega",
    email: "mvega@outlook.com",
    role: "Usuario",
    plan: "Pro",
    lastAccess: "Hace 3h",
    status: "Activo"
  },
  {
    id: "rt",
    initials: "RT",
    color: "#EF4444",
    name: "Roberto Torres",
    email: "rtorres@yahoo.com",
    role: "Usuario",
    plan: "Básico",
    lastAccess: "Hace 4h",
    status: "Bloqueado"
  },
  {
    id: "kl",
    initials: "KL",
    color: "#EC4899",
    name: "Karen Lara",
    email: "klara@gmail.com",
    role: "Usuario",
    plan: "Básico",
    lastAccess: "Hace 12 min",
    status: "Activo"
  }
];

const TOTAL_USERS = 124;
const ACTIVE_USERS = 47;
const BLOCKED_USERS = 5;

/* ── Sub-components ─────────────────────────────────────────── */

// Role badge
function RoleBadge({ role }: { role: UserRole }) {
  if (role === "Admin") {
    return (
      <span className="inline-flex items-center rounded-md bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
        Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
      Usuario
    </span>
  );
}

// Status badge
function StatusBadge({ status }: { status: UserStatus }) {
  const cfg = {
    Activo: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
    Limitado: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
    Bloqueado: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" }
  }[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

// Row action buttons (View, Edit, Block)
function ActionButtons({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-1">
      <button
        title="Ver perfil"
        className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600"
      >
        <Eye className="h-3.5 w-3.5" />
      </button>
      <button
        title="Editar"
        className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600"
      >
        <Edit2 className="h-3.5 w-3.5" />
      </button>
      <button
        title={user.status === "Bloqueado" ? "Desbloquear" : "Bloquear"}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
      >
        <Ban className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────── */
export default function AdminListPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"todos" | "activos" | "bloqueados">("todos");
  const [page, setPage] = useState(1);
  const TOTAL_PAGES = 3;

  const filtered = useMemo(() => {
    let base = MOCK_USERS;
    if (tab === "activos") base = base.filter((u) => u.status === "Activo");
    if (tab === "bloqueados") base = base.filter((u) => u.status === "Bloqueado");
    if (search.trim()) {
      const q = search.toLowerCase();
      base = base.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }
    return base;
  }, [search, tab]);

  const tabs = [
    { key: "todos" as const, label: `Todos (${TOTAL_USERS})` },
    { key: "activos" as const, label: `Activos (${ACTIVE_USERS})` },
    { key: "bloqueados" as const, label: `Bloqueados (${BLOCKED_USERS})` }
  ];

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex items-center justify-end gap-2">
        <button className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50">
          <Download className="h-4 w-4" />
          Exportar
        </button>
        <button className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-sky-600">
          <UserPlus className="h-4 w-4" />
          Nuevo usuario
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
              placeholder="Buscar por nombre, correo o MAC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-50">
            <SlidersHorizontal className="h-4 w-4" />
            Filtrar
          </button>

          {/* Tabs */}
          <div className="flex items-center rounded-lg border border-neutral-200 bg-neutral-50 p-0.5">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key);
                  setPage(1);
                }}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  tab === t.key
                    ? "bg-white text-sky-600 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Usuario
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Rol
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Plan
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Último acceso
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-sm text-neutral-400"
                >
                  No se encontraron usuarios.
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-neutral-50"
                >
                  {/* USUARIO */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.initials}
                      </div>
                      <div>
                        <p className="font-medium text-sky-600 hover:underline cursor-pointer">
                          {user.name}
                        </p>
                        <p className="text-xs text-neutral-400">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* ROL */}
                  <td className="px-4 py-3">
                    <RoleBadge role={user.role} />
                  </td>

                  {/* PLAN */}
                  <td className="px-4 py-3 text-neutral-700">{user.plan}</td>

                  {/* ÚLTIMO ACCESO */}
                  <td className="px-4 py-3 text-neutral-500">{user.lastAccess}</td>

                  {/* ESTADO */}
                  <td className="px-4 py-3">
                    <StatusBadge status={user.status} />
                  </td>

                  {/* ACCIONES */}
                  <td className="px-4 py-3">
                    <ActionButtons user={user} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer: count + pagination */}
        <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-3">
          <p className="text-xs text-neutral-400">
            Mostrando 1–{filtered.length} de {TOTAL_USERS} usuarios
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-500 transition-colors hover:bg-neutral-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex h-7 w-7 items-center justify-center rounded-md text-sm transition-colors ${
                  page === p
                    ? "bg-sky-500 font-semibold text-white"
                    : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(TOTAL_PAGES, p + 1))}
              disabled={page === TOTAL_PAGES}
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
