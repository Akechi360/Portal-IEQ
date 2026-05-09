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
    <main>
      <div className="mx-auto w-full max-w-md">
        <section className="glass-panel w-full overflow-hidden rounded-xl border border-white/60">
          <header className="border-b border-white/50 bg-white/35 px-4 py-4">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg">
              +++
            </div>
            <h1 className="text-xl font-bold text-neutral-900">WiFi Clinica IEQ</h1>
            <p className="text-xs text-neutral-500">Acceso para pacientes, visitantes, medicos y gerencia.</p>
          </header>

          <div className="space-y-4 px-4 py-5">
            <section className="glass-soft rounded-lg px-3 py-3 text-sm text-primary-700">
              <p className="font-semibold">Bienvenido al portal WiFi de la clinica.</p>
              <p className="mt-1 text-xs text-primary-700">
                Complete un unico paso para conectarse y continuar con su navegacion segura.
              </p>
            </section>

            <section aria-labelledby="formulario-acceso" className="space-y-3">
              <h2 id="formulario-acceso" className="text-lg font-bold text-neutral-900">
                Formulario de acceso
              </h2>
              <p className="text-sm text-neutral-500">
                Introduce el usuario y contrasena o token que te entrego Admision.
              </p>

              <form className="space-y-4" onSubmit={onSubmit}>
                <Input
                  label="Usuario / Token"
                  placeholder="usuario_XXXXX o token"
                  required
                  className="rounded-lg border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-300"
                />
                <Input
                  label="Contrasena (opcional)"
                  type="password"
                  placeholder="Si aplica para su acceso"
                  className="rounded-lg border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-300"
                />
                <Select
                  label="Tipo de acceso"
                  value={role}
                  onChange={(event) => setRole(event.target.value as AccessRole)}
                  className="rounded-lg border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-300"
                  options={[
                    { label: "Paciente", value: "paciente" },
                    { label: "Transito", value: "transito" },
                    { label: "Medico", value: "medico" },
                    { label: "Gerencia", value: "gerencia" }
                  ]}
                />

                {error ? (
                  <div className="flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-600" role="alert">
                    <span aria-hidden="true">⚠️</span>
                    <span>Acceso denegado: credencial invalida, expirada o no tiene sesion disponible.</span>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary-400 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : null}
                  {loading ? "Validando..." : "Acceder al WiFi"}
                </button>
              </form>
            </section>

            <section aria-labelledby="tipos-acceso" className="space-y-2">
              <h2 id="tipos-acceso" className="text-sm font-bold text-neutral-900">
                Que tipo de acceso necesitas?
              </h2>
              <div className="space-y-2">
                {(["paciente", "transito", "medico"] as const).map((roleKey) => {
                  const isSelected = role === roleKey;
                  return (
                    <article
                      key={roleKey}
                      className={`rounded-lg border p-3 text-sm ${
                        isSelected
                          ? "glass-soft border-primary-300 bg-primary-50/70"
                          : "glass-soft border-white/50"
                      }`}
                    >
                      <p className="font-semibold text-neutral-900">{roleHelp[roleKey].title}</p>
                      <p className="mt-1 text-xs text-neutral-500">{roleHelp[roleKey].description}</p>
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
