"use client";

import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/Input";

export default function DoctorPage() {
  const [isNew, setIsNew] = useState(false);
  const [step, setStep] = useState<"form" | "validating" | "success">("form");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStep("validating");
    await new Promise((resolve) => setTimeout(resolve, 900));
    setStep("success");
  };

  return (
    <main>
      <div className="mx-auto w-full max-w-lg">
        <section className="glass-panel w-full rounded-xl border border-white/60 p-6">
          <header className="mb-4">
            <h1 className="text-xl font-bold text-neutral-900">Acceso WiFi para Medicos</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Registra o valida tu correo para obtener acceso permanente al WiFi de la clinica.
            </p>
          </header>

          {step === "form" ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="glass-soft rounded-lg border border-white/50 p-4">
                <h2 className="text-sm font-semibold text-neutral-900">Paso 1: Validacion de correo</h2>
                <div className="mt-3">
                  <Input
                    label="Correo electronico"
                    type="email"
                    placeholder="doctor@clinica.com"
                    required
                    className="rounded-lg border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-300"
                  />
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    checked={isNew}
                    onChange={(event) => setIsNew(event.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-300"
                  />
                  Soy nuevo medico (no estoy en la base de datos)
                </label>
              </div>

              {isNew ? (
                <div className="glass-soft rounded-lg border border-white/50 p-4">
                  <h2 className="text-sm font-semibold text-neutral-900">Paso 2: Crear cuenta de medico</h2>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <Input label="Nombre completo" required className="rounded-lg border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-300" />
                    <Input label="Especialidad" required className="rounded-lg border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-300" />
                    <Input label="Telefono" required className="rounded-lg border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-300" />
                    <Input label="Correo" type="email" required className="rounded-lg border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-300" />
                  </div>
                  <button
                    type="submit"
                    className="mt-4 w-full rounded-lg bg-primary-400 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-primary-500"
                  >
                    Crear cuenta de medico
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary-400 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-primary-500"
                >
                  Validar acceso
                </button>
              )}
            </form>
          ) : null}

          {step === "validating" ? (
            <div className="glass-soft rounded-lg px-3 py-3 text-sm text-neutral-700">
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-500 border-t-transparent" />
                <span>Validando...</span>
              </div>
            </div>
          ) : null}

          {step === "success" ? (
            <div className="rounded-lg bg-accent-light px-3 py-2 text-sm text-accent-dark">
              !Bienvenido Dr. Martinez! Ahora puede usar el WiFi de la clinica cada vez que visite nuestras instalaciones.
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
