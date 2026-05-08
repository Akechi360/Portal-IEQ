"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/app/lib/styles";

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/issue", label: "Emitir Acceso" },
  { href: "/admin/list", label: "Listado de Usuarios" },
  { href: "/user/own", label: "Mi Credencial" },
  { href: "/doctor", label: "Medico" }
];

export function SiteHeader() {
  const pathname = usePathname();
  const isAdminArea = pathname.startsWith("/admin") || pathname.startsWith("/user") || pathname.startsWith("/doctor");
  const isGuest = pathname.startsWith("/guest");

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700">C</div>
          <div>
            <p className="font-semibold text-slate-800">Clinica IEQ</p>
            <p className="text-xs text-slate-500">
              {isGuest ? "WiFi Clinica - Acceso a Invitados" : "Portal interno de conectividad"}
            </p>
          </div>
        </div>
        {isAdminArea ? (
          <nav className="flex flex-wrap gap-2">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm text-slate-600 transition hover:bg-brand-50 hover:text-brand-700",
                  pathname.startsWith(link.href) && "bg-brand-100 text-brand-800"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
