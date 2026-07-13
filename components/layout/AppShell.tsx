"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Wifi,
  Monitor,
  BarChart2,
  ArrowRightLeft,
  FileText,
  ShieldCheck,
  Settings,
  Stethoscope,
  LogOut,
  Menu,
  X,
  Bell,
  Building2
} from "lucide-react";
import { cn } from "@/lib/styles";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const principalItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Usuarios", icon: Users },
  { href: "/admin/medicos", label: "Médicos", icon: Stethoscope },
  { href: "/admin/staff", label: "Personal", icon: Building2 },
  { href: "/admin/sessions", label: "Sesiones Wifi", icon: Wifi },
  { href: "/admin/devices", label: "Dispositivos", icon: Monitor }
];

const analysisItems: NavItem[] = [
  { href: "/admin/reports", label: "Reportes", icon: BarChart2 },
  { href: "/admin/traffic", label: "Tráfico", icon: ArrowRightLeft },
  { href: "/admin/logs", label: "Logs de acceso", icon: FileText }
];

const systemItems: NavItem[] = [
  { href: "/admin/policies", label: "Políticas", icon: ShieldCheck },
  { href: "/admin/settings", label: "Configuración", icon: Settings }
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getBreadcrumb(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "Portal IEQ";
  const labels: Record<string, string> = {
    admin: "Portal IEQ",
    dashboard: "Dashboard",
    list: "Usuarios",
    medicos: "Médicos",
    staff: "Personal",
    sessions: "Sesiones Wifi",
    devices: "Dispositivos",
    reports: "Reportes",
    traffic: "Tráfico",
    logs: "Logs de acceso",
    policies: "Políticas",
    settings: "Configuración"
  };
  return segments.map((s) => labels[s] ?? s.charAt(0).toUpperCase() + s.slice(1)).join(" / ");
}

function NavSection({
  title,
  items,
  pathname
}: {
  title: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <div className="mb-1">
      <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
        {title}
      </p>
      <nav className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150",
                active
                  ? "bg-primary-600 font-medium text-white shadow-sm"
                  : "text-neutral-500 hover:bg-primary-50 hover:text-primary-700"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { data: meData } = useSWR("/api/auth/me", fetcher);
  const { data: trafficData } = useSWR("/api/admin/traffic", fetcher, { refreshInterval: 30000 });

  // Drawer móvil: abierto/cerrado. Se cierra solo al navegar.
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const adminUser = meData?.user;
  const adminName: string = adminUser?.nombre || adminUser?.name || "Admin IEQ";
  const adminRole: string = adminUser?.role || "Superadmin";
  const initials = adminName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
  const activeClients: number = trafficData?.activeClients ?? 0;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const hideShell =
    pathname === "/" || pathname === "/guest" || pathname.startsWith("/guest/") || pathname === "/admin/login" || pathname === "/login";

  if (hideShell) {
    return <div className="min-h-screen">{children}</div>;
  }

  const breadcrumb = getBreadcrumb(pathname);

  return (
    <div className="flex min-h-screen bg-[#f4f6f9] text-neutral-900">
      {/* ── Overlay (solo móvil, al abrir el drawer) ──────────── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[220px] shrink-0 flex-col border-r border-neutral-200 bg-white text-neutral-700 transition-transform duration-200 ease-in-out lg:static lg:z-auto lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-neutral-100">
          <img src="/logo-ieq.png" alt="IEQ" className="h-9 w-auto object-contain" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold leading-tight text-neutral-800">Portal IEQ</p>
            <p className="text-[11px] text-neutral-400">Control de acceso</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="shrink-0 rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav sections */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
          <NavSection title="Principal" items={principalItems} pathname={pathname} />
          <NavSection title="Análisis" items={analysisItems} pathname={pathname} />
          <NavSection title="Sistema" items={systemItems} pathname={pathname} />
        </div>

        {/* Status bar */}
        <div className="border-t border-neutral-100 px-4 py-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
              <span className="text-neutral-500">Red activa</span>
            </div>
            <span className="text-neutral-500">
              Conectados <span className="font-semibold text-neutral-800">{activeClients} usuarios</span>
            </span>
          </div>
        </div>

        {/* Admin user + logout */}
        <div className="border-t border-neutral-100 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white text-xs font-bold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-800">{adminName}</p>
              <p className="text-[11px] text-neutral-400">{adminRole}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="shrink-0 rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top header */}
        <header className="relative flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              className="shrink-0 rounded-md p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100 active:scale-[0.96] lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="truncate text-sm text-neutral-500">{breadcrumb}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
              Red operativa
            </div>
            <button
              aria-label="Notificaciones"
              className="rounded-lg border border-neutral-200 bg-white p-2 text-neutral-500 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 active:scale-[0.96]"
            >
              <Bell className="h-4 w-4" />
            </button>
            <button
              aria-label="Configuración"
              className="rounded-lg border border-neutral-200 bg-white p-2 text-neutral-500 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 active:scale-[0.96]"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
          {/* Filo de marca: la misma firma teal del login, aquí como detalle discreto */}
          <div
            className="pointer-events-none absolute inset-x-0 -bottom-px h-[2px] bg-gradient-to-r from-primary-600 via-primary-400/60 to-transparent"
            aria-hidden="true"
          />
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
