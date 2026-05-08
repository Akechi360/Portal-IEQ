"use client";

import { FormEvent, useState } from "react";
import { AccessRole } from "@/types";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const roleHelp: Record<AccessRole, { title: string; description: string }> = {
  paciente: {
    title: "Paciente",
    description: "Valido durante la estancia + 2 horas adicionales. Hasta 4 dispositivos."
  },
  transito: {
    title: "Transito",
    description: "Acceso de 30 minutos para 1 dispositivo."
  },
  medico: {
    title: "Medico",
    description: "Acceso permanente, reutilizable cada vez que venga a la clinica."
  },
  gerencia: {
    title: "Gerencia",
    description: "Acceso permanente para personal de gerencia."
  }
};

interface GuestPortalClientProps {
  placeholders: {
    client_mac: string;
    ap_mac: string;
    ssid: string;
    redirect: string;
  };
}

async function fakeLogin(redirect?: string) {
  await new Promise((resolve) => setTimeout(resolve, 900));
  return { ok: true, nextUrl: redirect ?? "/admin/dashboard" };
}

export function GuestPortalClient({ placeholders }: GuestPortalClientProps) {
  const [role, setRole] = useState<AccessRole>("paciente");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const response = await fakeLogin(placeholders.redirect);
    setLoading(false);
    if (!response.ok) {
      setError("Acceso denegado: credencial invalida o expirada");
      return;
    }
    window.location.href = response.nextUrl;
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md items-center justify-center">
        <section className="w-full overflow-hidden rounded-xl bg-white shadow-sm">
          <header className="border-b border-gray-200 bg-blue-50 px-4 py-4">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg">
              +++
            </div>
            <h1 className="text-xl font-bold text-gray-900">WiFi Clinica IEQ</h1>
            <p className="text-xs text-gray-600">Acceso para pacientes, visitantes, medicos y gerencia.</p>
          </header>

          <div className="space-y-4 px-4 py-5">
            <section className="rounded-md bg-blue-50 px-3 py-3 text-sm text-blue-800">
              <p className="font-semibold">Bienvenido al portal WiFi de la clinica.</p>
              <p className="mt-1 text-xs text-blue-800">
                Complete un unico paso para conectarse y continuar con su navegacion segura.
              </p>
            </section>

            <section aria-labelledby="formulario-acceso" className="space-y-3">
              <h2 id="formulario-acceso" className="text-lg font-bold text-gray-900">
                Formulario de acceso
              </h2>
              <p className="text-sm text-gray-600">
                Introduce el usuario y contrasena o token que te entrego Admision.
              </p>

              <form className="space-y-4" onSubmit={onSubmit}>
                <Input
                  label="Usuario / Token"
                  placeholder="usuario_XXXXX o token"
                  required
                  className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <Input
                  label="Contrasena (opcional)"
                  type="password"
                  placeholder="Si aplica para su acceso"
                  className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <Select
                  label="Tipo de acceso"
                  value={role}
                  onChange={(event) => setRole(event.target.value as AccessRole)}
                  className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  options={[
                    { label: "Paciente", value: "paciente" },
                    { label: "Transito", value: "transito" },
                    { label: "Medico", value: "medico" },
                    { label: "Gerencia", value: "gerencia" }
                  ]}
                />

                {error ? (
                  <div className="flex items-center gap-2 rounded-md bg-red-100 px-3 py-2 text-sm text-red-800" role="alert">
                    <span aria-hidden="true">⚠️</span>
                    <span>Acceso denegado: credencial invalida, expirada o no tiene sesion disponible.</span>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : null}
                  {loading ? "Validando..." : "Acceder al WiFi"}
                </button>
              </form>
            </section>

            <section aria-labelledby="tipos-acceso" className="space-y-2">
              <h2 id="tipos-acceso" className="text-sm font-bold text-gray-900">
                Que tipo de acceso necesitas?
              </h2>
              <div className="space-y-2">
                {(["paciente", "transito", "medico"] as const).map((roleKey) => {
                  const isSelected = role === roleKey;
                  return (
                    <article
                      key={roleKey}
                      className={`rounded-md border p-3 text-sm shadow-sm ${
                        isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"
                      }`}
                    >
                      <p className="font-semibold text-gray-900">{roleHelp[roleKey].title}</p>
                      <p className="mt-1 text-xs text-gray-600">{roleHelp[roleKey].description}</p>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
