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
    <main className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-lg items-center justify-center">
        <section className="w-full rounded-lg bg-white p-5 shadow-sm">
          <header className="mb-4">
            <h1 className="text-xl font-bold text-gray-900">Acceso WiFi para Medicos</h1>
            <p className="mt-1 text-sm text-gray-600">
              Registra o valida tu correo para obtener acceso permanente al WiFi de la clinica.
            </p>
          </header>

          {step === "form" ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="rounded-md border bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-900">Paso 1: Validacion de correo</h2>
                <div className="mt-3">
                  <Input
                    label="Correo electronico"
                    type="email"
                    placeholder="doctor@clinica.com"
                    required
                    className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={isNew}
                    onChange={(event) => setIsNew(event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Soy nuevo medico (no estoy en la base de datos)
                </label>
              </div>

              {isNew ? (
                <div className="rounded-md border bg-white p-4 shadow-sm">
                  <h2 className="text-sm font-semibold text-gray-900">Paso 2: Crear cuenta de medico</h2>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <Input label="Nombre completo" required className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" />
                    <Input label="Especialidad" required className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" />
                    <Input label="Telefono" required className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" />
                    <Input label="Correo" type="email" required className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <button
                    type="submit"
                    className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    Crear cuenta de medico
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Validar acceso
                </button>
              )}
            </form>
          ) : null}

          {step === "validating" ? (
            <div className="rounded-md bg-gray-50 px-3 py-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent" />
                <span>Validando...</span>
              </div>
            </div>
          ) : null}

          {step === "success" ? (
            <div className="rounded-md bg-green-100 px-3 py-2 text-sm text-green-800">
              !Bienvenido Dr. Martinez! Ahora puede usar el WiFi de la clinica cada vez que visite nuestras instalaciones.
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
