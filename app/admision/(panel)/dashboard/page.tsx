import Link from "next/link";
import { PlusCircle, ArrowRight, ClipboardList, List } from "lucide-react";

export default function AdmisionDashboardPage() {
  // Calcular saludo
  const hour = new Date().getHours();
  let greeting = "Buenas tardes";
  if (hour < 12) greeting = "Buenos días";
  else if (hour > 19) greeting = "Buenas noches";

  // Formatear fecha
  const formatter = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dateStr = formatter.format(new Date());
  const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  return (
    <div className="max-w-2xl mx-auto">
      
      {/* SALUDO SUPERIOR */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{greeting}, Operador</h1>
        <p className="text-sm text-gray-500 mt-1">{formattedDate}</p>
      </div>

      {/* KPI STRIP */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-sky-600">12</p>
          <p className="text-xs text-gray-500 mt-1">Credenciales hoy</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-green-600">9</p>
          <p className="text-xs text-gray-500 mt-1">Pacientes activos</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-amber-500">3</p>
          <p className="text-xs text-gray-500 mt-1">Tránsito activos</p>
        </div>
      </div>

      {/* ACCIONES PRINCIPALES */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Acciones rápidas
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* CARD ACCIÓN 1 */}
          <Link href="/admision/emitir" className="group block h-full">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-sky-200 transition-all cursor-pointer h-full flex flex-col">
              <div className="bg-sky-50 rounded-xl p-3 w-fit mb-4 group-hover:bg-sky-100 transition-colors">
                <PlusCircle className="text-sky-600 w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                Emitir credencial nueva
              </h3>
              <p className="text-sm text-gray-500 mt-1 mb-4 flex-1">
                Genera acceso WiFi para un Paciente o persona en Tránsito
              </p>
              <div className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2 w-fit transition-colors">
                <ArrowRight className="w-[14px] h-[14px]" />
                Emitir ahora
              </div>
            </div>
          </Link>

          {/* CARD ACCIÓN 2 */}
          <Link href="/admision/credenciales" className="group block h-full">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer h-full flex flex-col">
              <div className="bg-gray-50 rounded-xl p-3 w-fit mb-4 group-hover:bg-gray-100 transition-colors">
                <ClipboardList className="text-gray-600 w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                Credenciales de hoy
              </h3>
              <p className="text-sm text-gray-500 mt-1 mb-4 flex-1">
                Consulta todos los accesos generados durante el turno actual
              </p>
              <div className="bg-gray-900 hover:bg-gray-700 text-white rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2 w-fit transition-colors">
                <List className="w-[14px] h-[14px]" />
                Ver listado
              </div>
            </div>
          </Link>

        </div>
      </div>

    </div>
  );
}
