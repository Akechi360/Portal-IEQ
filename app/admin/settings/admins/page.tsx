import { InputField, ToggleRow } from "../components";

export default function AdminsSettingsPage() {
  const admins = [
    { id: 1, name: "Admin IEQ", email: "admin@ieq.com", role: "Superadmin", lastAccess: "Hace 5 min", status: "Activo" },
    { id: 2, name: "Carlos Sistemas", email: "csistemas@ieq.com", role: "Admin", lastAccess: "Hace 2 horas", status: "Activo" },
    { id: 3, name: "Recepción Central", email: "recepcion@ieq.com", role: "Operador", lastAccess: "Ayer", status: "Inactivo" },
    { id: 4, name: "Gerencia Médica", email: "gerencia@ieq.com", role: "Solo lectura", lastAccess: "Nunca", status: "Invitación pendiente" }
  ];

  function getStatusBadge(status: string) {
    switch (status) {
      case "Activo":
        return <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600 border border-emerald-100">Activo</span>;
      case "Inactivo":
        return <span className="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500 border border-neutral-200">Inactivo</span>;
      case "Invitación pendiente":
        return <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600 border border-amber-100">Pendiente</span>;
      default:
        return null;
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Lista de administradores */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <div>
            <h3 className="text-sm font-semibold text-neutral-800">Lista de administradores</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Controla quién puede acceder al panel</p>
          </div>
          <button className="rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-600 transition-colors hover:bg-sky-100">
            Invitar administrador
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-600">
            <thead className="bg-neutral-50/50 text-xs text-neutral-400">
              <tr>
                <th className="px-6 py-3 font-medium">Nombre</th>
                <th className="px-6 py-3 font-medium">Rol</th>
                <th className="px-6 py-3 font-medium">Último acceso</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-3">
                    <p className="font-medium text-neutral-800">{admin.name}</p>
                    <p className="text-[11px] text-neutral-400">{admin.email}</p>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-xs font-medium bg-neutral-100 px-2 py-0.5 rounded-md text-neutral-600">{admin.role}</span>
                  </td>
                  <td className="px-6 py-3 text-xs">{admin.lastAccess}</td>
                  <td className="px-6 py-3">{getStatusBadge(admin.status)}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="text-neutral-400 hover:text-sky-600 transition-colors">Editar</button>
                      <button className="text-neutral-400 hover:text-red-500 transition-colors ml-2">Desactivar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seguridad de acceso */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-5 text-sm font-semibold text-neutral-800">Seguridad de acceso</h3>
        <div className="flex flex-col gap-4 mb-6">
          <ToggleRow label="Requerir 2FA para acceso al panel" defaultEnabled={false} />
          <div className="h-px w-full bg-neutral-100" />
          <ToggleRow label="Bloquear acceso desde IPs fuera de la red de la clínica" defaultEnabled={true} />
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <InputField label="Rango de IP permitido" defaultValue="192.168.1.0/24" />
          <InputField label="Tiempo de expiración de sesión de admin (min)" defaultValue="60" />
        </div>
      </div>
    </div>
  );
}
