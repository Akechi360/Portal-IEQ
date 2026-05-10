"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  UserCircle2
} from "lucide-react";
import { cn } from "@/app/lib/styles";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const principalItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Usuarios", icon: Users },
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
                  ? "bg-sky-500 font-medium text-white"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
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
  const pathname = usePathname();
  const hideShell =
    pathname === "/" || pathname === "/guest" || pathname.startsWith("/guest/") || pathname === "/admin/login" || pathname === "/login";

  if (hideShell) {
    return <div className="min-h-screen">{children}</div>;
  }

  const breadcrumb = getBreadcrumb(pathname);

  return (
    <div className="flex min-h-screen bg-[#f0f4f8] text-neutral-900">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="flex w-[220px] shrink-0 flex-col bg-[#111827] text-white">
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500 text-white">
            <Wifi className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-white">Portal IEQ</p>
            <p className="text-[11px] text-neutral-400">Control de acceso</p>
          </div>
        </div>

        {/* Nav sections */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
          <NavSection title="Principal" items={principalItems} pathname={pathname} />
          <NavSection title="Análisis" items={analysisItems} pathname={pathname} />
          <NavSection title="Sistema" items={systemItems} pathname={pathname} />
        </div>

        {/* Status bar */}
        <div className="border-t border-white/10 px-4 py-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-400 inline-block" />
              <span className="text-neutral-400">Red activa</span>
            </div>
            <span className="text-neutral-400">
              Conectados <span className="font-semibold text-white">47 usuarios</span>
            </span>
          </div>
        </div>

        {/* Admin user */}
        <div className="border-t border-white/10 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-white text-xs font-bold">
              AD
            </div>
            <div>
              <p className="text-sm font-medium text-white">Admin IEQ</p>
              <p className="text-[11px] text-neutral-400">Superadmin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top header */}
        <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-6">
          <p className="text-sm text-neutral-500">{breadcrumb}</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
              Red operativa
            </div>
            <button className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
            <button className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
