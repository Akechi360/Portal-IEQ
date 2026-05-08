"use client";

import { useMemo, useState } from "react";
import { DEVICES_MOCK, USERS_MOCK } from "@/lib/mock-data";
import { UserSessionItem, UserStatus } from "@/types";

const statusClass: Record<UserStatus, string> = {
  Activo: "bg-green-100 text-green-800",
  Expirado: "bg-gray-100 text-gray-800",
  Bloqueado: "bg-red-100 text-red-800"
};

export default function AdminListPage() {
  const [items, setItems] = useState<UserSessionItem[]>(USERS_MOCK);
  const [roleFilter, setRoleFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [query, setQuery] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const filteredUsers = useMemo(() => {
    return items.filter((item) => {
      const roleOk = roleFilter === "todos" || item.rol === roleFilter;
      const statusOk = statusFilter === "todos" || item.estado === statusFilter;
      const queryOk =
        query.trim().length === 0 ||
        item.usuario.toLowerCase().includes(query.toLowerCase()) ||
        item.nombre.toLowerCase().includes(query.toLowerCase());
      return roleOk && statusOk && queryOk;
    });
  }, [items, roleFilter, statusFilter, query]);

  const toggleStatus = (user: UserSessionItem) => {
    setItems((prev) =>
      prev.map((row) =>
        row.id === user.id ? { ...row, estado: row.estado === "Bloqueado" ? "Activo" : "Bloqueado" } : row
      )
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-6xl rounded-lg bg-white p-4 shadow-sm">
        <header className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">Listado de usuarios</h1>
          <p className="text-sm text-gray-600">Visualice acceso, tipo, caducidad y estado de cada usuario.</p>
        </header>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filtro por rol"
          >
            <option value="todos">Todos los roles</option>
            <option value="paciente">Paciente</option>
            <option value="transito">Transito</option>
            <option value="medico">Medico</option>
            <option value="gerencia">Gerencia</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filtro por estado"
          >
            <option value="todos">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Expirado">Expirado</option>
            <option value="Bloqueado">Bloqueado</option>
          </select>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 min-w-[220px] flex-1 rounded-md border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Buscar por usuario o nombre"
          />
        </div>

        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600">
                <th className="px-3 py-2">Usuario</th>
                <th className="px-3 py-2">Nombre</th>
                <th className="px-3 py-2">Rol</th>
                <th className="px-3 py-2">Habitacion / area</th>
                <th className="px-3 py-2">Duracion / caducidad</th>
                <th className="px-3 py-2">Dispositivos</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-gray-100">
                  <td className="px-3 py-2 text-sm font-bold text-gray-900">{user.usuario}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{user.nombre}</td>
                  <td className="px-3 py-2 text-sm capitalize text-gray-700">{user.rol}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{user.habitacion}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{user.tiempoValidez}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{user.dispositivos}</td>
                  <td className="px-3 py-2 text-sm font-bold">
                    <span className={`rounded-full px-2 py-1 text-xs ${statusClass[user.estado]}`}>{user.estado}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleStatus(user)}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                          user.estado === "Bloqueado" ? "bg-gray-200 text-gray-800" : "bg-red-600 text-white"
                        }`}
                      >
                        {user.estado === "Bloqueado" ? "Desbloquear" : "Bloquear"}
                      </button>
                      <button
                        onClick={() => setOpenModal(true)}
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        Ver dispositivos
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {openModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-3xl rounded-lg bg-white p-4 shadow-lg">
            <h2 className="text-lg font-bold text-gray-900">Dispositivos asociados</h2>
            <div className="mt-3 overflow-x-auto rounded-md border border-gray-200">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600">
                    <th className="px-3 py-2">Dispositivo</th>
                    <th className="px-3 py-2">MAC</th>
                    <th className="px-3 py-2">Primer visto</th>
                    <th className="px-3 py-2">Ultimo visto</th>
                    <th className="px-3 py-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {DEVICES_MOCK.map((device) => (
                    <tr key={device.mac} className="border-t border-gray-100">
                      <td className="px-3 py-2 text-sm text-gray-700">{device.etiqueta ?? "Sin etiqueta"}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">{device.mac}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">{device.primerVisto}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">{device.ultimoVisto}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">{device.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setOpenModal(false)}
                className="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
