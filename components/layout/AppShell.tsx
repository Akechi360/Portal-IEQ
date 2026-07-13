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
    <div>
      <div className="mb-1.5 flex items-center gap-2 px-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-neutral-400">
          {title}
        </p>
        <span className="h-px flex-1 bg-neutral-100" aria-hidden="true" />
      </div>
      <nav className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-[10px] py-1.5 pl-3 pr-2.5 text-[13.5px] transition-colors duration-150",
                active
                  ? "bg-primary-50 font-semibold text-primary-900"
                  : "font-medium text-neutral-500 hover:bg-primary-50 hover:text-primary-800"
              )}
            >
              {active && (
                <span
                  className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-gradient-to-b from-primary-600 to-primary-500"
                  aria-hidden="true"
                />
              )}
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-150",
                  active
                    ? "bg-gradient-to-br from-primary-700 to-primary-500 text-white shadow-[0_4px_10px_-4px_rgba(13,111,120,0.6)]"
                    : "text-neutral-400 group-hover:text-primary-600"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
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
        {/* Brand cap teal — eco directo del login */}
        <div className="px-3 pt-3.5 pb-2.5">
          <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(155deg,#0a565d_0%,#0d6f78_55%,#12aeb4_100%)] px-3.5 py-3">
            <span
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(120px_60px_at_90%_-20%,rgba(255,255,255,0.28),transparent_60%)]"
              aria-hidden="true"
            />
            <div className="relative flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-white/25 bg-white/15 backdrop-blur-sm">
                <ShieldCheck className="h-[18px] w-[18px] text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-bold leading-tight text-white">Portal IEQ</p>
                <p className="text-[10.5px] text-white/70">Control de acceso</p>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="shrink-0 rounded-md p-1 text-white/70 hover:bg-white/15 hover:text-white lg:hidden"
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Nav sections */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 pt-1 space-y-3.5">
          <NavSection title="Principal" items={principalItems} pathname={pathname} />
          <NavSection title="Análisis" items={analysisItems} pathname={pathname} />
          <NavSection title="Sistema" items={systemItems} pathname={pathname} />
        </div>

        {/* Status + perfil */}
        <div className="border-t border-neutral-100 px-3 pb-3 pt-2.5">
          <div className="flex items-center justify-between px-1 pb-2.5 text-[11px]">
            <span className="flex items-center gap-1.5 text-neutral-500">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.18)]" />
              Red activa
            </span>
            <span className="text-neutral-400">
              <span className="font-semibold text-neutral-700">{activeClients}</span> conectados
            </span>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-[#f4f6f9]">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-700 to-primary-500 text-xs font-bold text-white shadow-[0_0_0_2px_#fff,0_0_0_3.5px_theme(colors.primary.100)]">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-medium text-neutral-800">{adminName}</p>
              <p className="text-[10.5px] text-neutral-400">{adminRole}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="shrink-0 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
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

        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {/* Tope de ancho: a 1920 no tiene efecto (contenido ~1700px); en
              monitores/TV ultra-anchos centra el contenido para que no se
              estire de borde a borde. */}
          <div className="mx-auto w-full max-w-[1760px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
