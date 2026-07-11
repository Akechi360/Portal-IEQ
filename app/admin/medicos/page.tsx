"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  UserPlus,
  AlertCircle,
  Search,
  Check,
  X,
  EyeOff,
  Eye,
  Clock,
  Loader2,
} from "lucide-react";

type StatusMedico = "activo" | "pendiente" | "inactivo";

interface Medico {
  id: string;
  nombre: string;
  especialidad: string | null;
  email: string;
  telefono: string | null;
  voucherCode: string | null;
  status: "ACTIVE" | "PENDING" | "INACTIVE";
  createdAt: string;
}

const mapStatus = (status: string): StatusMedico => {
  if (status === "ACTIVE") return "activo";
  if (status === "PENDING") return "pendiente";
  return "inactivo";
};

export default function MedicosPage() {
  const [filtro, setFiltro] = useState<"todos" | "activo" | "pendiente" | "inactivo">("todos");
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Estado del formulario modal
  const [modalMedico, setModalMedico] = useState({
    nombre: "",
    especialidad: "",
    email: "",
    telefono: "",
  });

  const { data, error, isLoading, mutate } = useSWR("/api/admin/doctors", (url) =>
    fetch(url).then((res) => res.json())
  );

  const medicos: Medico[] = data?.data || [];
  const pendientesCount = medicos.filter((m) => m.status === "PENDING").length;

  const medicosFiltrados = medicos.filter((m) => {
    const statusMapeado = mapStatus(m.status);
    const matchesSearch =
      m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (m.especialidad && m.especialidad.toLowerCase().includes(busqueda.toLowerCase())) ||
      m.email.toLowerCase().includes(busqueda.toLowerCase());
    const matchesFiltro = filtro === "todos" || statusMapeado === filtro;
    return matchesSearch && matchesFiltro;
  });

  const handleToggleStatus = async (id: string, nuevoStatus: "ACTIVE" | "INACTIVE" | "PENDING") => {
    setLoadingId(id);
    try {
      const res = await fetch("/api/admin/doctors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nuevoStatus }),
      });
      if (res.ok) {
        mutate(); // trigger SWR revalidation
      } else {
        const err = await res.json();
        alert(err.message || "Error al actualizar estado.");
      }
    } catch (e) {
      console.error(e);
      alert("Error de red al actualizar estado.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleRegistrar = async () => {
    if (!modalMedico.nombre || !modalMedico.email) return;

    try {
      const res = await fetch("/api/admin/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: modalMedico.nombre,
          especialidad: modalMedico.especialidad || undefined,
          email: modalMedico.email,
          telefono: modalMedico.telefono || undefined,
        }),
      });

      if (res.ok) {
        mutate(); // trigger SWR revalidation
        setModalAbierto(false);
        setModalMedico({ nombre: "", especialidad: "", email: "", telefono: "" });
      } else {
        const err = await res.json();
        alert(err.message || "Error al registrar médico.");
      }
    } catch (e) {
      console.error(e);
      alert("Error de red al registrar médico.");
    }
  };

  return (
    <div>
      {/* HEADER DE MÓDULO */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Médicos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestión de acceso médico permanente</p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="bg-primary-500 hover:bg-primary-600 transition-colors text-white rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2"
        >
          <UserPlus className="w-[18px] h-[18px]" />
          Registrar médico
        </button>
      </div>

      {/* BADGE DE ALERTA */}
      {pendientesCount > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="text-amber-500 w-[18px] h-[18px] shrink-0" />
          <p className="text-sm text-amber-800">
            Hay {pendientesCount} solicitud(es) de acceso pendiente(s) de aprobación.{" "}
            <span className="font-medium">Revísalas a continuación.</span>
          </p>
        </div>
      )}

      {/* FILTROS Y BÚSQUEDA */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, especialidad o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-72 pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          {(["todos", "activo", "pendiente", "inactivo"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors border capitalize ${
                filtro === f
                  ? f === "pendiente"
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-primary-500 text-white border-primary-500"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f === "todos" ? "Todos" : f === "activo" ? "Activos" : f === "pendiente" ? "Pendientes" : "Inactivos"}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA DE MÉDICOS */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Médico</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Especialidad</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Correo</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Voucher</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha Registro</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                      Cargando listado de médicos...
                    </div>
                  </td>
                </tr>
              ) : medicosFiltrados.map((m) => {
                const statusMapeado = mapStatus(m.status);
                const iniciales = m.nombre
                  .replace("Dr. ", "")
                  .replace("Dra. ", "")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase();

                return (
                  <tr key={m.id} className="hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors">
                    
                    {/* COLUMNA "Médico" */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-100 rounded-full w-9 h-9 shrink-0 flex items-center justify-center">
                          <span className="text-primary-700 text-xs font-bold">{iniciales}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 leading-tight">{m.nombre}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{m.telefono || "—"}</p>
                        </div>
                      </div>
                    </td>

                    {/* COLUMNA "Especialidad" */}
                    <td className="px-4 py-3.5">
                      <span className="bg-gray-100 text-gray-600 rounded-full px-2.5 py-1 text-xs font-medium">
                        {m.especialidad || "—"}
                      </span>
                    </td>

                    {/* COLUMNA "Correo" */}
                    <td className="px-4 py-3.5 text-gray-600 font-mono text-xs">
                      {m.email}
                    </td>

                    {/* COLUMNA "Voucher" */}
                    <td className="px-4 py-3.5">
                      {m.voucherCode ? (
                        <span className="font-mono text-xs text-gray-500 bg-gray-50 rounded px-2 py-0.5 border border-gray-200">
                          {m.voucherCode}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300 italic">Sin asignar</span>
                      )}
                    </td>

                    {/* COLUMNA "Fecha Registro" */}
                    <td className="px-4 py-3.5 text-sm text-gray-500">
                      {new Date(m.createdAt).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>

                    {/* COLUMNA "Estado" */}
                    <td className="px-4 py-3.5">
                      {statusMapeado === "activo" && (
                        <span className="bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5 text-xs inline-flex items-center gap-1">
                          Activo
                        </span>
                      )}
                      {statusMapeado === "pendiente" && (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 text-xs inline-flex items-center gap-1">
                          <Clock className="w-[10px] h-[10px]" />
                          Pendiente
                        </span>
                      )}
                      {statusMapeado === "inactivo" && (
                        <span className="bg-gray-50 text-gray-400 border border-gray-200 rounded-full px-2 py-0.5 text-xs inline-flex items-center gap-1">
                          Inactivo
                        </span>
                      )}
                    </td>

                    {/* COLUMNA "Acciones" */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {statusMapeado === "pendiente" && (
                          <>
                            <button
                              onClick={() => handleToggleStatus(m.id, "ACTIVE")}
                              disabled={loadingId === m.id}
                              className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-70"
                            >
                              {loadingId === m.id ? (
                                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleToggleStatus(m.id, "INACTIVE")}
                              className="bg-white border border-red-200 text-red-500 hover:bg-red-50 rounded-lg px-3 py-1.5 text-xs transition-colors flex items-center gap-1.5 font-medium"
                            >
                              <X className="w-3 h-3" />
                              Rechazar
                            </button>
                          </>
                        )}
                        {statusMapeado === "activo" && (
                          <button
                            title="Desactivar"
                            onClick={() => handleToggleStatus(m.id, "INACTIVE")}
                            disabled={loadingId === m.id}
                            className="bg-gray-100 hover:bg-gray-200 rounded-lg p-1.5 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                          >
                            <EyeOff className="w-[14px] h-[14px]" />
                          </button>
                        )}
                        {statusMapeado === "inactivo" && (
                          <button
                            title="Reactivar"
                            onClick={() => handleToggleStatus(m.id, "ACTIVE")}
                            disabled={loadingId === m.id}
                            className="bg-gray-100 hover:bg-green-100 rounded-lg p-1.5 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                          >
                            <Eye className="w-[14px] h-[14px]" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {!isLoading && medicosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <p className="text-sm text-gray-400">No se encontraron médicos</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE REGISTRO */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Registrar médico</h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                <input
                  type="text"
                  value={modalMedico.nombre}
                  onChange={(e) => setModalMedico({ ...modalMedico, nombre: e.target.value })}
                  placeholder="Dr. Juan García"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
                <input
                  type="text"
                  value={modalMedico.especialidad}
                  onChange={(e) => setModalMedico({ ...modalMedico, especialidad: e.target.value })}
                  placeholder="Cardiología"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo institucional</label>
                <input
                  type="email"
                  value={modalMedico.email}
                  onChange={(e) => setModalMedico({ ...modalMedico, email: e.target.value })}
                  placeholder="dr.garcia@ieq.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  value={modalMedico.telefono}
                  onChange={(e) => setModalMedico({ ...modalMedico, telefono: e.target.value })}
                  placeholder="+58 412 000 0000"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalAbierto(false)}
                className="bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors rounded-xl px-4 py-2.5 text-sm flex-1 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleRegistrar}
                disabled={!modalMedico.nombre || !modalMedico.email}
                className="bg-primary-500 hover:bg-primary-600 text-white transition-colors rounded-xl px-4 py-2.5 text-sm font-medium flex-1 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Registrar y activar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
