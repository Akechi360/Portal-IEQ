"use client";

import { useState } from "react";
import { DEVICES_MOCK } from "@/lib/mock-data";

export default function UserOwnPage() {
  const [sessionStatus, setSessionStatus] = useState("Activa");

  return (
    <main>
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-xl font-bold text-neutral-900">Mi credencial de WiFi</h1>

        <section className="glass-panel rounded-xl border border-white/60 px-4 py-4">
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

          <div className="mt-3 rounded-lg border border-primary-100 bg-primary-50 px-3 py-3">
            <p className="text-sm text-primary-700">Tiempo restante:</p>
            <p className="text-sm font-bold text-primary-800">Quedan 2 horas 15 min</p>
          </div>
        </section>

        <section className="glass-panel rounded-xl border border-white/60 p-4">
          <h2 className="text-lg font-bold text-neutral-900">Dispositivos autorizados</h2>
          <div className="glass-soft mt-3 overflow-x-auto rounded-xl border border-white/60">
            <table className="min-w-full">
              <thead>
                <tr className="bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                  <th className="px-3 py-2">MAC</th>
                  <th className="px-3 py-2">Primer visto</th>
                  <th className="px-3 py-2">Ultimo visto</th>
                  <th className="px-3 py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {DEVICES_MOCK.map((device) => (
                  <tr key={device.mac} className="border-b border-neutral-100 transition-colors duration-150 hover:bg-neutral-50">
                    <td className="px-3 py-2 text-sm text-neutral-700">{device.mac}</td>
                    <td className="px-3 py-2 text-sm text-neutral-700">{device.primerVisto}</td>
                    <td className="px-3 py-2 text-sm text-neutral-700">{device.ultimoVisto}</td>
                    <td className="px-3 py-2 text-sm text-neutral-700">{device.estado}</td>
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
            className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-red-600"
          >
            Cerrar sesion
          </button>
        </div>
      </div>
    </main>
  );
}
