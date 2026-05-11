"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, PlusCircle, Search, ClipboardList } from "lucide-react";

type TipoAcceso = "Todos" | "Paciente" | "Transito";
type EstadoCredencial = "Activo" | "Expirado" | "Bloqueado" | "En uso";

interface CredencialMock {
  id: string;
  codigo: string;
  tipo: "Paciente" | "Transito";
  nombre: string;
  habitacion?: string;
  creadaA: string;
  expira: string;
  dispositivos: string;
  estado: EstadoCredencial;
}

const mockCredenciales: CredencialMock[] = [
  { id: "1", codigo: "A3F9-2K7X", tipo: "Paciente", nombre: "Juan Pérez", habitacion: "302-A", creadaA: "08:15 AM", expira: "74h", dispositivos: "0/4", estado: "Activo" },
  { id: "2", codigo: "M9L2-P4QC", tipo: "Paciente", nombre: "María Gómez", habitacion: "105-B", creadaA: "09:30 AM", expira: "26h", dispositivos: "2/4", estado: "En uso" },
  { id: "3", codigo: "R7T1-V8WN", tipo: "Transito", nombre: "Carlos Mendoza", creadaA: "10:05 AM", expira: "30 min", dispositivos: "0/1", estado: "Activo" },
  { id: "4", codigo: "K5B4-H9FD", tipo: "Paciente", nombre: "Ana Torres", habitacion: "410-C", creadaA: "10:45 AM", expira: "50h", dispositivos: "0/3", estado: "Activo" },
  { id: "5", codigo: "Z2X8-C1MV", tipo: "Transito", nombre: "Luis Sánchez", creadaA: "11:20 AM", expira: "Expiró hace 2h", dispositivos: "1/1", estado: "Expirado" },
  { id: "6", codigo: "Q6W3-E7RT", tipo: "Transito", nombre: "Elena Ruiz", creadaA: "11:55 AM", expira: "30 min", dispositivos: "0/1", estado: "Activo" },
  { id: "7", codigo: "Y4U9-I2OP", tipo: "Paciente", nombre: "Pedro Vargas", habitacion: "208-A", creadaA: "Ayer", expira: "Expiró ayer", dispositivos: "4/4", estado: "Expirado" },
  { id: "8", codigo: "L1K5-J8HG", tipo: "Transito", nombre: "Usuario bloqueado", creadaA: "12:10 PM", expira: "—", dispositivos: "0/1", estado: "Bloqueado" },
];

export default function CredencialesPage() {
  const router = useRouter();
  
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<TipoAcceso>("Todos");

  // Filtrado
  const filtradas = mockCredenciales.filter((cred) => {
    const matchesSearch =
      cred.nombre.toLowerCase().includes(search.toLowerCase()) ||
      cred.codigo.toLowerCase().includes(search.toLowerCase());
    
    const matchesTipo = filtroTipo === "Todos" || cred.tipo === filtroTipo;

    return matchesSearch && matchesTipo;
  });

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* HEADER DE PÁGINA */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admision/dashboard")}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Credenciales de hoy</h1>
          <span className="bg-sky-50 text-sky-700 border border-sky-200 rounded-full px-2.5 py-0.5 text-xs font-semibold">
            {mockCredenciales.length} total
          </span>
        </div>
        <button
          onClick={() => router.push("/admision/emitir")}
          className="bg-sky-500 hover:bg-sky-600 transition-colors text-white rounded-xl px-4 py-2 text-sm flex items-center gap-2"
        >
          <PlusCircle className="w-[18px] h-[18px]" />
          Nueva credencial
        </button>
      </div>

      {/* FILTROS */}
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center gap-2">
          {(["Todos", "Paciente", "Transito"] as TipoAcceso[]).map((t) => (
            <button
              key={t}
              onClick={() => setFiltroTipo(t)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors border ${
                filtroTipo === t
                  ? "bg-sky-500 text-white border-sky-500"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Código</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Habitación</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Creada</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Expira</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Disp.</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length > 0 ? (
                filtradas.map((cred) => (
                  <tr key={cred.id} className="hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors">
                    <td className="px-4 py-3.5 text-sm">
                      <span className="font-mono font-semibold text-gray-900 tracking-wider">
                        {cred.codigo}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm">
                      {cred.tipo === "Paciente" ? (
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 text-xs">
                          Paciente
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 text-xs">
                          Tránsito
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">
                      {cred.nombre}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">
                      {cred.habitacion || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">
                      {cred.creadaA}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">
                      {cred.expira}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-center text-gray-600">
                      {cred.dispositivos}
                    </td>
                    <td className="px-4 py-3.5 text-sm">
                      {cred.estado === "Activo" && (
                        <span className="bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5 text-xs">
                          Activo
                        </span>
                      )}
                      {cred.estado === "En uso" && (
                        <span className="bg-sky-50 text-sky-700 border border-sky-200 rounded-full px-2 py-0.5 text-xs">
                          En uso
                        </span>
                      )}
                      {cred.estado === "Expirado" && (
                        <span className="bg-gray-50 text-gray-500 border border-gray-200 rounded-full px-2 py-0.5 text-xs">
                          Expirado
                        </span>
                      )}
                      {cred.estado === "Bloqueado" && (
                        <span className="bg-red-50 text-red-700 border border-red-200 rounded-full px-2 py-0.5 text-xs">
                          Bloqueado
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <ClipboardList className="text-gray-300 w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No se encontraron credenciales</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* FOOTER DE TABLA */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
          Mostrando {filtradas.length} credencial(es) del turno actual
        </div>
      </div>

    </div>
  );
}
