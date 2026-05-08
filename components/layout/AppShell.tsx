"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ClipboardList,
  House,
  LayoutDashboard,
  Stethoscope,
  Ticket,
  UserCircle2,
  Wifi
} from "lucide-react";
import { cn } from "@/app/lib/styles";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { href: "/", label: "Inicio", icon: House },
  { href: "/guest", label: "Portal Publico", icon: Wifi },
  { href: "/doctor", label: "Portal Medico", icon: Stethoscope },
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/issue", label: "Emitir Credencial", icon: Ticket },
  { href: "/admin/list", label: "Listado Usuarios", icon: ClipboardList },
  { href: "/user/own", label: "Mi Credencial", icon: Activity }
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getBreadcrumb(pathname: string) {
  if (pathname === "/") return "Inicio";
  return pathname
    .split("/")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" / ");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideShell = pathname === "/" || pathname === "/guest" || pathname.startsWith("/guest/");

  if (hideShell) {
    return <div className="min-h-screen px-4 py-6">{children}</div>;
  }

  return (
    <div className="flex min-h-screen text-neutral-900">
      <aside className="glass-panel m-3 flex w-[240px] flex-col rounded-2xl bg-neutral-900/85 px-4 py-4">
        <div className="mb-5 flex h-16 items-center rounded-xl bg-white/10 px-3">
          <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-400/95 text-white">
            <Wifi className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Portal IEQ</p>
            <p className="text-xs text-neutral-300">Conectividad Clinica</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150",
                  active
                    ? "bg-primary-400 font-medium text-white"
                    : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-xl border border-white/15 bg-white/10 px-3 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-400 text-white">
              <UserCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm text-white">Operador IEQ</p>
              <p className="text-xs text-neutral-300">Admision</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col p-3 pl-0">
        <header className="glass-panel sticky top-3 z-20 flex h-16 items-center justify-between rounded-2xl px-6">
          <p className="text-sm text-neutral-500">{getBreadcrumb(pathname)}</p>
          <div className="flex items-center gap-3">
            <button className="glass-soft rounded-lg px-4 py-2 text-sm text-neutral-700 transition-colors duration-150 hover:bg-white/70">
              Soporte
            </button>
            <button className="rounded-lg bg-primary-400 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-primary-500">
              Nueva credencial
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
