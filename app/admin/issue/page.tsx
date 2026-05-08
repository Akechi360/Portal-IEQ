"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { AccessRole } from "@/types";

const roleOptions = [
  { label: "Paciente", value: "paciente" },
  { label: "Transito", value: "transito" },
  { label: "Medico", value: "medico" },
  { label: "Gerencia", value: "gerencia" }
];

export default function AdminIssuePage() {
  const [role, setRole] = useState<AccessRole>("paciente");
  const [doctorInDb, setDoctorInDb] = useState(true);
  const [resultVisible, setResultVisible] = useState(false);
  const [maxDevices, setMaxDevices] = useState(3);

  const duration = useMemo(() => {
    if (role === "paciente") return "2 dias + 2 h adicionales";
    if (role === "transito") return "30 minutos";
    return "Permanente";
  }, [role]);

  const roleDescription = useMemo(() => {
    if (role === "paciente") {
      return 'Estas creando un acceso de tipo "Paciente". Valido segun estancia + 2 horas adicionales. Hasta 4 dispositivos.';
    }
    if (role === "transito") {
      return 'Estas creando un acceso de tipo "Transito". Valido 30 minutos para 1 dispositivo.';
    }
    if (role === "medico") {
      return 'Estas creando un acceso de tipo "Medico". Acceso permanente.';
    }
    return 'Estas creando un acceso de tipo "Gerencia". Acceso permanente, no expira.';
  }, [role]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <header>
          <h1 className="text-xl font-bold text-gray-900">Emision de credenciales de WiFi</h1>
          <p className="text-sm text-gray-600">Cree acceso para pacientes, visitantes, medicos o gerencia.</p>
        </header>

        <Card>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              setResultVisible(true);
            }}
          >
            <div>
              <Select
                label="Selector de tipo de usuario"
                options={roleOptions}
                value={role}
                onChange={(event) => setRole(event.target.value as AccessRole)}
                className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-2 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-800">{roleDescription}</div>
            </div>

            <Input
              label="Nombre de la persona"
              placeholder="Nombre completo"
              required
              className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <Input
              label="Usuario/MAC objetivo (opcional)"
              placeholder="Ej. 44:11:AA:2B:90:21 o usuario_xxx"
              className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />

            {role === "paciente" ? (
              <div className="space-y-3 rounded-md border border-gray-200 bg-white p-3">
                <Input
                  label="Habitacion / area"
                  placeholder="Ej. H-204, Urgencias"
                  className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <Input
                  label="Dias de estancia"
                  type="number"
                  min={1}
                  placeholder="Ej. 2"
                  className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-600">X dias de estancia + 2 horas adicionales.</p>
              </div>
            ) : null}

            {role === "medico" ? (
              <div className="space-y-3 rounded-md border border-gray-200 bg-white p-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={doctorInDb}
                    onChange={(e) => setDoctorInDb(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  El medico ya esta en la base de datos
                </label>
                {!doctorInDb ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input label="Nombre" placeholder="Dr. Nombre Apellido" required className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" />
                    <Input label="Especialidad" placeholder="Cardiologia, Pediatria, etc." required className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" />
                    <Input label="Telefono" placeholder="+58..." required className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" />
                    <Input label="Correo" type="email" placeholder="doctor@correo.com" required className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" />
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Se usara el correo existente para generar la credencial.</p>
                )}
              </div>
            ) : null}

            <div>
              <Input
                label="Maximo de dispositivos (1-5)"
                type="number"
                min={1}
                max={5}
                value={maxDevices}
                onChange={(event) => setMaxDevices(Number(event.target.value))}
                required
                className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-600">Numero maximo de dispositivos que puede usar este token.</p>
            </div>

            <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">
              Generar credencial
            </Button>
          </form>
        </Card>

        <Card>
          {resultVisible ? (
            <div className="mt-1 rounded-md border bg-white px-4 py-3 shadow-sm">
              <dl className="space-y-2">
                <div>
                  <dt className="text-xs text-gray-500">Usuario:</dt>
                  <dd className="text-sm font-medium text-gray-900">usuario_48319</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Token:</dt>
                  <dd className="text-sm font-mono text-gray-900">
                    <span className="rounded bg-gray-100 px-2 py-1">AB12-CD34-EF56</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Rol:</dt>
                  <dd className="text-sm capitalize text-gray-900">{role}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Duracion:</dt>
                  <dd className="text-sm text-gray-900">{duration}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Dispositivos maximos:</dt>
                  <dd className="text-sm text-gray-900">{maxDevices}</dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="rounded-md bg-gray-200 px-3 py-2 text-sm text-gray-800">
                  📋 Copiar token
                </button>
                <button type="button" className="rounded-md bg-gray-200 px-3 py-2 text-sm text-gray-800">
                  Guardar en PDF
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Completa el formulario y presiona Generar credencial.</p>
          )}
        </Card>
      </div>
    </main>
  );
}
