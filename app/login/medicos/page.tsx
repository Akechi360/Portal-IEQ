<<<<<<< HEAD
// ⚠️ LEGACY — DEPRECATED
// Esta ruta está obsoleta. El portal público consolidado ahora vive en /login
// Fecha de deprecación: 2026-05-11
// TODO: Eliminar en una versión futura cuando se confirme que no hay dependencias

import { redirect } from "next/navigation";

export default function MedicosLoginPageLegacy() {
  // Redirigir permanentemente al nuevo portal único
  redirect("/login");
=======
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, AlertCircle, ArrowRight, ChevronLeft } from "lucide-react";
import { LoginLayout } from "@/components/login/LoginLayout";

export default function MedicosLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "not_found" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === "" || !email.includes("@")) return;

    setStatus("loading");

    // Simular llamada a API
    await new Promise((r) => setTimeout(r, 1500));

    // Lógica mock: si termina en @ieq.com es válido
    if (email.trim().toLowerCase().endsWith("@ieq.com")) {
      router.push(
        "/login/success?ssid=medicos&plan=Medico&nombre=Dr.+García&timeLeft=permanente"
      );
    } else {
      setStatus("not_found");
    }
  };

  const leftFeatures: Array<{ icon: "shield" | "zap" | "clock" | "infinity" | "users"; bold: string; text: string }> = [
    { icon: "infinity", bold: "Acceso permanente", text: "sin límite de tiempo" },
    { icon: "zap", bold: "Alta velocidad", text: "hasta 500 Mbps" },
    { icon: "shield", bold: "Red segura", text: "cifrado WPA3 institucional" },
  ];

  return (
    <LoginLayout
      leftColor="#0C2D5C"
      leftTitle="Acceso para\npersonal médico IEQ"
      leftDescription="Red exclusiva para médicos de la clínica. Ingresa tu correo para verificar tu acceso permanente."
      leftFeatures={leftFeatures}
      badgeSSID="IEQ-MEDICOS"
    >
      <div className="max-w-sm w-full mx-auto">
        <h2 className="text-2xl font-bold text-gray-900">Acceso médico</h2>
        <p className="text-sm text-gray-500 mt-1 mb-8">Ingresa tu correo institucional para conectarte</p>

        <form onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dr.apellido@ieq.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>

          {status === "not_found" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-3 flex items-start gap-3">
              <AlertCircle className="text-amber-500 shrink-0 h-[18px] w-[18px]" />
              <div>
                <p className="text-sm text-amber-800 font-medium">
                  Tu correo no está registrado como médico de la clínica.
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Para obtener acceso, comunícate con el departamento de Sistemas.
                </p>
                <p className="text-xs text-amber-700 font-semibold mt-2">
                  📞 Extensión 101 — Departamento de Sistemas
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-3 flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 h-[18px] w-[18px]" />
              <div>
                <p className="text-sm text-red-700 font-medium">
                  Ocurrió un error al verificar tu correo. Intenta de nuevo.
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full mt-6 py-3 rounded-xl font-semibold text-sm bg-sky-500 hover:bg-sky-600 text-white disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {status === "loading" ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Verificando...
              </>
            ) : (
              <>
                Verificar y conectar
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.push("/login/guest")}
          className="mt-6 w-full text-center text-sm text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver al acceso general
        </button>

        <div className="mt-8 w-full flex items-center justify-center gap-2 bg-green-50 border border-green-100 rounded-xl py-2.5 px-4">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-500">
            Red disponible &middot;{" "}
            <span className="font-semibold text-green-600 text-xs">IEQ-MEDICOS</span>
          </span>
        </div>
      </div>
    </LoginLayout>
  );
>>>>>>> 53f8a2c92a064c1299ac43fdff28034dd65a9b27
}
