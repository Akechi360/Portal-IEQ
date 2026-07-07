"use client";

import useSWR from "swr";
import { InputField, ToggleRow } from "../components";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const roleLabels: Record<string, string> = {
  SUPERADMIN: "Superadmin",
  ADMIN: "Admin",
  OPERADOR: "Operador",
};

function StatusBadge({ role }: { role: string }) {
  if (role === "SUPERADMIN") {
    return <span className="inline-flex rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-600 border border-sky-100">Superadmin</span>;
  }
  if (role === "OPERADOR") {
    return <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600 border border-amber-100">Operador</span>;
  }
  return <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600 border border-emerald-100">Admin</span>;
}

export default function AdminsSettingsPage() {
  const { data, isLoading } = useSWR("/api/admin/admins", fetcher);
  const admins: any[] = data?.admins || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <div>
            <h3 className="text-sm font-semibold text-neutral-800">Lista de administradores</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Controla quién puede acceder al panel</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-600">
            <thead className="bg-neutral-50/50 text-xs text-neutral-400">
              <tr>
                <th className="px-6 py-3 font-medium">Nombre</th>
                <th className="px-6 py-3 font-medium">Rol</th>
                <th className="px-6 py-3 font-medium">Último acceso</th>
                <th className="px-6 py-3 font-medium">Creado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-neutral-400">Cargando…</td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-neutral-400">No hay administradores registrados.</td>
                </tr>
              ) : admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-3">
                    <p className="font-medium text-neutral-800">{admin.nombre}</p>
                    <p className="text-[11px] text-neutral-400">{admin.email}</p>
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge role={admin.role} />
                  </td>
                  <td className="px-6 py-3 text-xs">{admin.lastAccess}</td>
                  <td className="px-6 py-3 text-xs text-neutral-400">
                    {new Date(admin.createdAt).toLocaleDateString("es-ES")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-5 text-sm font-semibold text-neutral-800">Seguridad de acceso</h3>
        <div className="flex flex-col gap-4 mb-6">
          <ToggleRow label="Requerir 2FA para acceso al panel" defaultEnabled={false} />
          <div className="h-px w-full bg-neutral-100" />
          <ToggleRow label="Bloquear acceso desde IPs fuera de la red de la clínica" defaultEnabled={true} />
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <InputField label="Rango de IP permitido" defaultValue="192.168.110.0/24" />
          <InputField label="Tiempo de expiración de sesión de admin (min)" defaultValue="60" />
        </div>
      </div>
    </div>
  );
}
