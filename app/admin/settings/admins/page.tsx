"use client";

import { useState } from "react";
import useSWR from "swr";
import { KeyRound, Loader2, X } from "lucide-react";
import { InputField, ToggleRow, MockNotice } from "../components";
import { toastSuccess } from "@/lib/alerts";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function StatusBadge({ role }: { role: string }) {
  if (role === "SUPERADMIN") {
    return <span className="inline-flex rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-600 border border-primary-100">Superadmin</span>;
  }
  if (role === "OPERADOR") {
    return <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600 border border-amber-100">Operador</span>;
  }
  return <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600 border border-emerald-100">Admin</span>;
}

export default function AdminsSettingsPage() {
  const { data, isLoading } = useSWR("/api/admin/admins", fetcher);
  const admins: any[] = data?.admins || [];

  // Cambio de contraseña
  const [target, setTarget] = useState<{ id: string; nombre: string; role: string } | null>(null);
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function openModal(admin: any) {
    setTarget({ id: admin.id, nombre: admin.nombre, role: admin.role });
    setPwd("");
    setPwd2("");
    setError("");
    setShowPwd(false);
  }

  async function handleSave() {
    if (!target) return;
    setError("");
    if (pwd.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (pwd !== pwd2) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/admins/${target.id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setTarget(null);
        toastSuccess("Contraseña actualizada");
      } else {
        setError(json.message || "No se pudo actualizar la contraseña.");
      }
    } catch (e) {
      console.error(e);
      setError("Error de red al actualizar la contraseña.");
    } finally {
      setSaving(false);
    }
  }

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
                <th className="px-6 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-400">Cargando…</td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-400">No hay administradores registrados.</td>
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
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => openModal(admin)}
                      title="Cambiar la contraseña de este administrador"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                      Cambiar contraseña
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-6 py-3 text-[11px] text-neutral-400 border-t border-neutral-100">
          Solo un Superadmin puede cambiar contraseñas. El cambio es inmediato y cierra las sesiones activas de esa cuenta.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-3 text-sm font-semibold text-neutral-800">Seguridad de acceso</h3>
        <div className="mb-5">
          <MockNotice>Estos controles son una maqueta — todavía no aplican de verdad.</MockNotice>
        </div>
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

      {/* MODAL: Cambiar contraseña */}
      {target && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">Cambiar contraseña</h2>
              <button onClick={() => setTarget(null)} className="text-neutral-400 transition-colors hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-5 text-sm text-neutral-500">
              Para <span className="font-semibold text-neutral-700">{target.nombre}</span> ({target.role})
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Nueva contraseña</label>
                <input
                  type={showPwd ? "text" : "password"}
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Confirmar contraseña</label>
                <input
                  type={showPwd ? "text" : "password"}
                  value={pwd2}
                  onChange={(e) => setPwd2(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-neutral-500">
                <input type="checkbox" checked={showPwd} onChange={(e) => setShowPwd(e.target.checked)} className="accent-primary-600" />
                Mostrar contraseña
              </label>
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setTarget(null)}
                className="flex-1 rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !pwd || !pwd2}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar contraseña
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
