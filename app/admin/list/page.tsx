"use client";

import { useMemo, useState } from "react";
import { DEVICES_MOCK, USERS_MOCK } from "@/lib/mock-data";
import { UserSessionItem, UserStatus } from "@/types";

const statusClass: Record<UserStatus, string> = {
  Activo: "bg-accent-light text-accent-dark",
  Expirado: "bg-neutral-100 text-neutral-600",
  Bloqueado: "bg-red-100 text-red-600"
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
    <main>
      <div className="glass-panel mx-auto max-w-6xl rounded-xl border border-white/60 p-6">
        <header className="mb-4">
          <h1 className="text-xl font-bold text-neutral-900">Listado de usuarios</h1>
          <p className="text-sm text-neutral-500">Visualice acceso, tipo, caducidad y estado de cada usuario.</p>
        </header>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="glass-input h-10 rounded-lg border border-white/60 px-3 text-sm text-neutral-700 transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
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
            className="glass-input h-10 rounded-lg border border-white/60 px-3 text-sm text-neutral-700 transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
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
            className="glass-input h-10 min-w-[220px] flex-1 rounded-lg border border-white/60 px-3 text-sm text-neutral-700 transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
            placeholder="Buscar por usuario o nombre"
          />
        </div>

        <div className="glass-soft overflow-x-auto rounded-xl border border-white/60">
          <table className="min-w-full">
            <thead>
              <tr className="bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
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
                <tr key={user.id} className="border-b border-neutral-100 transition-colors duration-150 hover:bg-neutral-50">
                  <td className="px-3 py-2 text-sm font-bold text-neutral-900">{user.usuario}</td>
                  <td className="px-3 py-2 text-sm text-neutral-700">{user.nombre}</td>
                  <td className="px-3 py-2 text-sm capitalize text-neutral-700">{user.rol}</td>
                  <td className="px-3 py-2 text-sm text-neutral-700">{user.habitacion}</td>
                  <td className="px-3 py-2 text-sm text-neutral-700">{user.tiempoValidez}</td>
                  <td className="px-3 py-2 text-sm text-neutral-700">{user.dispositivos}</td>
                  <td className="px-3 py-2 text-sm font-bold">
                    <span className={`rounded-full px-2 py-1 text-xs ${statusClass[user.estado]}`}>{user.estado}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleStatus(user)}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                          user.estado === "Bloqueado"
                            ? "glass-soft border border-white/60 bg-white/40 text-neutral-700"
                            : "bg-danger text-white"
                        }`}
                      >
                        {user.estado === "Bloqueado" ? "Desbloquear" : "Bloquear"}
                      </button>
                      <button
                        onClick={() => setOpenModal(true)}
                        className="rounded-lg bg-primary-400 px-3 py-1.5 text-xs font-medium text-white transition-colors duration-150 hover:bg-primary-500"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/30 px-4">
          <div className="glass-panel w-full max-w-3xl rounded-xl border border-white/60 p-4">
            <h2 className="text-lg font-bold text-neutral-900">Dispositivos asociados</h2>
            <div className="glass-soft mt-3 overflow-x-auto rounded-xl border border-white/60">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                    <th className="px-3 py-2">Dispositivo</th>
                    <th className="px-3 py-2">MAC</th>
                    <th className="px-3 py-2">Primer visto</th>
                    <th className="px-3 py-2">Ultimo visto</th>
                    <th className="px-3 py-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {DEVICES_MOCK.map((device) => (
                    <tr key={device.mac} className="border-b border-neutral-100 transition-colors duration-150 hover:bg-neutral-50">
                      <td className="px-3 py-2 text-sm text-neutral-700">{device.etiqueta ?? "Sin etiqueta"}</td>
                      <td className="px-3 py-2 text-sm text-neutral-700">{device.mac}</td>
                      <td className="px-3 py-2 text-sm text-neutral-700">{device.primerVisto}</td>
                      <td className="px-3 py-2 text-sm text-neutral-700">{device.ultimoVisto}</td>
                      <td className="px-3 py-2 text-sm text-neutral-700">{device.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setOpenModal(false)}
                className="glass-soft rounded-lg border border-white/60 px-4 py-2 text-sm text-neutral-700 transition-colors duration-150 hover:bg-white/75"
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
