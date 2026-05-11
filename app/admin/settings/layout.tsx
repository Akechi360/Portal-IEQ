"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { name: "General", href: "/admin/settings" },
    { name: "Red WiFi", href: "/admin/settings/wifi" },
    { name: "Autenticación", href: "/admin/settings/auth" },
    { name: "Notificaciones", href: "/admin/settings/notifications" },
    { name: "Administradores", href: "/admin/settings/admins" },
    { name: "Base de datos", href: "/admin/settings/database" },
    { name: "Apariencia", href: "/admin/settings/appearance" },
  ];

  return (
    <div className="flex flex-col space-y-6">
      {/* Top action row */}
      <div className="flex items-center justify-end gap-3">
        <button className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50">
          Restaurar
        </button>
        <button className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-600">
          Guardar cambios
        </button>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Left Sidebar (Sub-navigation) */}
        <div className="w-full shrink-0 md:w-56">
          <nav className="flex flex-col gap-1">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-sky-50 text-sky-600"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
                  }`}
                >
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Content Area */}
        <div className="flex flex-1 flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
