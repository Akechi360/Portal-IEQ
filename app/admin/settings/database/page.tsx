import { InputField, SelectField, ToggleRow } from "../components";

export default function DatabaseSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Estado de la conexión */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-800">Estado de la conexión</h3>
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
            Conectada
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <InputField label="Tipo" defaultValue="PostgreSQL" readOnly={true} />
          <InputField label="Host" defaultValue="db.ieq.internal" readOnly={true} />
          <InputField label="Puerto" defaultValue="5432" readOnly={true} />
          <InputField label="Base de datos" defaultValue="portal_ieq" readOnly={true} />
          <InputField label="Usuario DB" defaultValue="portal_user" readOnly={true} />
        </div>
      </div>

      {/* Estadísticas */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-5 text-sm font-semibold text-neutral-800">Estadísticas</h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="flex flex-col gap-1 rounded-lg border border-neutral-50 bg-neutral-50/50 p-4">
            <span className="text-xs font-medium text-neutral-500">Total usuarios</span>
            <span className="text-lg font-bold text-neutral-800">1,452</span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg border border-neutral-50 bg-neutral-50/50 p-4">
            <span className="text-xs font-medium text-neutral-500">Sesiones almacenadas</span>
            <span className="text-lg font-bold text-neutral-800">34,921</span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg border border-neutral-50 bg-neutral-50/50 p-4">
            <span className="text-xs font-medium text-neutral-500">Logs de acceso</span>
            <span className="text-lg font-bold text-neutral-800">128,405</span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg border border-neutral-50 bg-neutral-50/50 p-4">
            <span className="text-xs font-medium text-neutral-500">Tamaño estimado</span>
            <span className="text-lg font-bold text-neutral-800">1.2 GB</span>
          </div>
        </div>
      </div>

      {/* Mantenimiento */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-5 text-sm font-semibold text-neutral-800">Mantenimiento</h3>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <ToggleRow label="Limpieza automática de logs" defaultEnabled={true} />
            </div>
            <div className="w-full md:w-48">
              <SelectField 
                label="Frecuencia" 
                defaultValue="Mensual" 
                options={["Diaria", "Semanal", "Mensual"]}
              />
            </div>
          </div>
          <div className="h-px w-full bg-neutral-100" />
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-800">Limpieza manual de logs</p>
              <p className="mt-1 text-xs text-neutral-400">Elimina logs anteriores a cierta cantidad de días</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24">
                <input
                  type="text"
                  defaultValue="90"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-center text-neutral-800 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
              </div>
              <button className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100">
                Limpiar
              </button>
            </div>
          </div>
          <div className="h-px w-full bg-neutral-100" />
          <div className="flex flex-wrap gap-3 pt-2">
            <button className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50">
              Exportar copia de seguridad
            </button>
            <button className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-100">
              Probar conexión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
