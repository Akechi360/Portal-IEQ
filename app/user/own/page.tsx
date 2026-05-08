"use client";

import { useState } from "react";
import { DEVICES_MOCK } from "@/lib/mock-data";

export default function UserOwnPage() {
  const [sessionStatus, setSessionStatus] = useState("Activa");

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Mi credencial de WiFi</h1>

        <section className="rounded-lg bg-white px-4 py-4 shadow-sm">
          <div className="grid gap-2 text-sm md:grid-cols-2">
            <p>
              <span className="font-semibold">Rol:</span> Medico
            </p>
            <p>
              <span className="font-semibold">Nombre:</span> Dr. Jaime Ramirez
            </p>
            <p>
              <span className="font-semibold">Usuario:</span> dr.jramirez
            </p>
            <p>
              <span className="font-semibold">Estado de la sesion:</span> {sessionStatus}
            </p>
          </div>

          <div className="mt-3 rounded-md border border-blue-100 bg-blue-50 px-3 py-3">
            <p className="text-sm text-blue-800">Tiempo restante:</p>
            <p className="text-sm font-bold text-blue-800">Quedan 2 horas 15 min</p>
          </div>
        </section>

        <section className="rounded-lg bg-white p-4 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Dispositivos autorizados</h2>
          <div className="mt-3 overflow-x-auto rounded-md border border-gray-200">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600">
                  <th className="px-3 py-2">MAC</th>
                  <th className="px-3 py-2">Primer visto</th>
                  <th className="px-3 py-2">Ultimo visto</th>
                  <th className="px-3 py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {DEVICES_MOCK.map((device) => (
                  <tr key={device.mac} className="border-t border-gray-100">
                    <td className="px-3 py-2 text-sm text-gray-700">{device.mac}</td>
                    <td className="px-3 py-2 text-sm text-gray-700">{device.primerVisto}</td>
                    <td className="px-3 py-2 text-sm text-gray-700">{device.ultimoVisto}</td>
                    <td className="px-3 py-2 text-sm text-gray-700">{device.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div>
          <button
            type="button"
            onClick={() => setSessionStatus("Inactiva")}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Cerrar sesion
          </button>
        </div>
      </div>
    </main>
  );
}
